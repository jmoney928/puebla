import { del } from "@vercel/blob";
import { clean, fail, guardAdmin, json, mutate, present } from "@/lib/server";
import { isTripDay } from "@/lib/people";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  let removed: string[] = [];
  const out = await mutate((j) => {
    const e = j.entries.find((x) => x.id === id);
    if (!e) return fail("That post doesn’t exist anymore.", 404);
    if (typeof input.title === "string") e.title = clean(input.title, 140);
    if (typeof input.body === "string") e.body = clean(input.body, 20000);
    if (isTripDay(input.day)) e.day = input.day;
    if (Array.isArray(input.photos)) {
      const keep = input.photos.filter((p: unknown) => typeof p === "string" && p.startsWith("photos/")).slice(0, 30) as string[];
      removed = e.photos.filter((p) => !keep.includes(p));
      e.photos = keep;
    }
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
    photos = e.photos;
    j.entries = j.entries.filter((x) => x.id !== id);
    j.comments.filter((c) => c.entry_id === id).forEach((c) => delete j.reactions[c.id]);
    delete j.reactions[id];
    j.comments = j.comments.filter((c) => c.entry_id !== id);
  });
  if (out instanceof Response) return out;
  if (photos.length) await del(photos).catch(() => {});
  return json(present(out.data));
}
