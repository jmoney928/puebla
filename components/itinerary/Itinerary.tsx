"use client";
import { useState } from "react";
import { CATS, DAYS, H0, H1, SPAN, fmt, pct, type Cat } from "@/lib/itinerary";

export default function Itinerary() {
  const [active, setActive] = useState<Cat | null>(null);
  const [hl, setHl] = useState<number | null>(null);

  const jump = (d: number) => {
    setHl(d);
    window.setTimeout(() => setHl((cur) => (cur === d ? null : cur)), 2200);
  };

  const hours: number[] = [];
  for (let h = H0 + 1; h < H1; h++) if ((h - H0) % 2 === 1) hours.push(h);

  return (
    <>
      <section className="sec" aria-labelledby="h-week">
        <div className="sec-head">
          <h2 id="h-week">The week at a glance</h2>
          <p>6 am → 2 am. Tap a day to jump to its details. Tap a category to highlight it.</p>
        </div>
        <div className="legend">
          {(Object.keys(CATS) as Cat[]).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={active === k} onClick={() => setActive(active === k ? null : k)}>
              <i className={`c-${k}`} />{CATS[k].label}
            </button>
          ))}
          <span className="chip clskey" style={{ cursor: "default" }}><i />Patrick in class</span>
        </div>
        <div className="gridbox">
          <div className={`grid${active ? " dim" : ""}`}>
            <div className="hours">
              <div />
              <div className="lane">
                {hours.map((h) => <span key={h} style={{ left: pct(h) }}>{fmt(h)}</span>)}
              </div>
            </div>
            {DAYS.map((day) => (
              <a key={day.d} className="row" href={`#day-${day.d}`} onClick={() => jump(day.d)}>
                <div className="dlabel"><b>{day.dow} {day.d}</b><small>{day.sub}</small></div>
                <div className="lanes">
                  {day.blocks.map((b, i) => (
                    <div key={i} className={`blk c-${b[2]} ${b[2]}${active === b[2] ? " on" : ""}`}
                      style={{ left: `calc(${pct(b[0])} + 2px)`, width: `calc(${((b[1] - b[0]) / SPAN * 100).toFixed(3)}% - 4px)` }}
                      title={`${fmt(b[0])}–${fmt(b[1])} · ${b[3]}`}>
                      <span>{b[3]}</span>
                    </div>
                  ))}
                  {day.cls && (
                    <div className={`cls${day.skip ? " skip" : ""}`}
                      style={{ left: pct(day.cls.s), width: `${((day.cls.e - day.cls.s) / SPAN * 100).toFixed(3)}%` }}
                      title={`Patrick class ${fmt(day.cls.s)}–${fmt(day.cls.e)}${day.skip ? " (skipping)" : ""}`} />
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="h-days">
        <div className="sec-head">
          <h2 id="h-days">Day by day</h2>
          <p>Times are a plan, not a contract. Arrival and departure slots move with your flights.</p>
        </div>
        <div className={`days${active ? " dim" : ""}`}>
          {DAYS.map((day) => {
            type Item = { s: number; e: number; cat: string; h: string; p: string };
            const items: Item[] = day.blocks.map((b) => ({ s: b[0], e: b[1], cat: b[2], h: b[3], p: b[4] }));
            if (day.cls) items.push({ s: day.cls.s, e: day.cls.e, cat: "class", h: day.skip ? "Patrick’s class (skipping)" : "Patrick in class", p: "" });
            items.sort((a, b) => a.s - b.s || (a.cat === "class" ? 1 : -1));
            return (
              <article key={day.d} className={`day${hl === day.d ? " hl" : ""}`} id={`day-${day.d}`}>
                <div className="dhead">
                  <div className="dnum">{day.d}</div>
                  <div>
                    <div className="dmeta">{day.dow} · Oct {day.d}</div>
                    <h3>{day.title}</h3>
                    <div className="tags">
                      {day.tags.map(([k, label]) => (
                        <span key={label} className={`tag ${k === "skip" || k === "chill" ? k : `c-${k} ${k}`}`}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <ul className="items">
                  {items.map((it, i) => {
                    const isC = it.cat === "class";
                    return (
                      <li key={i} className={`${isC ? `classline${day.skip ? " skipped" : ""}` : ""}${active === it.cat ? " on" : ""}`}>
                        <div className="t">{isC ? <i /> : <i className={`c-${it.cat}`} />}{fmt(it.s)}</div>
                        <div>
                          <h4>{it.h}</h4>
                          {it.p && <p>{it.p}</p>}
                          {isC && <p>{fmt(it.s)} – {fmt(it.e)}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {day.backup && <div className="backup"><b>Plan B.</b> {day.backup}</div>}
                <a className="back" href="#h-week">↑ Back to the grid</a>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
