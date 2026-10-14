"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, deviceId, loadName, type Comment, type JournalData } from "@/lib/client";
import type { ReactionKey } from "@/lib/reactions";
import Composer from "./Composer";
import PostCard from "./PostCard";
import Lightbox from "./Lightbox";
import AdminLogin from "./AdminLogin";
import Fiesta, { type FiestaHandle } from "./Fiesta";

export default function Blog() {
  const [admin, setAdmin] = useState(false);
  const [data, setData] = useState<JournalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const version = useRef(-1);
  const [me, setMe] = useState("");
  const fiesta = useRef<FiestaHandle>(null);
  const celebrate = useCallback(() => fiesta.current?.go(), []);
  useEffect(() => setMe(deviceId()), []);

  // Reads come from a cached copy that can lag a write by up to a minute, so never step back to an older version.
  const apply = useCallback((d: JournalData) => {
    if (d.version >= version.current) { version.current = d.version; setData(d); }
  }, []);

  const refresh = useCallback(async () => {
    try {
      apply(await api<JournalData>("/api/journal"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t load the blog.");
    }
  }, [apply]);

  useEffect(() => {
    api<{ admin: boolean }>("/api/auth").then((r) => setAdmin(r.admin)).catch(() => {});
    refresh();
    const tick = () => { if (document.visibilityState === "visible") refresh(); };
    const id = window.setInterval(tick, 60000);
    window.addEventListener("focus", tick);
    return () => { window.clearInterval(id); window.removeEventListener("focus", tick); };
  }, [refresh]);

  // Reactions show up instantly, then the server's copy replaces them (or puts things back if it failed).
  const react = useCallback(async (target: string, key: ReactionKey) => {
    if (!me) return;
    const name = loadName();
    let before: JournalData | null = null;
    setData((d) => {
      if (!d) return d;
      before = d;
      const forTarget = { ...(d.reactions[target] ?? {}) };
      const who = forTarget[key] ?? [];
      forTarget[key] = who.some((r) => r.d === me) ? who.filter((r) => r.d !== me) : [...who, { d: me, n: name }];
      return { ...d, reactions: { ...d.reactions, [target]: forTarget } };
    });
    try {
      apply(await api<JournalData>("/api/reactions", { method: "POST", body: { target, key, device: me, name } }));
    } catch (e) {
      if (before) setData(before);
      setError(e instanceof Error ? e.message : "Couldn’t save that reaction.");
    }
  }, [me, apply]);

  const commentsFor = useMemo(() => {
    const m: Record<string, Comment[]> = {};
    data?.comments.forEach((c) => { (m[c.entry_id] ??= []).push(c); });
    return m;
  }, [data]);

  const posts = data?.entries ?? [];

  return (
    <div className="blog">
      <section className="bhead">
        <div className="eyebrow">Jack’s trip blog · Puebla ’26</div>
        <h1>Diario</h1>
        <p className="lede">Ten days in Puebla, written up as they happen. Newest first. Leave a comment on anything.</p>
      </section>

      {admin && <Composer onSaved={apply} />}

      {error && <p className="jerror" role="alert">{error}</p>}

      {data === null ? (
        <p className="empty">Loading posts…</p>
      ) : posts.length === 0 ? (
        <div className="noposts">
          <h2>No posts yet</h2>
          <p>Jack’s first post lands once the trip starts on Oct 19.</p>
        </div>
      ) : (
        <div className="feed">
          {posts.map((e) => (
            <PostCard
              key={e.id}
              entry={e}
              comments={commentsFor[e.id] ?? []}
              reactions={data.reactions ?? {}}
              me={me}
              onReact={react}
              onSent={celebrate}
              admin={admin}
              onSaved={apply}
              onOpenPhoto={(urls, index) => setLightbox({ urls, index })}
            />
          ))}
        </div>
      )}

      <AdminLogin admin={admin} onChange={setAdmin} />

      <Fiesta ref={fiesta} />

      {lightbox && <Lightbox urls={lightbox.urls} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}
