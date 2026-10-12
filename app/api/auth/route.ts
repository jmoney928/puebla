import { guard, json } from "@/lib/server";

export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  return json({ ok: true, user: g.user });
}
