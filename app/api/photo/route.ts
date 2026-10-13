import { get } from "@vercel/blob";
import { currentUser } from "@/lib/server";

// Streams a private photo to signed-in members. Photo files never change, so browsers can keep them for a year.
export async function GET(req: Request) {
  if (!currentUser(req)) return new Response("Sign in first.", { status: 401 });
  const path = new URL(req.url).searchParams.get("p");
  if (!path || !path.startsWith("photos/") || path.includes("..")) return new Response("Not found", { status: 404 });
  const res = await get(path, { access: "private" });
  if (!res || res.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
