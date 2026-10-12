import { db, guard, json, fail, BUCKET, publicUrl } from "@/lib/server";

// Hands the browser a one-time signed upload URL so photos go straight to Supabase Storage
// (Vercel functions cap request bodies at ~4.5 MB, so photos never pass through here).
export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const path = `${g.user}/${crypto.randomUUID()}.jpg`;
  const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return fail(error.message, 500);
  return json({ path, token: data.token, url: publicUrl(path) });
}
