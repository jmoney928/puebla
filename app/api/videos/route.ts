import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { fail, guardAdmin, json } from "@/lib/server";
import { MAX_VIDEO_BYTES, VIDEO_TYPES, VIDEO_UPLOAD_PATH } from "@/lib/media";

// Videos are too big to pass through the site (4.5 MB limit), so Jack's phone uploads them
// straight to the Blob store. This route only hands out a one-time upload token, and only to Jack.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return fail("Bad upload request.");
  if (body.type === "blob.generate-client-token") {
    const denied = guardAdmin(req);
    if (denied) return denied;
  }
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!VIDEO_UPLOAD_PATH.test(pathname)) throw new Error("Bad video name.");
        return {
          allowedContentTypes: Object.keys(VIDEO_TYPES),
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });
    return json(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Couldn’t start the upload.", 400);
  }
}
