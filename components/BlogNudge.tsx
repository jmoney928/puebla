"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Pt = { x: number; y: number };

/**
 * Crayon scribble next to the PUEBLA headline: "check out the blog here!" with a
 * hand-drawn arrow that bends up to the Blog tab in the top nav.
 * Sits inside .hero-title (position: relative), so the arrow is drawn in that box's coordinates.
 */
export default function BlogNudge() {
  const noteRef = useRef<HTMLAnchorElement>(null);
  const [arrow, setArrow] = useState<{ s: Pt; e: Pt; side: boolean } | null>(null);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const note = noteRef.current;
        const box = note?.parentElement;
        const tab = document.querySelector<HTMLElement>('.topnav a.tab[href="/blog"]');
        if (!note || !box || !tab) return setArrow(null);
        const b = box.getBoundingClientRect(), n = note.getBoundingClientRect(), t = tab.getBoundingClientRect();
        const nav = tab.closest(".topnav")?.getBoundingClientRect();
        const e = { x: t.left + t.width / 2 - b.left, y: Math.max(t.bottom, nav?.bottom ?? 0) + 10 - b.top };
        // Wide screens: swoop out of the right side of the note. Narrow: straight up off the top.
        const side = e.x - (n.right - b.left) > 120;
        const s = side
          ? { x: n.right + 8 - b.left, y: n.top + n.height * 0.28 - b.top }
          : { x: n.right - 16 - b.left, y: n.top - 2 - b.top };
        setArrow(s.y - e.y > 12 ? { s, e, side } : null);
      });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  let path = "", path2 = "", head = "";
  if (arrow) {
    const { s, e, side } = arrow;
    const dx = e.x - s.x, dy = s.y - e.y;
    // side: dip a little to the right, then hook up into the tab. Otherwise: a lazy S straight up.
    const c1 = side ? { x: s.x + dx * 0.5, y: s.y + 34 } : { x: s.x - 10, y: s.y - dy * 0.5 };
    const c2 = side ? { x: e.x + 6, y: e.y + Math.max(dy, 40) * 1.4 } : { x: e.x - 6, y: e.y + dy * 0.6 };
    path = `M${s.x} ${s.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${e.x} ${e.y}`;
    // a second, slightly-off pass so it looks like it was scribbled twice
    path2 = `M${s.x + 2} ${s.y - 1} C${c1.x + 3} ${c1.y + 2} ${c2.x + 2} ${c2.y - 1} ${e.x + 1} ${e.y + 1}`;
    const ang = Math.atan2(e.y - c2.y, e.x - c2.x), len = side ? 18 : 12, spread = 0.5;
    const a = { x: e.x - len * Math.cos(ang - spread), y: e.y - len * Math.sin(ang - spread) };
    const c = { x: e.x - len * Math.cos(ang + spread), y: e.y - len * Math.sin(ang + spread) };
    head = `M${a.x} ${a.y} L${e.x} ${e.y} L${c.x} ${c.y}`;
  }

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <filter id="crayon" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="2" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.15" result="mask" />
          <feComposite in="rough" in2="mask" operator="in" />
        </filter>
      </svg>

      <Link ref={noteRef} href="/blog" className="nudge">
        check out<br />the blog<br />here!
      </Link>

      {arrow && (
        <svg className="nudge-arrow" aria-hidden="true" focusable="false">
          <g filter="url(#crayon)">
            <path d={path} pathLength={1} className="draw" />
            <path d={path2} pathLength={1} className="draw ghost" />
            <path d={head} pathLength={1} className="draw tip" />
          </g>
        </svg>
      )}
    </>
  );
}
