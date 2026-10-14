import { randomUUID } from "node:crypto";
import { AUTHOR, clean, fail, guardAdmin, json, mutate, present } from "@/lib/server";
import { isTripDay } from "@/lib/people";

export async function POST(req: Request) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const input = await req.json().catch(() => ({}));
  const title = clean(input.title, 140);
  const body = clean(input.body, 20000);
  const day = input.day;
  const photos: string[] = Array.isArray(input.photos)
    ? input.photos.filter((p: unknown) => typeof p === "string" && p.startsWith("photos/")).slice(0, 30)
    : [];
  if (!isTripDay(day)) return fail("Pick a trip day.");
  if (!title && !body && photos.length === 0) return fail("Write something or add a photo.");
  const now = new Date().toISOString();
  const out = await mutate((j) => {
    j.entries.push({ id: randomUUID(), author: AUTHOR, day, title, body, photos, created_at: now, updated_at: now });
  });
  if (out instanceof Response) return out;
  return json(present(out.data), 201);
}
