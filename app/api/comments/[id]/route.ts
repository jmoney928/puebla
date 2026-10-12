import { db, guard, json, fail } from "@/lib/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const { id } = await params;
  const { data } = await db().from("comments").select("author").eq("id", id).maybeSingle();
  if (!data) return fail("That comment doesn’t exist anymore.", 404);
  if (data.author !== g.user) return fail("You can only delete your own comments.", 403);
  const { error } = await db().from("comments").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return json({ ok: true });
}
