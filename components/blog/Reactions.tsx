"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { REACTIONS, type ReactionKey, type ReactionMap } from "@/lib/reactions";

/** Windows has no flag emoji (it shows "MX"), so the Mexico flag is drawn. */
function MexicoFlag() {
  return (
    <svg className="mxflag" viewBox="0 0 21 14" aria-hidden="true" focusable="false">
      <rect width="7" height="14" fill="#006847" />
      <rect x="7" width="7" height="14" fill="#fff" />
      <rect x="14" width="7" height="14" fill="#CE1126" />
      <circle cx="10.5" cy="7" r="2.1" fill="#8C5A2B" />
      <path d="M8.9 8.4q1.6 1.3 3.2 0" stroke="#4A7A2B" strokeWidth=".8" fill="none" />
    </svg>
  );
}

export const Emoji = ({ k }: { k: ReactionKey }) =>
  k === "mexico" ? <MexicoFlag /> : <span className="remoji" aria-hidden="true">{REACTIONS.find((r) => r.key === k)?.emoji}</span>;

type Props = {
  target: string;
  map: ReactionMap[string] | undefined;
  me: string;
  onReact: (target: string, key: ReactionKey) => void;
  small?: boolean;
};

export default function Reactions({ target, map, me, onReact, small }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const addBtn = useRef<HTMLButtonElement>(null);
  const picker = useRef<HTMLDivElement>(null);

  // The picker floats over the page (position: fixed), centred on the button and kept inside the screen.
  useLayoutEffect(() => {
    if (!open || !picker.current || !addBtn.current) return;
    const b = addBtn.current.getBoundingClientRect(), p = picker.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, b.left + b.width / 2 - p.width / 2), window.innerWidth - p.width - 8);
    const above = b.top - p.height - 8;
    setPos({ left, top: above >= 8 ? above : b.bottom + 8 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); addBtn.current?.focus(); } };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggleOpen = () => { setPos(null); setOpen((o) => !o); };
  const pick = (k: ReactionKey) => { setOpen(false); onReact(target, k); };

  const used = REACTIONS.filter((r) => (map?.[r.key]?.length ?? 0) > 0);

  return (
    <div className={small ? "reacts small" : "reacts"} ref={wrap}>
      {used.map((r) => {
        const who = map?.[r.key] ?? [];
        const mine = who.some((x) => x.d === me);
        const names = who.map((x) => x.n || "someone");
        const label = `${r.label}: ${names.join(", ")}`;
        return (
          <button key={r.key} type="button" className="rchip" aria-pressed={mine} title={label}
            aria-label={`${r.label}, ${who.length}${mine ? ", including you. Tap to remove" : ". Tap to add yours"}`}
            onClick={() => onReact(target, r.key)}>
            <Emoji k={r.key} /><span className="rcount">{who.length}</span>
          </button>
        );
      })}
      <button ref={addBtn} type="button" className="radd" aria-label="Add a reaction" aria-expanded={open} onClick={toggleOpen}>
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="9" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6.8" cy="8.6" r=".95" fill="currentColor" /><circle cx="11.2" cy="8.6" r=".95" fill="currentColor" />
          <path d="M6.4 11.6q2.6 2.4 5.2 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M16.5 2.5v4M14.5 4.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {!small && used.length === 0 && <span>React</span>}
      </button>
      {open && (
        <div ref={picker} className="rpicker" role="group" aria-label="Pick a reaction"
          style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: "hidden" }}>
          {REACTIONS.map((r) => {
            const mine = map?.[r.key]?.some((x) => x.d === me) ?? false;
            return (
              <button key={r.key} type="button" className="rpick" aria-pressed={mine} aria-label={r.label} title={r.label} onClick={() => pick(r.key)}>
                <Emoji k={r.key} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
