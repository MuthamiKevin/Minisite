import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { getSheetsContext, readColumnA, writeHeaderIfEmpty, appendRow } from "../lib/sheets";

const MESSAGES_HEADER = ["Name", "Blessing", "Song", "Submitted At"];

type MessageRow = { name: string; blessing: string; song: string; submittedAt: string };

async function syncMessageToSheet(row: MessageRow) {
  const ctx = await getSheetsContext();
  if (!ctx) return; // Google Sheets sync not configured yet.

  // Messages get their own tab so the guest list stays clean. Each submission is
  // its own entry — unlike RSVPs there's no code to match on, so always append.
  const tab = process.env.GOOGLE_SHEET_MESSAGES_TAB ?? "Messages";
  const existing = await readColumnA(ctx, tab);
  await writeHeaderIfEmpty(ctx, tab, existing, MESSAGES_HEADER);
  await appendRow(ctx, tab, [row.name, row.blessing, row.song, row.submittedAt]);
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const blessing = typeof body.blessing === "string" ? body.blessing.trim() : "";
  const song = typeof body.song === "string" ? body.song.trim() : "";

  if (!blessing && !song) {
    return Response.json({ error: "Please leave a blessing or a song request." }, { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase.from("guest_messages").insert({
    name: name || null, blessing: blessing || null, song: song || null,
  });
  if (error) {
    console.error("Guestbook insert failed", error);
    return Response.json({ error: "Unable to save your message." }, { status: 500 });
  }

  try {
    await syncMessageToSheet({ name, blessing, song, submittedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Google Sheets message sync failed", err);
    // The message is already saved in Supabase — the sheet just won't show it yet,
    // so don't fail the request and make the guest think their message was lost.
  }

  return Response.json({ ok: true }, { status: 201 });
};

export const config: Config = { path: "/api/guestbook" };
