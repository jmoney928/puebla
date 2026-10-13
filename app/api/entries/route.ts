import { randomUUID } from "node:crypto";
import { clean, fail, guard, json, mutate, present } from "@/lib/server";
import { isTripDay } from "@/lib/people";

export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const input = await req.json().catch(() => ({}));
  const body = clean(input.body, 20000);
  const day = input.day;
  const photos: string[] = Array.isArray(input.photos)
    ? input.photos.filter((p: unknown) => typeof p === "string" && p.startsWith(`photos/${g.user}/`)).slice(0, 30)
    : [];
  if (!isTripDay(day)) return fail("Pick a trip day.");
  if (!body && photos.length === 0) return fail("Write something or add a photo.");
  const now = new Date().toISOString();
  const out = await mutate((j) => {
    j.entries.push({ id: randomUUID(), author: g.user, day, body, photos, created_at: now, updated_at: now });
  });
  if (out instanceof Response) return out;
  return json(present(out.data), 201);
}
