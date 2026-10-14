"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Secret: the page background is a scratch-off ticket. It looks exactly like the normal
 * background until you click and drag on it, which scratches away to reveal the Mexican flag.
 * It only scratches while a mouse (or pen) button is held down and moving. Touch is left
 * alone so phones still scroll normally.
 */

// Things you can click or read closely: pressing on these never starts a scratch.
const SKIP = "a,button,input,textarea,select,label,summary,[contenteditable],[role=button],.post,.day,.stat,.gridbox,.comment,.cform,.composer,.rpicker,.lightbox,.topnav,.chip,.photo,.nudge,.fiesta";

function isDark() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  const m = bg.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return window.matchMedia("(prefers-color-scheme: dark)").matches;
  const n = parseInt(m[1], 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 128;
}

/** The prize: Mexico's flag, softened a little so text on top stays readable. */
function drawFlag(ctx: CanvasRenderingContext2D, w: number, h: number, dark: boolean) {
  const third = w / 3;
  ctx.fillStyle = "#006847"; ctx.fillRect(0, 0, Math.ceil(third), h);
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(Math.floor(third), 0, Math.ceil(third) + 1, h);
  ctx.fillStyle = "#CE1126"; ctx.fillRect(Math.floor(third * 2), 0, w - Math.floor(third * 2), h);

  // Simplified coat of arms: eagle on a cactus, over the lake, inside a wreath.
  const cx = w / 2, cy = h / 2, r = Math.min(third * 0.36, h * 0.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#3E7B34"; ctx.lineWidth = r * 0.09;
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.95, side < 0 ? Math.PI * 0.55 : Math.PI * 0.05, side < 0 ? Math.PI * 0.95 : Math.PI * 0.45); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = (side < 0 ? Math.PI * 0.6 : Math.PI * 0.1) + i * Math.PI * 0.08;
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.95, r * 0.05 + Math.sin(a) * r * 0.95, r * 0.11, r * 0.05, a + side * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = "#4F8F3A"; ctx.fill();
    }
  }
  ctx.fillStyle = "#2F7FB8"; ctx.beginPath(); ctx.ellipse(0, r * 0.72, r * 0.55, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5C9A3C";
  ctx.beginPath(); ctx.ellipse(0, r * 0.38, r * 0.16, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-r * 0.22, r * 0.3, r * 0.1, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r * 0.22, r * 0.3, r * 0.1, r * 0.18, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7A4A1E";
  ctx.beginPath(); ctx.ellipse(0, -r * 0.08, r * 0.22, r * 0.3, 0.15, 0, Math.PI * 2); ctx.fill(); // body
  ctx.beginPath(); ctx.moveTo(-r * 0.1, -r * 0.2); ctx.quadraticCurveTo(-r * 0.75, -r * 0.75, -r * 0.62, -r * 0.05); ctx.quadraticCurveTo(-r * 0.4, -r * 0.2, -r * 0.1, r * 0.05); ctx.fill(); // wing
  ctx.beginPath(); ctx.moveTo(r * 0.1, -r * 0.2); ctx.quadraticCurveTo(r * 0.7, -r * 0.65, r * 0.6, 0); ctx.quadraticCurveTo(r * 0.4, -r * 0.15, r * 0.1, r * 0.05); ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.42, r * 0.11, 0, Math.PI * 2); ctx.fill(); // head
  ctx.strokeStyle = "#3E7B34"; ctx.lineWidth = r * 0.04;
  ctx.beginPath(); ctx.moveTo(-r * 0.22, -r * 0.4); ctx.bezierCurveTo(-r * 0.45, -r * 0.3, -r * 0.3, -r * 0.1, -r * 0.5, r * 0.02); ctx.stroke(); // snake
  ctx.restore();

  // soften so the page text on top stays readable
  ctx.fillStyle = dark ? "rgba(12,17,36,.5)" : "rgba(255,255,255,.42)";
  ctx.fillRect(0, 0, w, h);
}

/** The "foil" is just the page's normal background colour, so nobody can tell there's anything under it. */
function drawFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#F3F5FB";
  ctx.fillRect(0, 0, w, h);
}

export default function ScratchBackground() {
  const flagRef = useRef<HTMLCanvasElement>(null);
  const foilRef = useRef<HTMLCanvasElement>(null);
  const [scratching, setScratching] = useState(false);

  useEffect(() => {
    const flag = flagRef.current!, foil = foilRef.current!;
    const fctx = foil.getContext("2d")!, gctx = flag.getContext("2d")!;
    let w = 0, h = 0, dpr = 1, dark = false;
    let last: { x: number; y: number } | null = null;
    let down = false;

    const paint = (keep: boolean) => {
      const nw = window.innerWidth, nh = window.innerHeight, ndpr = Math.min(window.devicePixelRatio || 1, 2), ndark = isDark();
      // keep what's been scratched when the window changes size (but start fresh if the theme flips)
      let old: HTMLCanvasElement | null = null;
      if (keep && w && h && ndark === dark) {
        old = document.createElement("canvas"); old.width = foil.width; old.height = foil.height;
        old.getContext("2d")!.drawImage(foil, 0, 0);
      }
      w = nw; h = nh; dpr = ndpr; dark = ndark;
      for (const c of [flag, foil]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      gctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawFlag(gctx, w, h, dark);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.globalCompositeOperation = "source-over";
      if (old) { fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.drawImage(old, 0, 0, foil.width, foil.height); fctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      else drawFoil(fctx, w, h);
    };

    const scratch = (x: number, y: number) => {
      fctx.globalCompositeOperation = "destination-out";
      fctx.lineCap = "round"; fctx.lineJoin = "round"; fctx.lineWidth = 46;
      fctx.beginPath();
      if (last) { fctx.moveTo(last.x, last.y); fctx.lineTo(x, y); } else { fctx.moveTo(x, y); fctx.lineTo(x + 0.1, y); }
      fctx.stroke();
      // ragged edge, like a coin catching the foil
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 8;
        fctx.beginPath(); fctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.5 + Math.random() * 3, 0, Math.PI * 2); fctx.fill();
      }
      fctx.globalCompositeOperation = "source-over";
      last = { x, y };
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      if ((e.target as Element | null)?.closest?.(SKIP)) return;
      down = true; last = null;
      e.preventDefault(); // no text-selection drag while scratching
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerType === "touch") return;
      if (!(e.buttons & 1)) { down = false; last = null; setScratching(false); return; }
      setScratching(true);
      scratch(e.clientX, e.clientY);
    };
    const onUp = () => { down = false; last = null; setScratching(false); };

    paint(false);

    let t = 0;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(() => paint(true), 120); };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => paint(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onScheme);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onScheme);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("scratching", scratching);
  }, [scratching]);

  return (
    <>
      <div className="scratchbg" aria-hidden="true">
        <canvas ref={flagRef} />
        <canvas ref={foilRef} />
      </div>
    </>
  );
}
