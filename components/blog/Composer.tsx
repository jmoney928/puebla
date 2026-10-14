"use client";
import { useState } from "react";
import { TRIP_DAYS } from "@/lib/people";
import { api, tripToday, type JournalData } from "@/lib/client";
import PhotoPicker, { useDraftPhotos } from "./PhotoPicker";

export default function Composer({ onSaved }: { onSaved: (d: JournalData) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [day, setDay] = useState(() => tripToday() ?? TRIP_DAYS[0].iso);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const draft = useDraftPhotos();

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !body.trim() && draft.items.length === 0) return setError("Write something or add a photo.");
    setBusy(true);
    setError(null);
    try {
      const photos = await draft.commit(setStatus);
      setStatus("Posting…");
      const next = await api<JournalData>("/api/entries", { method: "POST", body: { day, title, body, photos } });
      setTitle("");
      setBody("");
      draft.reset();
      setStatus("Posted.");
      window.setTimeout(() => setStatus(null), 2000);
      onSaved(next);
    } catch (err) {
      setStatus(null);
      setError(err instanceof Error ? err.message : "Couldn’t post. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="composer" onSubmit={post}>
      <div className="ctop">
        <b>New post</b>
        <label htmlFor="compose-day" className="sr">Day</label>
        <select id="compose-day" value={day} onChange={(e) => setDay(e.target.value)} disabled={busy}>
          {TRIP_DAYS.map((d) => <option key={d.iso} value={d.iso}>{d.label} Oct</option>)}
        </select>
      </div>
      <label htmlFor="compose-title" className="sr">Title</label>
      <input id="compose-title" className="ctitle" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} maxLength={140} />
      <label htmlFor="compose-body" className="sr">Post</label>
      <textarea id="compose-body" rows={6} placeholder="What happened today?" value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
      <div className="cactions">
        <PhotoPicker id="compose-photos" draft={draft} disabled={busy} />
        <button type="submit" className="btn" disabled={busy}>{busy ? "Posting…" : "Post"}</button>
      </div>
      {status && <p className="cstatus" aria-live="polite">{status}</p>}
      {error && <p className="jerror" role="alert">{error}</p>}
    </form>
  );
}
