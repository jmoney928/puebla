"use client";
import { useState } from "react";
import { TRIP_DAYS } from "@/lib/people";
import { api, loadName, postedAt, saveName, type Comment, type Entry, type JournalData } from "@/lib/client";
import PhotoPicker, { useDraftPhotos } from "./PhotoPicker";

type Props = {
  entry: Entry; comments: Comment[]; admin: boolean;
  onSaved: (d: JournalData) => void; onOpenPhoto: (i: number) => void;
};

export default function PostCard({ entry, comments, admin, onSaved, onOpenPhoto }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [body, setBody] = useState(entry.body);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(() => (typeof window === "undefined" ? "" : loadName()));
  const [comment, setComment] = useState("");
  const [trap, setTrap] = useState("");
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
    const next = await api<JournalData>(`/api/entries/${entry.id}`, { method: "PATCH", body: { title, body, photos } });
    setEditing(false);
    return next;
  });
  const remove = () => run(() => api<JournalData>(`/api/entries/${entry.id}`, { method: "DELETE" }));
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Add your name.");
    if (!comment.trim()) return;
    saveName(name.trim());
    run(async () => {
      const next = await api<JournalData>("/api/comments", { method: "POST", body: { entry_id: entry.id, name, body: comment, website: trap } });
      setComment("");
      return next;
    });
  };
  const removeComment = (id: string) => run(() => api<JournalData>(`/api/comments/${id}`, { method: "DELETE" }));

  return (
    <article className="post" id={`post-${entry.id}`}>
      <header className="pmeta">
        {day && <span className="pday"><b>{day.dow}</b><span>{day.d}</span></span>}
        <div className="ptitlewrap">
          {!editing && entry.title && <h2 className="ptitle">{entry.title}</h2>}
          <span className="ptime">Oct {day?.d} · posted {postedAt(entry.created_at)}{edited ? " · edited" : ""}</span>
        </div>
        {admin && !editing && (
          <span className="eown">
            {confirmDelete ? (
              <>
                <span>Delete this post?</span>
                <button type="button" className="linkbtn danger" onClick={remove} disabled={busy}>Delete</button>
                <button type="button" className="linkbtn" onClick={() => setConfirmDelete(false)}>Keep</button>
              </>
            ) : (
              <>
                <button type="button" className="linkbtn" onClick={() => { setTitle(entry.title); setBody(entry.body); draft.reset(entry.photos); setEditing(true); }}>Edit</button>
                <button type="button" className="linkbtn" onClick={() => setConfirmDelete(true)}>Delete</button>
              </>
            )}
          </span>
        )}
      </header>

      {editing ? (
        <div className="editbox">
          <label htmlFor={`edit-title-${entry.id}`} className="sr">Title</label>
          <input id={`edit-title-${entry.id}`} className="ctitle" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} maxLength={140} />
          <label htmlFor={`edit-${entry.id}`} className="sr">Post</label>
          <textarea id={`edit-${entry.id}`} rows={6} value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
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

      <section className="comments" aria-label="Comments">
        <h3 className="chead">{comments.length ? `${comments.length} comment${comments.length > 1 ? "s" : ""}` : "No comments yet"}</h3>
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <b>{c.name}</b>
            <span className="ctext">{c.body}</span>
            <span className="ctime">{postedAt(c.created_at)}</span>
            {admin && (
              <button type="button" className="cdel" aria-label={`Delete comment from ${c.name}`} onClick={() => removeComment(c.id)} disabled={busy}>×</button>
            )}
          </div>
        ))}
        <form className="cform" onSubmit={addComment}>
          <label htmlFor={`n-${entry.id}`} className="sr">Your name</label>
          <input id={`n-${entry.id}`} className="cname" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} maxLength={40} autoComplete="nickname" />
          <label htmlFor={`c-${entry.id}`} className="sr">Comment</label>
          <input id={`c-${entry.id}`} placeholder="Add a comment…" value={comment} onChange={(e) => setComment(e.target.value)} disabled={busy} maxLength={1000} />
          <input className="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" />
          <button type="submit" className="btn small" disabled={busy || !comment.trim()}>Send</button>
        </form>
      </section>
    </article>
  );
}
