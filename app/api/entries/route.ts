import { randomUUID } from "node:crypto";
import { AUTHOR, clean, fail, guardAdmin, json, mutate, present } from "@/lib/server";
import { isTripDay } from "@/lib/people";
import { MAX_VIDEOS_PER_POST, isMediaPath, isVideoPath } from "@/lib/media";
import { readSections } from "@/lib/sections";

export async function POST(req: Request) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const input = await req.json().catch(() => ({}));
  const title = clean(input.title, 140);
  const body = clean(input.body, 20000);
  const day = input.day;
  const photos: string[] = Array.isArray(input.photos) ? input.photos.filter(isMediaPath).slice(0, 30) : [];
  if (photos.filter(isVideoPath).length > MAX_VIDEOS_PER_POST) return fail(`Up to ${MAX_VIDEOS_PER_POST} videos per post.`);
  const sections = readSections(input.sections);
  if (typeof sections === "string") return fail(sections);
  if (!isTripDay(day)) return fail("Pick a trip day.");
  if (!title && !body && photos.length === 0 && sections.length === 0) return fail("Write something or add a photo or video.");
  const now = new Date().toISOString();
  const out = await mutate((j) => {
    j.entries.push({ id: randomUUID(), author: AUTHOR, day, title, body, photos, sections, created_at: now, updated_at: now });
  });
  if (out instanceof Response) return out;
  return json(present(out.data), 201);
}
