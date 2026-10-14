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
    j.comments.push({ id: randomUUID(), entry_id: input.entry_id, name, body, created_at: new Date().toISOString() });
  });
  if (out instanceof Response) return out;
  return json(present(out.data), 201);
}
