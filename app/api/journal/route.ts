import { db, guard, json, fail, publicUrl } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const [entries, comments] = await Promise.all([
    db().from("entries").select("*").order("created_at", { ascending: true }),
    db().from("comments").select("*").order("created_at", { ascending: true }),
  ]);
  if (entries.error || comments.error) return fail((entries.error ?? comments.error)!.message, 500);
  return json({
    entries: entries.data.map((e) => ({ ...e, photos: (e.photos as string[]).map((p) => ({ path: p, url: publicUrl(p) })) })),
    comments: comments.data,
  });
}
