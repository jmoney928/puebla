import { db, guard, json, fail, clean, BUCKET } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

async function own(id: string, user: string) {
  const { data, error } = await db().from("entries").select("id, author, photos").eq("id", id).maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) return fail("That entry doesn’t exist anymore.", 404);
  if (data.author !== user) return fail("You can only change your own entries.", 403);
  return data as { id: string; author: string; photos: string[] };
}

export async function PATCH(req: Request, { params }: Ctx) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const { id } = await params;
  const entry = await own(id, g.user);
  if (entry instanceof Response) return entry;
  const input = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input.body === "string") update.body = clean(input.body, 20000);
  if (Array.isArray(input.photos)) {
    const keep = input.photos.filter((p: unknown) => typeof p === "string" && p.startsWith(`${g.user}/`)).slice(0, 30) as string[];
    const removed = entry.photos.filter((p) => !keep.includes(p));
    if (removed.length) await db().storage.from(BUCKET).remove(removed);
    update.photos = keep;
  }
  const { data, error } = await db().from("entries").update(update).eq("id", id).select().single();
  if (error) return fail(error.message, 500);
  return json(data);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const { id } = await params;
  const entry = await own(id, g.user);
  if (entry instanceof Response) return entry;
  if (entry.photos.length) await db().storage.from(BUCKET).remove(entry.photos);
  const { error } = await db().from("entries").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return json({ ok: true });
}
