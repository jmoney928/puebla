import { randomUUID } from "node:crypto";
import { clean, fail, json, mutate, present } from "@/lib/server";

// Public: anyone can comment with a name.
export async function POST(req: Request) {
  const input = await req.json().catch(() => ({}));
  if (input.website) return json({ ok: true }, 201); // honeypot: bots fill hidden fields
  const name = clean(input.name, 40);
  const body = clean(input.body, 1000);
  if (!name) return fail("Add your name.");
  if (!body) return fail("Write a comment first.");
  const out = await mutate((j) => {
    if (!j.entries.some((e) => e.id === input.entry_id)) return fail("That post doesn’t exist anymore.", 404);
    let parent_id: string | undefined;
    if (input.parent_id) {
      const parent = j.comments.find((c) => c.id === input.parent_id && c.entry_id === input.entry_id);
      if (!parent) return fail("That comment doesn’t exist anymore.", 404);
      parent_id = parent.parent_id ?? parent.id; // replies stay one level deep
    }
    j.comments.push({ id: randomUUID(), entry_id: input.entry_id, ...(parent_id ? { parent_id } : {}), name, body, created_at: new Date().toISOString() });
  });
  if (out instanceof Response) return out;
  return json(present(out.data), 201);
}
