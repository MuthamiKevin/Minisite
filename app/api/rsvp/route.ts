import { getDb } from "../../../db";
import { rsvps } from "../../../db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    const name = body.name?.trim(); const contact = body.contact?.trim(); const attendance = body.attendance;
    if (!name || !contact || !["attending", "declined"].includes(attendance)) return Response.json({error:"Please complete the required fields."},{status:400});
    const [rsvp] = await getDb().insert(rsvps).values({ name, contact, attendance, guestCount: Math.min(10, Math.max(1, Number(body.guestCount)||1)), blessing: body.blessing?.trim(), song: body.song?.trim() }).returning({id:rsvps.id});
    return Response.json({rsvp},{status:201});
  } catch (error) {
    console.error("RSVP submission failed", error);
    return Response.json({error:"Unable to save RSVP."},{status:500});
  }
}
