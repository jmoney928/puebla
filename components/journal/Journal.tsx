"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PEOPLE, TRIP_DAYS } from "@/lib/people";
import { ApiError, api, loadSession, saveSession, tripToday, type Comment, type Entry, type Session } from "@/lib/client";
import Gate from "./Gate";
import Composer from "./Composer";
import EntryCard from "./EntryCard";
import Lightbox from "./Lightbox";

type Data = { entries: Entry[]; comments: Comment[] };

export default function Journal() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<string>("all");
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  useEffect(() => {
    setSession(loadSession());
    const today = tripToday();
    if (today) setDay(today);
    setReady(true);
  }, []);

  const refresh = useCallback(async (s: Session) => {
    try {
      setData(await api<Data>("/api/journal", s));
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        saveSession(null);
        setSession(null);
      }
      setError(e instanceof Error ? e.message : "Couldn’t load the journal.");
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    refresh(session);
    const tick = () => document.visibilityState === "visible" && refresh(session);
    const id = window.setInterval(tick, 20000);
    window.addEventListener("focus", tick);
    return () => { window.clearInterval(id); window.removeEventListener("focus", tick); };
  }, [session, refresh]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    data?.entries.forEach((e) => { c[e.day] = (c[e.day] ?? 0) + 1; });
    return c;
  }, [data]);

  const commentsFor = useMemo(() => {
    const m: Record<string, Comment[]> = {};
    data?.comments.forEach((c) => { (m[c.entry_id] ??= []).push(c); });
    return m;
  }, [data]);

  if (!ready) return null;

  if (!session) {
    return (
      <Gate
        notice={error}
        onEnter={(s) => { saveSession(s); setError(null); setSession(s); }}
      />
    );
  }

  const shown = (data?.entries ?? []).filter((e) => day === "all" || e.day === day);
  const dayLabel = day === "all" ? "the trip" : TRIP_DAYS.find((d) => d.iso === day)?.label;

  return (
    <div className="journal">
      <section className="jhead">
        <div>
          <div className="eyebrow">Journal · Alec, Sullivan, Jack, Patrick</div>
          <h1>Diario</h1>
          <p className="lede">Write every day, drop in photos, and comment on each other’s entries.</p>
        </div>
        <div className="whoami">
          <span>Posting as</span>
          <b style={{ color: PEOPLE.find((p) => p.name === session.user)?.color }}>{session.user}</b>
          <button type="button" className="linkbtn" onClick={() => { saveSession(null); setSession(null); setData(null); }}>Switch</button>
        </div>
      </section>

      <div className="daystrip" role="tablist" aria-label="Pick a day">
        <button type="button" role="tab" aria-selected={day === "all"} className="dchip" onClick={() => setDay("all")}>
          <b>All</b><small>{data ? `${data.entries.length} posts` : "…"}</small>
        </button>
        {TRIP_DAYS.map((d) => (
          <button key={d.iso} type="button" role="tab" aria-selected={day === d.iso} className="dchip" onClick={() => setDay(d.iso)}>
            <b>{d.label}</b><small>{counts[d.iso] ? `${counts[d.iso]} post${counts[d.iso] > 1 ? "s" : ""}` : "—"}</small>
          </button>
        ))}
      </div>

      {error && <p className="jerror" role="alert">{error}</p>}

      <div className="people">
        {PEOPLE.map((p) => {
          const mine = p.name === session.user;
          const list = shown.filter((e) => e.author === p.name).sort((a, b) => b.day.localeCompare(a.day) || b.created_at.localeCompare(a.created_at));
          return (
            <section key={p.name} className="pcol" style={{ ["--pc" as string]: p.color }} aria-labelledby={`p-${p.name}`}>
              <header className="phead">
                <span className="avatar">{p.name[0]}</span>
                <h2 id={`p-${p.name}`}>{p.name}</h2>
                <span className="pcount">{list.length} {list.length === 1 ? "entry" : "entries"}</span>
              </header>
              {mine && (
                <Composer session={session} defaultDay={day === "all" ? tripToday() ?? TRIP_DAYS[0].iso : day} onPosted={() => refresh(session)} />
              )}
              {data === null ? (
                <p className="empty">Loading…</p>
              ) : list.length === 0 ? (
                <p className="empty">{mine ? `Nothing from you for ${dayLabel} yet.` : `Nothing from ${p.name} for ${dayLabel} yet.`}</p>
              ) : (
                <div className="entries">
                  {list.map((e) => (
                    <EntryCard
                      key={e.id}
                      entry={e}
                      comments={commentsFor[e.id] ?? []}
                      session={session}
                      showDay={day === "all"}
                      onChange={() => refresh(session)}
                      onOpenPhoto={(i) => setLightbox({ urls: e.photos.map((x) => x.url), index: i })}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {lightbox && <Lightbox urls={lightbox.urls} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}
