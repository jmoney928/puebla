import { del } from "@vercel/blob";
import { allMedia, clean, fail, guardAdmin, json, mutate, present } from "@/lib/server";
import { readSections } from "@/lib/sections";
import { isTripDay } from "@/lib/people";
import { MAX_VIDEOS_PER_POST, isMediaPath, isVideoPath } from "@/lib/media";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  let removed: string[] = [];
  const sections = input.sections === undefined ? undefined : readSections(input.sections);
  if (typeof sections === "string") return fail(sections);
  const out = await mutate((j) => {
    const e = j.entries.find((x) => x.id === id);
    if (!e) return fail("That post doesn’t exist anymore.", 404);
    if (typeof input.title === "string") e.title = clean(input.title, 140);
    if (typeof input.body === "string") e.body = clean(input.body, 20000);
    if (isTripDay(input.day)) e.day = input.day;
    const before = allMedia(e);
    if (Array.isArray(input.photos)) {
      const keep = (input.photos.filter(isMediaPath) as string[]).slice(0, 30);
      if (keep.filter(isVideoPath).length > MAX_VIDEOS_PER_POST) return fail(`Up to ${MAX_VIDEOS_PER_POST} videos per post.`);
      e.photos = keep;
    }
    if (sections) {
      e.sections = sections;
      if (!Array.isArray(input.photos)) e.photos = []; // the editor moves old grid photos into a moment
    }
    const after = new Set(allMedia(e));
    removed = before.filter((p) => !after.has(p));
    e.updated_at = new Date().toISOString();
  });
  if (out instanceof Response) return out;
  if (removed.length) await del(removed).catch(() => {});
  return json(present(out.data));
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  let photos: string[] = [];
  const out = await mutate((j) => {
    const e = j.entries.find((x) => x.id === id);
    if (!e) return fail("That post doesn’t exist anymore.", 404);
    photos = allMedia(e);
    j.entries = j.entries.filter((x) => x.id !== id);
    j.comments.filter((c) => c.entry_id === id).forEach((c) => delete j.reactions[c.id]);
    delete j.reactions[id];
    j.comments = j.comments.filter((c) => c.entry_id !== id);
  });
  if (out instanceof Response) return out;
  if (photos.length) await del(photos).catch(() => {});
  return json(present(out.data));
}
