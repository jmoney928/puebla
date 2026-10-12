"use client";
import { useEffect, useState } from "react";

export default function Lightbox({ urls, index, onClose }: { urls: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const go = (d: number) => setI((cur) => (cur + d + urls.length) % urls.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urls[i]} alt="" onClick={(e) => e.stopPropagation()} />
      <button type="button" className="lbclose" onClick={onClose} aria-label="Close">×</button>
      {urls.length > 1 && (
        <>
          <button type="button" className="lbnav prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo">‹</button>
          <button type="button" className="lbnav next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo">›</button>
          <span className="lbcount">{i + 1} / {urls.length}</span>
        </>
      )}
      <a className="lbopen" href={urls[i]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Open full size ↗</a>
    </div>
  );
}
