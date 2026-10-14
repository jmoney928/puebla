"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Instrument = "trumpet" | "violin" | "guitarron" | "vihuela";

/** A little mariachi in a charro suit and sombrero. Original drawing, all SVG. */
function Musician({ kind }: { kind: Instrument }) {
  return (
    <svg viewBox="0 0 90 120" aria-hidden="true" focusable="false">
      {/* legs + boots, silver botonadura down the trousers */}
      <rect x="33" y="80" width="10" height="30" rx="3" fill="#15151d" />
      <rect x="47" y="80" width="10" height="30" rx="3" fill="#15151d" />
      {[84, 90, 96, 102].map((y) => <circle key={y} cx="34.5" cy={y} r="1.1" fill="#d7dbe3" />)}
      {[84, 90, 96, 102].map((y) => <circle key={y} cx="55.5" cy={y} r="1.1" fill="#d7dbe3" />)}
      <path d="M31 108h13v5H29q0-5 2-5zM46 108h13q2 0 2 5H46z" fill="#3a2414" />
      {/* jacket, shirt, big red moño */}
      <path d="M28 52q17-6 34 0l3 30H25z" fill="#15151d" />
      <path d="M40 52h10l-2 26h-6z" fill="#fff" />
      <path d="M45 56l-9-5v10zM45 56l9-5v10z" fill="#C8102E" /><circle cx="45" cy="56" r="2.2" fill="#9e0b23" />
      <path d="M29 60q-2 10 0 20M61 60q2 10 0 20" stroke="#c9ced8" strokeWidth="1.2" fill="none" strokeDasharray="1.5 2" />
      {/* face */}
      <circle cx="45" cy="40" r="11" fill="#C98B5E" />
      <circle cx="41" cy="39" r="1.4" fill="#2a1a10" /><circle cx="49" cy="39" r="1.4" fill="#2a1a10" />
      <path d="M41 44.5q4 3.5 8 0" stroke="#2a1a10" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="43" r="1.8" fill="#e08a6a" opacity=".5" /><circle cx="52" cy="43" r="1.8" fill="#e08a6a" opacity=".5" />
      {/* sombrero: black felt with silver trim */}
      <ellipse cx="45" cy="30" rx="34" ry="7.5" fill="#1b1b24" />
      <ellipse cx="45" cy="30" rx="31" ry="5.6" fill="none" stroke="#c9ced8" strokeWidth="1" strokeDasharray="2 2.5" />
      <path d="M33 30q1-20 12-21q11 1 12 21z" fill="#24242f" />
      <path d="M34 25q11 3 22 0" stroke="#c9ced8" strokeWidth="1.6" fill="none" />
      {kind === "trumpet" && (
        <g className="inst">
          <path d="M28 58q-6 6-2 10M62 58q6 6 1 10" stroke="#15151d" strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="47" y="45" width="26" height="4" rx="2" fill="#E8B04A" />
          <path d="M70 41l12-5v22l-12-5z" fill="#F2C35B" stroke="#A8701A" strokeWidth=".8" />
          <rect x="55" y="49" width="10" height="6" rx="1.5" fill="#E8B04A" />
          <circle cx="58" cy="44" r="1.2" fill="#A8701A" /><circle cx="61.5" cy="44" r="1.2" fill="#A8701A" /><circle cx="65" cy="44" r="1.2" fill="#A8701A" />
        </g>
      )}
      {kind === "violin" && (
        <g className="inst">
          <path d="M28 58q-4 4 4 8" stroke="#15151d" strokeWidth="6" strokeLinecap="round" fill="none" />
          <g transform="rotate(-25 34 52)">
            <path d="M24 50q-4 0-4 5t4 5q-2 3 0 5t5 1h8q4 0 5-3t-2-5q3-1 2-4t-5-4h-8q-3 0-5 0z" fill="#8a3b12" stroke="#5c2408" strokeWidth=".8" />
            <rect x="41" y="54" width="16" height="2.4" rx="1" fill="#2a1a10" />
          </g>
          <g className="bow"><line x1="20" y1="70" x2="64" y2="48" stroke="#d9c49a" strokeWidth="1.6" strokeLinecap="round" /><circle cx="64" cy="48" r="2.2" fill="#15151d" /></g>
        </g>
      )}
      {kind === "guitarron" && (
        <g className="inst">
          <ellipse cx="45" cy="74" rx="20" ry="17" fill="#B5732E" stroke="#6b3e12" strokeWidth="1.2" />
          <circle cx="45" cy="72" r="5" fill="#3a2414" />
          <rect x="42.5" y="38" width="5" height="30" rx="1.5" fill="#6b3e12" transform="rotate(18 45 68)" />
          <path d="M36 84h18" stroke="#3a2414" strokeWidth="2" />
          <path className="strum" d="M60 70q6 2 8 8" stroke="#C98B5E" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )}
      {kind === "vihuela" && (
        <g className="inst">
          <ellipse cx="44" cy="70" rx="14" ry="12" fill="#E3B26B" stroke="#8a5a20" strokeWidth="1" />
          <circle cx="44" cy="69" r="3.5" fill="#3a2414" />
          <rect x="42" y="40" width="4" height="26" rx="1.2" fill="#8a5a20" transform="rotate(-30 44 66)" />
          <path className="strum" d="M54 64q5 2 6 7" stroke="#C98B5E" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )}
    </svg>
  );
}

