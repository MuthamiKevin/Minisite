import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getSheetsContext, readColumnA, writeHeaderIfEmpty, appendRow, updateRow } from '../lib/sheets';

type SheetRow = {
  code: string; familyName: string; allowedAdults: number; allowedChildren: number;
  status: string; adults: number; children: number; email: string; phone: string; rsvpAt: string;
};

const GUESTS_HEADER = ['Code', 'Name', 'Allowed Adults', 'Allowed Children', 'Status', 'Adults', 'Children', 'Email', 'Phone', 'RSVP At'];

async function syncToGoogleSheet(row: SheetRow) {
  const ctx = await getSheetsContext();
  if (!ctx) return; // Google Sheets sync not configured yet.

  const tab = process.env.GOOGLE_SHEET_TAB ?? 'Guests';
  const existing = await readColumnA(ctx, tab);
  await writeHeaderIfEmpty(ctx, tab, existing, GUESTS_HEADER);

  const values = [row.code, row.familyName, row.allowedAdults, row.allowedChildren, row.status, row.adults, row.children, row.email, row.phone, row.rsvpAt];
  const rowIndex = existing.findIndex((r) => r[0] === row.code);

  // A known code updates its own row so re-submissions don't pile up duplicates.
  if (rowIndex >= 0) await updateRow(ctx, tab, rowIndex + 1, values);
  else await appendRow(ctx, tab, values);
}

const PUBLIC_MAX_ADULTS = 4;
const PUBLIC_MAX_CHILDREN = 3;
const TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateToken(): string {
  let token = "";
  for (let i = 0; i < 6; i++) token += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  return token;
}

type GuestRow = { code: string; family_name: string; allowed_adults: number; allowed_children: number };

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const attendance = body.attendance;

  if (!email || (attendance !== "attending" && attendance !== "declined")) {
    return Response.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  let guest: GuestRow | null = null;

  // A code means this came from a personalized /invite/CODE link (if that feature is ever
  // reactivated) — otherwise this is a public RSVP and we create a fresh guest record.
  if (code) {
    const { data } = await supabase.from("guests").select("code, family_name, allowed_adults, allowed_children").eq("code", code).maybeSingle();
    guest = data;
  }

  if (!guest) {
    if (!name) return Response.json({ error: "Please tell us your name." }, { status: 400 });

    let newCode = generateToken();
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: existing } = await supabase.from("guests").select("id").eq("code", newCode).maybeSingle();
      if (!existing) break;
      newCode = generateToken();
    }

    const { data: inserted, error: insertError } = await supabase
      .from("guests")
      .insert({ code: newCode, family_name: name, allowed_adults: PUBLIC_MAX_ADULTS, allowed_children: PUBLIC_MAX_CHILDREN })
      .select("code, family_name, allowed_adults, allowed_children")
      .single();

    if (insertError || !inserted) {
      console.error("Guest creation failed", insertError);
      return Response.json({ error: "Unable to save RSVP." }, { status: 500 });
    }
    guest = inserted;
  }

  const adults = attendance === "attending" ? Math.min(guest.allowed_adults, Math.max(1, Number(body.adults) || 1)) : 0;
  const children = attendance === "attending" ? Math.min(guest.allowed_children, Math.max(0, Number(body.children) || 0)) : 0;

  const { error: updateError } = await supabase
    .from("guests")
    .update({ rsvp_status: attendance, rsvp_adults: adults, rsvp_children: children, rsvp_email: email, rsvp_phone: phone || null, rsvp_at: new Date().toISOString() })
    .eq("code", guest.code);

  if (updateError) {
    console.error("RSVP update failed", updateError);
    return Response.json({ error: "Unable to save RSVP." }, { status: 500 });
  }

  try {
    await syncToGoogleSheet({
      code: guest.code, familyName: guest.family_name, allowedAdults: guest.allowed_adults, allowedChildren: guest.allowed_children,
      status: attendance, adults, children, email, phone, rsvpAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Google Sheets sync failed", err);
    // RSVP is already saved in Supabase — the sheet just won't reflect it yet, so don't fail the request.
  }

  return Response.json({ ok: true, code: guest.code }, { status: 201 });
};

export const config: Config = { path: "/api/rsvp" };
