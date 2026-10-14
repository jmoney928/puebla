import { fail, guardAdmin, json, mutate, present } from "@/lib/server";

// Jack can remove any comment.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const out = await mutate((j) => {
    if (!j.comments.some((x) => x.id === id)) return fail("That comment doesn’t exist anymore.", 404);
    j.comments = j.comments.filter((x) => x.id !== id);
  });
  if (out instanceof Response) return out;
  return json(present(out.data));
}
