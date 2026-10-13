"use client";
import { useState } from "react";
import { colorOf, TRIP_DAYS } from "@/lib/people";
import { api, postedAt, type Comment, type Entry, type JournalData } from "@/lib/client";
import type { Session } from "./Journal";
import PhotoPicker, { useDraftPhotos } from "./PhotoPicker";

type Props = {
  entry: Entry; comments: Comment[]; session: Session; showDay: boolean;
  onSaved: (d: JournalData) => void; onOpenPhoto: (i: number) => void;
};

export default function EntryCard({ entry, comments, session, showDay, onSaved, onOpenPhoto }: Props) {
  const mine = entry.author === session.user;
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [body, setBody] = useState(entry.body);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const draft = useDraftPhotos(entry.photos);
  const day = TRIP_DAYS.find((d) => d.iso === entry.day);
  const edited = new Date(entry.updated_at).getTime() - new Date(entry.created_at).getTime() > 60000;

  async function run(fn: () => Promise<JournalData>) {
    setBusy(true);
    setError(null);
    try { onSaved(await fn()); }
    catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); setStatus(null); }
  }

  const save = () => run(async () => {
    const photos = await draft.commit(setStatus);
    const next = await api<JournalData>(`/api/entries/${entry.id}`, { method: "PATCH", body: { body, photos } });
    setEditing(false);
    return next;
  });
  const remove = () => run(() => api<JournalData>(`/api/entries/${entry.id}`, { method: "DELETE" }));
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    run(async () => {
      const next = await api<JournalData>("/api/comments", { method: "POST", body: { entry_id: entry.id, body: comment } });
      setComment("");
      return next;
    });
  };
  const removeComment = (id: string) => run(() => api<JournalData>(`/api/comments/${id}`, { method: "DELETE" }));

  return (
    <article className="entry">
      <div className="emeta">
        {showDay && day && <span className="eday">{day.label}</span>}
        <span>{postedAt(entry.created_at)}{edited ? " · edited" : ""}</span>
        {mine && !editing && (
          <span className="eown">
            {confirmDelete ? (
              <>
                <span>Delete this entry?</span>
                <button type="button" className="linkbtn danger" onClick={remove} disabled={busy}>Delete</button>
                <button type="button" className="linkbtn" onClick={() => setConfirmDelete(false)}>Keep</button>
              </>
            ) : (
              <>
                <button type="button" className="linkbtn" onClick={() => { setBody(entry.body); draft.reset(entry.photos); setEditing(true); }}>Edit</button>
                <button type="button" className="linkbtn" onClick={() => setConfirmDelete(true)}>Delete</button>
              </>
            )}
          </span>
        )}
      </div>

      {editing ? (
        <div className="editbox">
          <label htmlFor={`edit-${entry.id}`} className="sr">Edit entry</label>
          <textarea id={`edit-${entry.id}`} rows={5} value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
          <div className="cactions">
            <PhotoPicker id={`edit-photos-${entry.id}`} draft={draft} disabled={busy} />
            <div className="btnrow">
              <button type="button" className="btn ghost" onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
              <button type="button" className="btn" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
          {status && <p className="cstatus" aria-live="polite">{status}</p>}
        </div>
      ) : (
        <>
          {entry.body && <p className="ebody">{entry.body}</p>}
          {entry.photos.length > 0 && (
            <div className={`photos n${Math.min(entry.photos.length, 3)}`}>
              {entry.photos.map((p, i) => (
                <button key={p.path} type="button" className="photo" onClick={() => onOpenPhoto(i)} aria-label={`Open photo ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {error && <p className="jerror" role="alert">{error}</p>}

      <div className="comments">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <b style={{ color: colorOf(c.author) }}>{c.author}</b>
            <span className="ctext">{c.body}</span>
            <span className="ctime">{postedAt(c.created_at)}</span>
            {c.author === session.user && (
              <button type="button" className="cdel" aria-label="Delete comment" onClick={() => removeComment(c.id)} disabled={busy}>×</button>
            )}
          </div>
        ))}
        <form className="cform" onSubmit={addComment}>
          <label htmlFor={`c-${entry.id}`} className="sr">Comment</label>
          <input id={`c-${entry.id}`} placeholder={mine ? "Add a note…" : `Reply to ${entry.author}…`} value={comment} onChange={(e) => setComment(e.target.value)} disabled={busy} maxLength={2000} />
          <button type="submit" className="btn small" disabled={busy || !comment.trim()}>Send</button>
        </form>
      </div>
    </article>
  );
}
