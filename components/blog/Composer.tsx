"use client";
import { useState } from "react";
import { TRIP_DAYS } from "@/lib/people";
import { api, tripToday, type JournalData } from "@/lib/client";
import PostEditor, { useDraftPost } from "./PostEditor";

export default function Composer({ onSaved }: { onSaved: (d: JournalData) => void }) {
  const [day, setDay] = useState(() => tripToday() ?? TRIP_DAYS[0].iso);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const draft = useDraftPost();

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (draft.isEmpty) return setError("Write something or add a moment with photos.");
    setBusy(true);
    setError(null);
    try {
      const sections = await draft.commit(setStatus);
      setStatus("Posting…");
      const next = await api<JournalData>("/api/entries", { method: "POST", body: { day, title: draft.title, body: draft.body, sections } });
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
      <PostEditor id="compose" draft={draft} busy={busy} />
      <div className="cactions">
        <span />
        <button type="submit" className="btn" disabled={busy}>{busy ? "Posting…" : "Post"}</button>
      </div>
      {status && <p className="cstatus" aria-live="polite">{status}</p>}
      {error && <p className="jerror" role="alert">{error}</p>}
    </form>
  );
}
