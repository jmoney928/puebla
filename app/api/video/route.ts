import { get, issueSignedToken, presignUrl } from "@vercel/blob";
import { isMediaPath, isVideoPath } from "@/lib/media";

// Plays a video from the private Blob store. Normally the browser is sent to a short-lived
// signed link, so the video streams and seeks straight from Vercel's CDN. If signing isn't
// available, the video is streamed through here instead (with seeking support).

let signer: { token: Awaited<ReturnType<typeof issueSignedToken>>; until: number } | null = null;
async function signedToken() {
  const now = Date.now();
  if (signer && signer.until - now > 30 * 60_000) return signer.token;
  const token = await issueSignedToken({ pathname: "*", operations: ["get"], validUntil: now + 6 * 3600_000 });
  signer = { token, until: token.validUntil };
  return token;
}

export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get("p");
  if (!path || !isMediaPath(path) || !isVideoPath(path)) return new Response("Not found", { status: 404 });

  try {
    const token = await signedToken();
    const { presignedUrl } = await presignUrl(token, { operation: "get", pathname: path, access: "private", validUntil: Date.now() + 3 * 3600_000 });
    return new Response(null, { status: 302, headers: { Location: presignedUrl, "Cache-Control": "private, max-age=3600" } });
  } catch {
    // fall through to streaming
  }

  const range = req.headers.get("range");
  const res = await get(path, { access: "private", headers: range ? { Range: range } : undefined });
  if (!res || !res.stream) return new Response("Not found", { status: 404 });
  const h = new Headers({
    "Content-Type": res.blob.contentType ?? "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=86400",
    "X-Content-Type-Options": "nosniff",
  });
  const len = res.headers.get("content-length"), cr = res.headers.get("content-range");
  if (len) h.set("Content-Length", len);
  if (cr) h.set("Content-Range", cr);
  return new Response(res.stream, { status: cr ? 206 : 200, headers: h });
}
