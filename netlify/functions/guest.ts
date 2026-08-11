import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) return Response.json({ error: "Missing code." }, { status: 400 });

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: guest, error } = await supabase
    .from("guests")
    .select("family_name, allowed_adults, allowed_children, rsvp_status, rsvp_adults, rsvp_children, rsvp_email, rsvp_phone")
    .eq("code", code)
    .maybeSingle();

  if (error || !guest) return Response.json({ error: "Invitation not found." }, { status: 404 });

  return Response.json({
    familyName: guest.family_name,
    allowedAdults: guest.allowed_adults,
    allowedChildren: guest.allowed_children,
    rsvpStatus: guest.rsvp_status,
    rsvpAdults: guest.rsvp_adults,
    rsvpChildren: guest.rsvp_children,
    rsvpEmail: guest.rsvp_email,
    rsvpPhone: guest.rsvp_phone,
  });
};

export const config: Config = { path: "/api/guest" };
