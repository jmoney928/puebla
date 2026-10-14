import { get } from "@vercel/blob";

// Streams a photo from the private Blob store. Photo files never change, so browsers and the CDN can keep them for a year.
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get("p");
  if (!path || !path.startsWith("photos/") || path.includes("..")) return new Response("Not found", { status: 404 });
  const res = await get(path, { access: "private" });
  if (!res || res.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
