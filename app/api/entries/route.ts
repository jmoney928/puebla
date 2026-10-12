import { db, guard, json, fail, clean } from "@/lib/server";
import { isTripDay } from "@/lib/people";

export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const input = await req.json().catch(() => ({}));
  const body = clean(input.body, 20000);
  const day = input.day;
  const photos: string[] = Array.isArray(input.photos) ? input.photos.filter((p: unknown) => typeof p === "string" && p.startsWith(`${g.user}/`)).slice(0, 30) : [];
  if (!isTripDay(day)) return fail("Pick a trip day.");
  if (!body && photos.length === 0) return fail("Write something or add a photo.");
  const { data, error } = await db().from("entries").insert({ author: g.user, day, body, photos }).select().single();
  if (error) return fail(error.message, 500);
  return json(data, 201);
}
