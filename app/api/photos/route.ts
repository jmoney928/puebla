import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { fail, guardAdmin, json, photoUrl } from "@/lib/server";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Upload one photo (the phone shrinks it first, so it stays well under Vercel's 4.5 MB request limit).
export async function POST(req: Request) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("No photo attached.");
  const ext = TYPES[file.type];
  if (!ext) return fail("That photo format isn’t supported. Try a JPG or PNG.");
  if (file.size > 4_000_000) return fail("That photo is too big. Try a smaller one.");
  const path = `photos/${randomUUID()}.${ext}`;
  await put(path, file, { access: "private", contentType: file.type, addRandomSuffix: false });
  return json({ path, url: photoUrl(path) }, 201);
}
