"use client";
import { useEffect, useRef, useState } from "react";
import { uploadPhoto, type Photo, type Session } from "@/lib/client";

export type DraftPhoto = { key: string; saved?: Photo; file?: File; preview: string };

let n = 0;
export function useDraftPhotos(initial: Photo[] = []) {
  const [items, setItems] = useState<DraftPhoto[]>(() => initial.map((p) => ({ key: p.path, saved: p, preview: p.url })));
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const add = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)).map((file) => {
      const preview = URL.createObjectURL(file);
      urls.current.push(preview);
      return { key: `new-${n++}`, file, preview };
    });
    setItems((cur) => [...cur, ...next].slice(0, 30));
  };
  const remove = (key: string) => setItems((cur) => cur.filter((i) => i.key !== key));
  const reset = (to: Photo[] = []) => setItems(to.map((p) => ({ key: p.path, saved: p, preview: p.url })));

  /** Uploads any new photos and returns the final ordered list of storage paths. */
  const commit = async (s: Session, onProgress: (msg: string) => void) => {
    const fresh = items.filter((i) => i.file);
    const paths: string[] = [];
    let done = 0;
    for (const item of items) {
      if (item.saved) { paths.push(item.saved.path); continue; }
      onProgress(`Uploading photo ${++done} of ${fresh.length}…`);
      const photo = await uploadPhoto(item.file!, s);
      paths.push(photo.path);
    }
    return paths;
  };

  return { items, add, remove, reset, commit };
}

export default function PhotoPicker({ id, draft, disabled }: { id: string; draft: ReturnType<typeof useDraftPhotos>; disabled?: boolean }) {
  return (
    <div className="picker">
      {draft.items.length > 0 && (
        <div className="thumbs">
          {draft.items.map((p) => (
            <div key={p.key} className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" />
              <button type="button" aria-label="Remove photo" onClick={() => draft.remove(p.key)} disabled={disabled}>×</button>
            </div>
          ))}
        </div>
      )}
      <label className="addphoto" htmlFor={id}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M4 7h3l2-2h6l2 2h3v12H4zM12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" /></svg>
        Add photos
      </label>
      <input id={id} type="file" accept="image/*" multiple hidden disabled={disabled}
        onChange={(e) => { draft.add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
