import { json, loadJournal, present } from "@/lib/server";

export const dynamic = "force-dynamic";

// Public: everyone can read the blog.
export async function GET() {
  return json(present(await loadJournal()), 200, { "Cache-Control": "no-store" });
}
