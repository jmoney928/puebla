import { fail, guard, json, mutate, present } from "@/lib/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const { id } = await params;
  const out = await mutate((j) => {
    const c = j.comments.find((x) => x.id === id);
    if (!c) return fail("That comment doesn’t exist anymore.", 404);
    if (c.author !== g.user) return fail("You can only delete your own comments.", 403);
    j.comments = j.comments.filter((x) => x.id !== id);
  });
  if (out instanceof Response) return out;
  return json(present(out.data));
}
