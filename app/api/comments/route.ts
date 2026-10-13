import { randomUUID } from "node:crypto";
import { clean, fail, guard, json, mutate, present } from "@/lib/server";

export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const input = await req.json().catch(() => ({}));
  const body = clean(input.body, 2000);
  if (!body) return fail("Write a comment first.");
  const out = await mutate((j) => {
    if (!j.entries.some((e) => e.id === input.entry_id)) return fail("That entry doesn’t exist anymore.", 404);
    j.comments.push({ id: randomUUID(), entry_id: input.entry_id, author: g.user, body, created_at: new Date().toISOString() });
  });
  if (out instanceof Response) return out;
  return json(present(out.data), 201);
}
