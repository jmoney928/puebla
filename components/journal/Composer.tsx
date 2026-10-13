"use client";
import { useEffect, useState } from "react";
import { TRIP_DAYS } from "@/lib/people";
import { api, type JournalData } from "@/lib/client";
import type { Session } from "./Journal";
import PhotoPicker, { useDraftPhotos } from "./PhotoPicker";

export default function Composer({ session, defaultDay, onSaved }: { session: Session; defaultDay: string; onSaved: (d: JournalData) => void }) {
  const [body, setBody] = useState("");
  const [day, setDay] = useState(defaultDay);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const draft = useDraftPhotos();

  useEffect(() => setDay(defaultDay), [defaultDay]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && draft.items.length === 0) return setError("Write something or add a photo.");
    setBusy(true);
    setError(null);
    try {
      const photos = await draft.commit(setStatus);
      setStatus("Posting…");
      const next = await api<JournalData>("/api/entries", { method: "POST", body: { day, body, photos } });
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
      <div className="crow">
        <label htmlFor="compose-day" className="sr">Day</label>
        <select id="compose-day" value={day} onChange={(e) => setDay(e.target.value)} disabled={busy}>
          {TRIP_DAYS.map((d) => <option key={d.iso} value={d.iso}>{d.label} Oct</option>)}
        </select>
      </div>
      <label htmlFor="compose-body" className="sr">Your entry</label>
      <textarea id="compose-body" rows={4} placeholder="How was today?" value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
      <div className="cactions">
        <PhotoPicker id="compose-photos" draft={draft} disabled={busy} />
        <button type="submit" className="btn" disabled={busy}>{busy ? "Posting…" : "Post"}</button>
      </div>
      {status && <p className="cstatus" aria-live="polite">{status}</p>}
      {error && <p className="jerror" role="alert">{error}</p>}
    </form>
  );
}
