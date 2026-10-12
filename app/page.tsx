import Itinerary from "@/components/itinerary/Itinerary";
import { BOOKINGS, NOTES, SOURCES } from "@/lib/content";

// "**bold** text" → <b>bold</b> text
function Rich({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : part)}</>;
}

export default function ItineraryPage() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Itinerary · Puebla, México</div>
          <h1>Pue<span>bla</span></h1>
          <div className="dates">Oct 19 <em>—</em> Oct 28, 2026</div>
          <p className="lede">Land in CDMX late on the 19th, roll into Puebla around 2 am, and fly out of CDMX at 12:30 am on the 29th. Everything in between is built around Patrick’s classes: three pyramid sites, an Atlixco Day of the Dead night, Alpinia, Africam Safari, lucha libre, and enough nights out to need the chill ones.</p>
        </div>
        <div className="stats">
          <div className="stat"><b>3</b><span>pyramid sites: Cholula, Teotihuacan, Cacaxtla</span></div>
          <div className="stat"><b>4</b><span>nights out, plus lucha libre Mon 26</span></div>
          <div className="stat"><b>2</b><span>classes Patrick skips (Thu 22, Mon 26)</span></div>
          <div className="stat"><b>4</b><span>gym sessions, every other day</span></div>
        </div>
      </section>

      <Itinerary />

      <section className="sec" aria-labelledby="h-notes">
        <div className="sec-head"><h2 id="h-notes">Know before you go</h2></div>
        <div className="notes">
          {NOTES.map((n) => (
            <div key={n.title} className={`note${n.warn ? " warn" : ""}`}><h3>{n.title}</h3><p>{n.body}</p></div>
          ))}
        </div>
      </section>

      <section className="sec" aria-labelledby="h-book">
        <div className="sec-head">
          <h2 id="h-book">Book ahead</h2>
          <p>Ordered by urgency. Prices per person unless noted, checked Oct 12. Bring cash for most places.</p>
        </div>
        <div className="book">
          <div className="brow head"><div>What</div><div>Date</div><div>Book</div><div>Cost</div><div>Links</div></div>
          {BOOKINGS.map((b) => (
            <div key={b.title} className="brow">
              <div><h4>{b.title}</h4><p>{b.desc}</p></div>
              <div><span className="lbl">Date</span><span className="bwhen">{b.when}</span></div>
              <div><span className="lbl">Book</span><span className={`urg ${b.urg}`}>{b.urgText}</span></div>
              <div className="bcost"><span className="lbl">Cost</span><Rich text={b.cost} /></div>
              <div className="blinks">
                <span className="lbl">Links</span>
                {b.links.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}
                {b.extra && <span>{b.extra}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sources">
        <b>Sources checked Oct 3–12, 2026</b>
        <ul>
          {SOURCES.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>)}
        </ul>
      </div>
    </>
  );
}
