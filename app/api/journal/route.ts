import { guard, json, loadJournal, present } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  return json(present(await loadJournal()), 200, { "Cache-Control": "private, no-store" });
}
