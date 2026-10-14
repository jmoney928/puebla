"use client";
import { useEffect, useRef, useState } from "react";
import { uploadPhoto, uploadVideo, videoDuration, videoType, type Entry, type Photo } from "@/lib/client";
import { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, MAX_VIDEOS_PER_POST } from "@/lib/media";

/**
 * Editorial posts: a main story on top, then "moments" — a photo, a group of photos, or a
 * video, each with what was going on beside it. Used for new posts and for editing.
 */

const MAX_PER_MOMENT = 12;
type DraftMedia = { key: string; saved?: Photo; file?: File; preview: string; video: boolean };
type DraftMoment = { key: string; id?: string; text: string; items: DraftMedia[] };
export type SectionPayload = { id?: string; text: string; media: string[] };

let n = 0;
const k = () => `k${n++}`;
const fromSaved = (p: Photo): DraftMedia => ({ key: p.path, saved: p, preview: p.url, video: !!p.video });

function initial(entry?: Entry): DraftMoment[] {
  if (!entry) return [];
  if (entry.sections.length) return entry.sections.map((s) => ({ key: s.id, id: s.id, text: s.text, items: s.media.map(fromSaved) }));
  // old posts: their photo grid becomes one moment Jack can split up and caption
  if (entry.photos.length) return [{ key: k(), text: "", items: entry.photos.map(fromSaved) }];
  return [];
}

export function useDraftPost(entry?: Entry) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [moments, setMoments] = useState<DraftMoment[]>(() => initial(entry));
  const [problem, setProblem] = useState<string | null>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const edit = (key: string, fn: (m: DraftMoment) => DraftMoment) => setMoments((ms) => ms.map((m) => (m.key === key ? fn(m) : m)));
  const videoCount = (ms: DraftMoment[]) => ms.reduce((t, m) => t + m.items.filter((i) => i.video).length, 0);

  const addMoment = () => setMoments((ms) => [...ms, { key: k(), text: "", items: [] }]);
  const removeMoment = (key: string) => setMoments((ms) => ms.filter((m) => m.key !== key));
  const moveMoment = (key: string, dir: -1 | 1) => setMoments((ms) => {
    const i = ms.findIndex((m) => m.key === key), j = i + dir;
    if (i < 0 || j < 0 || j >= ms.length) return ms;
    const next = [...ms];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const setText = (key: string, text: string) => edit(key, (m) => ({ ...m, text }));
  const removeItem = (key: string, itemKey: string) => edit(key, (m) => ({ ...m, items: m.items.filter((i) => i.key !== itemKey) }));

  const addFiles = async (key: string, files: FileList | null) => {
    if (!files?.length) return;
    setProblem(null);
    const picked: DraftMedia[] = [];
    const notes: string[] = [];
    let videos = videoCount(moments);
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
      const isVideo = !isImage && !!videoType(file);
      if (!isImage && !isVideo) { notes.push(`${file.name} isn’t a photo or video.`); continue; }
      if (isVideo) {
        if (videos >= MAX_VIDEOS_PER_POST) { notes.push(`Up to ${MAX_VIDEOS_PER_POST} videos per post.`); continue; }
        if (file.size > MAX_VIDEO_BYTES) { notes.push(`That video is over ${MAX_VIDEO_BYTES / 1024 / 1024} MB. Trim it to under a minute.`); continue; }
        const secs = await videoDuration(file);
        if (secs !== null && secs > MAX_VIDEO_SECONDS + 1) { notes.push(`Videos can be up to ${MAX_VIDEO_SECONDS} seconds (that one is ${Math.round(secs)}s). Trim it in Photos first.`); continue; }
        videos++;
      }
      const preview = URL.createObjectURL(file);
      urls.current.push(preview);
      picked.push({ key: k(), file, preview, video: isVideo });
    }
    const room = Math.max(0, MAX_PER_MOMENT - (moments.find((m) => m.key === key)?.items.length ?? 0));
    if (picked.length > room) notes.push(`Up to ${MAX_PER_MOMENT} per moment. Add another moment for the rest.`);
    edit(key, (m) => ({ ...m, items: [...m.items, ...picked.slice(0, room)] }));
    if (notes.length) setProblem([...new Set(notes)].join(" "));
  };

  const reset = (to?: Entry) => {
    setTitle(to?.title ?? "");
    setBody(to?.body ?? "");
    setMoments(initial(to));
    setProblem(null);
  };

  const isEmpty = !title.trim() && !body.trim() && moments.every((m) => !m.text.trim() && !m.items.length);

  /** Uploads anything new and returns the moments ready to save. */
  const commit = async (onProgress: (msg: string) => void): Promise<SectionPayload[]> => {
    const fresh = moments.flatMap((m) => m.items.filter((i) => i.file));
    let done = 0;
    const out: SectionPayload[] = [];
    for (const m of moments) {
      const media: string[] = [];
      for (const item of m.items) {
        if (item.saved) { media.push(item.saved.path); continue; }
        const label = `${item.video ? "video" : "photo"} ${++done} of ${fresh.length}`;
        onProgress(`Uploading ${label}…`);
        const saved = item.video
          ? await uploadVideo(item.file!, (pct) => onProgress(`Uploading ${label}… ${pct}%`))
          : await uploadPhoto(item.file!);
        media.push(saved.path);
        // remember it, so a retry after a later failure doesn't upload it twice
        edit(m.key, (mm) => ({ ...mm, items: mm.items.map((i) => (i.key === item.key ? { ...i, saved, file: undefined } : i)) }));
      }
      if (m.text.trim() || media.length) out.push({ id: m.id, text: m.text, media });
    }
    return out;
  };

  return { title, setTitle, body, setBody, moments, addMoment, removeMoment, moveMoment, setText, addFiles, removeItem, reset, commit, isEmpty, problem, setProblem };
}

