import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

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

  return Response.json({ ok: true }, { status: 201 });
};

export const config: Config = { path: "/api/guestbook" };
