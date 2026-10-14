"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MariachiToggle from "./Mariachi";

export default function SiteHeader() {
  const path = usePathname();
  const tabs = [
    { href: "/", label: "Itinerary" },
    { href: "/blog", label: "Blog" },
  ];
  return (
    <header className="site-head">
      <div className="picado" aria-hidden="true">
        <div className="flags">{Array.from({ length: 26 }, (_, i) => <div key={i} className="flag" />)}</div>
      </div>
      <nav className="topnav" aria-label="Sections">
        <div className="navleft">
          <Link href="/" className="brand">Puebla <span>’26</span></Link>
          <MariachiToggle />
        </div>
        <div className="tabs">
          {tabs.map((t) => {
            const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className="tab" aria-current={on ? "page" : undefined}>{t.label}</Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
