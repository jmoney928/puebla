import { fail, guardAdmin, json, mutate, present } from "@/lib/server";

// Jack can remove any comment (and its replies).
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const out = await mutate((j) => {
    if (!j.comments.some((x) => x.id === id)) return fail("That comment doesn’t exist anymore.", 404);
    const gone = new Set(j.comments.filter((x) => x.id === id || x.parent_id === id).map((x) => x.id));
    j.comments = j.comments.filter((x) => !gone.has(x.id)); // replies go with it
    gone.forEach((g) => delete j.reactions[g]);
  });
  if (out instanceof Response) return out;
  return json(present(out.data));
}
