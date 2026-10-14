"use client";
import type { Entry, Photo } from "@/lib/client";

/** One photo or video. Photos open the full-screen viewer; videos play in place. */
function Media({ p, onOpen }: { p: Photo; onOpen: (p: Photo) => void }) {
  if (p.video) {
    return (
      <div className="photo video">
        <video src={`${p.url}#t=0.1`} controls playsInline preload="metadata" />
      </div>
    );
  }
  return (
    <button type="button" className="photo" onClick={() => onOpen(p)} aria-label="Open photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.url} alt="" loading="lazy" />
    </button>
  );
}

function Group({ media, onOpen, legacy }: { media: Photo[]; onOpen: (p: Photo) => void; legacy?: boolean }) {
  const n = Math.min(media.length, legacy ? 3 : 4);
  return (
    <div className={`${legacy ? "photos" : "mgroup"} n${n}${media.length > 4 && !legacy ? " many" : ""}`}>
      {media.map((p) => <Media key={p.path} p={p} onOpen={onOpen} />)}
    </div>
  );
}

/**
 * The post itself, laid out like a magazine: the main story, then each moment with its
 * photos on one side and what was going on on the other (sides alternate; stacked on phones).
 */
export default function Story({ entry, onOpenPhoto }: { entry: Entry; onOpenPhoto: (urls: string[], index: number) => void }) {
  const images = [...entry.photos, ...entry.sections.flatMap((s) => s.media)].filter((p) => !p.video);
  const open = (p: Photo) => onOpenPhoto(images.map((x) => x.url), Math.max(0, images.findIndex((x) => x.path === p.path)));
  return (
    <>
      {entry.body && <p className="ebody">{entry.body}</p>}
      {entry.photos.length > 0 && <Group media={entry.photos} onOpen={open} legacy />}
      {entry.sections.length > 0 && (
        <div className="moments">
          {entry.sections.map((s, i) => {
            const kind = !s.media.length ? " textonly" : !s.text ? " mediaonly" : i % 2 ? " flip" : "";
            return (
              <section key={s.id} className={`moment${kind}`}>
                {s.media.length > 0 && <Group media={s.media} onOpen={open} />}
                {s.text && <p className="mtext">{s.text}</p>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
