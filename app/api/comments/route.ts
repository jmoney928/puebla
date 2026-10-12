import { db, guard, json, fail, clean } from "@/lib/server";

export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const input = await req.json().catch(() => ({}));
  const body = clean(input.body, 2000);
  if (!body) return fail("Write a comment first.");
  if (typeof input.entry_id !== "string") return fail("Missing entry.");
  const { data, error } = await db().from("comments").insert({ entry_id: input.entry_id, author: g.user, body }).select().single();
  if (error) return fail(error.message, 500);
  return json(data, 201);
}