type Draft = ReturnType<typeof useDraftPost>;

export default function PostEditor({ id, draft, busy }: { id: string; draft: Draft; busy: boolean }) {
  return (
    <div className="peditor">
      <label htmlFor={`${id}-title`} className="sr">Title</label>
      <input id={`${id}-title`} className="ctitle" placeholder="Title (optional)" value={draft.title} onChange={(e) => draft.setTitle(e.target.value)} disabled={busy} maxLength={140} />
      <label htmlFor={`${id}-body`} className="sr">Main story</label>
      <textarea id={`${id}-body`} rows={5} placeholder="The main story of the day…" value={draft.body} onChange={(e) => draft.setBody(e.target.value)} disabled={busy} />

      {draft.moments.map((m, i) => (
        <fieldset key={m.key} className="momentedit">
          <legend>
            <span>Moment {i + 1}</span>
            <span className="mtools">
              <button type="button" onClick={() => draft.moveMoment(m.key, -1)} disabled={busy || i === 0} aria-label={`Move moment ${i + 1} up`}>↑</button>
              <button type="button" onClick={() => draft.moveMoment(m.key, 1)} disabled={busy || i === draft.moments.length - 1} aria-label={`Move moment ${i + 1} down`}>↓</button>
              <button type="button" onClick={() => draft.removeMoment(m.key)} disabled={busy} aria-label={`Remove moment ${i + 1}`}>×</button>
            </span>
          </legend>
          <div className="thumbs">
            {m.items.map((p) => (
              <div key={p.key} className={p.video ? "thumb video" : "thumb"}>
                {p.video ? (
                  <video src={`${p.preview}#t=0.1`} muted playsInline preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.preview} alt="" />
                )}
                {p.video && <span className="vbadge" aria-hidden="true">▶</span>}
                <button type="button" aria-label={p.video ? "Remove video" : "Remove photo"} onClick={() => draft.removeItem(m.key, p.key)} disabled={busy}>×</button>
              </div>
            ))}
            <label className="addmedia" htmlFor={`${id}-m-${m.key}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M4 7h3l2-2h6l2 2h3v12H4zM12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" /></svg>
              <span>{m.items.length ? "More" : "Photos / videos"}</span>
            </label>
            <input id={`${id}-m-${m.key}`} type="file" accept="image/*,video/*" multiple hidden disabled={busy}
              onChange={(e) => { draft.addFiles(m.key, e.target.files); e.target.value = ""; }} />
          </div>
          <label htmlFor={`${id}-t-${m.key}`} className="sr">{`What was going on in moment ${i + 1}`}</label>
          <textarea id={`${id}-t-${m.key}`} rows={3} className="mtextarea" placeholder="What was going on here?" value={m.text} onChange={(e) => draft.setText(m.key, e.target.value)} disabled={busy} />
        </fieldset>
      ))}

      <button type="button" className="addmoment" onClick={draft.addMoment} disabled={busy}>
        <span aria-hidden="true">+</span> Add a moment <small>photos or a video, with what was going on</small>
      </button>
      {draft.problem && <p className="jerror" role="alert">{draft.problem}</p>}
    </div>
  );
}