type Spot = { kind: Instrument; style: React.CSSProperties; side: "l" | "r"; peek?: boolean };

/**
 * Put the band where nobody is clicking: the empty margins on either side of the page.
 * When those margins are too thin (phones), they peek in from the edges of the screen instead.
 */
function placeBand(): Spot[] {
  const w = window.innerWidth;
  const gutter = Math.max(0, (w - 1180) / 2) + (w <= 480 ? 16 : 20);
  if (gutter >= 64) {
    const size = Math.min(130, gutter - 10);
    const x = Math.max(4, (gutter - size) / 2);
    return [
      { kind: "trumpet", side: "l", style: { left: x, top: "24%", width: size } },
      { kind: "guitarron", side: "l", style: { left: x, top: "62%", width: size } },
      { kind: "violin", side: "r", style: { right: x, top: "34%", width: size } },
      { kind: "vihuela", side: "r", style: { right: x, top: "70%", width: size } },
    ];
  }
  const size = 58, peek = -size * 0.42;
  return [
    { kind: "trumpet", side: "l", peek: true, style: { left: peek, top: "30%", width: size } },
    { kind: "guitarron", side: "l", peek: true, style: { left: peek, top: "66%", width: size } },
    { kind: "violin", side: "r", peek: true, style: { right: peek, top: "44%", width: size } },
    { kind: "vihuela", side: "r", peek: true, style: { right: peek, top: "80%", width: size } },
  ];
}

const Note = ({ double }: { double?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
    {double ? (
      <>
        <ellipse cx="6" cy="19" rx="4" ry="3" transform="rotate(-20 6 19)" />
        <ellipse cx="18" cy="16.5" rx="4" ry="3" transform="rotate(-20 18 16.5)" />
        <rect x="8.9" y="4" width="1.8" height="15" />
        <rect x="20.9" y="1.5" width="1.8" height="15" />
        <path d="M8.9 4L22.7 1.5v3.4L8.9 7.4z" />
      </>
    ) : (
      <>
        <ellipse cx="9" cy="19" rx="4.5" ry="3.3" transform="rotate(-20 9 19)" />
        <rect x="12.2" y="3" width="1.9" height="16" />
        <path d="M14.1 3q6.5 2.5 5.2 9.5q-1.4-4.4-5.2-5z" />
      </>
    )}
  </svg>
);

export default function MariachiToggle() {
  const [on, setOn] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    const a = audio.current;
    if (a) { a.pause(); a.currentTime = 0; }
    setOn(false);
  }, []);

  const toggle = async () => {
    if (on) return stop();
    if (!audio.current) {
      const a = new Audio("/mariachi.mp3");
      a.preload = "auto";
      a.volume = 0.75;
      a.addEventListener("ended", () => setOn(false));
      audio.current = a;
    }
    setSpots(placeBand());
    setOn(true);
    try { await audio.current.play(); } catch { setOn(false); }
  };

  useEffect(() => {
    if (!on) return;
    const onResize = () => setSpots(placeBand());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [on]);

  useEffect(() => () => audio.current?.pause(), []);

  return (
    <>
      <button type="button" role="switch" aria-checked={on} className="music" onClick={toggle}
        title={on ? "Stop the mariachis" : "Play Mexican music"}>
        <span className="music-ico" aria-hidden="true">🎺</span>
        <span className="music-label">Mexican music</span>
        <span className="music-switch" aria-hidden="true"><span /></span>
        <span className="music-state">{on ? "On" : "Off"}</span>
      </button>
      {on && (
        <div className="band" aria-hidden="true">
          {spots.map((s, i) => (
            <div key={s.kind} className={`player ${s.kind} ${s.side}`} style={{ ...s.style, animationDelay: `${i * 0.12}s` }}>
              <div className="bob" style={{ animationDelay: `${(i % 2) * 0.375}s` }}>
                <Musician kind={s.kind} />
              </div>
              {!s.peek && <><span className="mnote n1"><Note /></span><span className="mnote n2"><Note double /></span></>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
