import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { JWT } from "google-auth-library";

type SheetRow = {
  code: string; familyName: string; allowedAdults: number; allowedChildren: number;
  status: string; adults: number; children: number; email: string; phone: string; rsvpAt: string;
};

async function syncToGoogleSheet(row: SheetRow) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!sheetId || !serviceAccountEmail || !privateKey) return; // Google Sheets sync not configured yet.

  const tab = process.env.GOOGLE_SHEET_TAB ?? "Guests";
  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const { token } = await auth.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A:A`, { headers });
  if (!getRes.ok) throw new Error(`Google Sheets read failed: ${getRes.status} ${await getRes.text()}`);
  const { values }: { values?: string[][] } = await getRes.json();
  const rowIndex = (values ?? []).findIndex((r) => r[0] === row.code);

  const rowValues = [[row.code, row.familyName, row.allowedAdults, row.allowedChildren, row.status, row.adults, row.children, row.email, row.phone, row.rsvpAt]];

  if (rowIndex >= 0) {
    const rowNumber = rowIndex + 1;
    const putRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A${rowNumber}:J${rowNumber}?valueInputOption=USER_ENTERED`, {
      method: "PUT", headers, body: JSON.stringify({ values: rowValues }),
    });
    if (!putRes.ok) throw new Error(`Google Sheets update failed: ${putRes.status} ${await putRes.text()}`);
  } else {
    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A:J:append?valueInputOption=USER_ENTERED`, {
      method: "POST", headers, body: JSON.stringify({ values: rowValues }),
    });
    if (!appendRes.ok) throw new Error(`Google Sheets append failed: ${appendRes.status} ${await appendRes.text()}`);
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const attendance = body.attendance;

  if (!code || !email || (attendance !== "attending" && attendance !== "declined")) {
    return Response.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: guest, error: findError } = await supabase
    .from("guests")
    .select("family_name, allowed_adults, allowed_children")
    .eq("code", code)
    .maybeSingle();

  if (findError || !guest) return Response.json({ error: "Invitation not found." }, { status: 404 });

  const adults = attendance === "attending" ? Math.min(guest.allowed_adults, Math.max(1, Number(body.adults) || 1)) : 0;
  const children = attendance === "attending" ? Math.min(guest.allowed_children, Math.max(0, Number(body.children) || 0)) : 0;

  const { error: updateError } = await supabase
    .from("guests")
    .update({ rsvp_status: attendance, rsvp_adults: adults, rsvp_children: children, rsvp_email: email, rsvp_phone: phone || null, rsvp_at: new Date().toISOString() })
    .eq("code", code);

  if (updateError) {
    console.error("RSVP update failed", updateError);
    return Response.json({ error: "Unable to save RSVP." }, { status: 500 });
  }

  try {
    await syncToGoogleSheet({
      code, familyName: guest.family_name, allowedAdults: guest.allowed_adults, allowedChildren: guest.allowed_children,
      status: attendance, adults, children, email, phone, rsvpAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Google Sheets sync failed", err);
    // RSVP is already saved in Supabase — the sheet just won't reflect it yet, so don't fail the request.
  }

  return Response.json({ ok: true }, { status: 201 });
};

export const config: Config = { path: "/api/rsvp" };
