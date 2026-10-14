"use client";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { MexicoFlag } from "./Reactions";

/** A little smiley in a sombrero. Drawn by hand, so it looks the same on every phone. */
function SombreroGuy() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {/* face */}
      <circle cx="32" cy="40" r="17" fill="#FFCC33" stroke="#E0A400" strokeWidth="1.5" />
      <ellipse cx="25.5" cy="38" rx="2.2" ry="3" fill="#3A2A12" />
      <ellipse cx="38.5" cy="38" rx="2.2" ry="3" fill="#3A2A12" />
      <path d="M23 45q9 9 18 0" fill="#7A2E12" stroke="#3A2A12" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20.5" cy="44" r="2.6" fill="#FF8A6B" opacity=".55" />
      <circle cx="43.5" cy="44" r="2.6" fill="#FF8A6B" opacity=".55" />
      {/* sombrero: wide brim, tall crown, zigzag band */}
      <ellipse cx="32" cy="27" rx="30" ry="7.5" fill="#E8B04A" stroke="#A8701A" strokeWidth="1.5" />
      <path d="M21 26 Q22 6 32 5 Q42 6 43 26 Z" fill="#F2C35B" stroke="#A8701A" strokeWidth="1.5" />
      <path d="M21.6 21 L25 18 L28.5 21 L32 18 L35.5 21 L39 18 L42.4 21 L42.7 24.5 L21.3 24.5 Z" fill="#D1006B" />
      <path d="M22 24.5 h20" stroke="#0F8B8D" strokeWidth="1.8" />
      <ellipse cx="32" cy="27.5" rx="27" ry="5" fill="none" stroke="#0F8B8D" strokeWidth="1.2" strokeDasharray="3 2.5" />
    </svg>
  );
}

type Drop = { id: number; kind: 0 | 1 | 2; x: number; size: number; delay: number; dur: number; spin: number; sway: number };

export type FiestaHandle = { go: () => void };

/** Sombrero guys, tacos and flags rain down the screen. Call go() after a comment or reply is sent. */
const Fiesta = forwardRef<FiestaHandle>(function Fiesta(_, ref) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const next = useRef(0);

  const go = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = window.innerWidth < 600 ? 28 : 44;
    const batch: Drop[] = Array.from({ length: count }, () => {
      const r = Math.random();
      return {
        id: next.current++,
        kind: r < 0.4 ? 0 : r < 0.75 ? 1 : 2, // 40% sombrero guys, 35% tacos, 25% flags
        x: Math.random() * 100,
        size: 26 + Math.random() * 26,
        delay: Math.random() * 0.9,
        dur: 2.3 + Math.random() * 1.6,
        spin: (Math.random() - 0.5) * 540,
        sway: (Math.random() - 0.5) * 80,
      };
    });
    setDrops((d) => [...d, ...batch]);
    const ids = new Set(batch.map((b) => b.id));
    window.setTimeout(() => setDrops((d) => d.filter((x) => !ids.has(x.id))), 4200);
  }, []);

  useImperativeHandle(ref, () => ({ go }), [go]);

  if (!drops.length) return null;
  return (
    <div className="fiesta" aria-hidden="true">
      {drops.map((d) => (
        <span
          key={d.id}
          className={`drop k${d.kind}`}
          style={{
            left: `${d.x}%`, width: d.size, height: d.size, fontSize: d.size * 0.86,
            animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`,
            ["--spin" as string]: `${d.spin}deg`, ["--sway" as string]: `${d.sway}px`,
          }}
        >
          {d.kind === 0 ? <SombreroGuy /> : d.kind === 1 ? "🌮" : <MexicoFlag />}
        </span>
      ))}
    </div>
  );
});

export default Fiesta;
