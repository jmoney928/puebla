import { randomUUID } from "node:crypto";
import { clean, type StoredSection } from "./server";
import { MAX_VIDEOS_PER_POST, isMediaPath, isVideoPath } from "./media";

export const MAX_SECTIONS = 24;
export const MAX_MEDIA_PER_SECTION = 12;

/** Clean up the moments sent from the editor. Returns an error message instead if something's off. */
export function readSections(input: unknown): StoredSection[] | string {
  if (!Array.isArray(input)) return [];
  const out: StoredSection[] = [];
  for (const raw of input.slice(0, MAX_SECTIONS)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as { id?: unknown; text?: unknown; media?: unknown };
    const text = clean(r.text, 6000);
    const media = Array.isArray(r.media) ? (r.media.filter(isMediaPath) as string[]).slice(0, MAX_MEDIA_PER_SECTION) : [];
    if (!text && !media.length) continue;
    const id = typeof r.id === "string" && /^[\w-]{6,40}$/.test(r.id) ? r.id : randomUUID();
    out.push({ id, text, media });
  }
  if (out.flatMap((s) => s.media).filter(isVideoPath).length > MAX_VIDEOS_PER_POST) return `Up to ${MAX_VIDEOS_PER_POST} videos per post.`;
  return out;
}
