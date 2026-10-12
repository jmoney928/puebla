export const NOTES: { title: string; body: string; warn?: boolean }[] = [
  { warn: true, title: "Teotihuacan right now", body: "The site reopened in April 2026 after a shooting at the Pyramid of the Moon, with National Guard security added. The Moon pyramid is closed until further notice and the Sun pyramid can’t be climbed. Check INAH’s status the day before." },
  { title: "Opening days matter", body: "Cholula’s zone is open Wed–Sun only, 9–5. Cantona is Tue–Sat. Teotihuacan, Cacaxtla and Africam are daily. Alpinia’s zip lines run weekends only. Sundays are free entry for Mexican residents, so pyramids are packed. That’s why none are scheduled on Sunday." },
  { title: "Cholula tunnels", body: "INAH says the tunnels under the pyramid reopen before the end of 2026, with no date announced as of the latest reports. If they’re open by the 21st, add an hour to that morning." },
  { title: "Altitude", body: "Puebla sits around 2,150 m and Alpinia is higher still on Iztaccíhuatl’s slopes. Keep the first gym session light, drink more water than you think, and pack a jacket for Alpinia." },
  { title: "Getting around", body: "CDMX airport ↔ Puebla is about 2–2.5 h by Uber late at night and 2.5–3 h+ in evening traffic; Estrella Roja runs direct airport buses as a backup. Uber works in Puebla and Cholula. For Teotihuacan and Alpinia, hire a driver for the day or rent a car. The bus to Teotihuacan means a transfer at CDMX Norte and roughly 3.5 hours each way." },
  { title: "Time + season", body: "Puebla is 1 hour ahead of Victoria during the trip. Late October is dry season. Mornings are cool, afternoons warm, and Día de Muertos altars and marigolds go up all over town the last week." },
];

export type Urg = "now" | "week" | "few" | "door";
export const BOOKINGS: {
  title: string; desc: string; when: string; urg: Urg; urgText: string; cost: string; links: [string, string][]; extra?: string;
}[] = [
  { title: "Valle de Catrinas (Catrinia)", desc: "Saturday is a show night and weekend tickets go first. Pick the parade time that lets you get there from Atlixco around 6 pm.", when: "Sat Oct 24", urg: "now", urgText: "Now", cost: "**400 / 650 / 900 MXN** per person by tier, plus fees. Classic is enough.", links: [["Buy tickets (Taquillacero)", "https://taquillacero.com/site/elegir/evento/catrinia/foro/centro-de-convenciones-de-atlixco"], ["Event info", "https://catrinia.com/valle-de-catrinas/"]] },
  { title: "Alpinia", desc: "Weekend visits need a reservation. Ask about zip-line prices when you book, since they cost extra and aren’t listed online.", when: "Sun Oct 25", urg: "now", urgText: "Now", cost: "**180 MXN** entry per person. Zip lines extra. Driver or Uber there and back ~2,000–2,500 MXN per car.", links: [["Reserve", "https://alpinia.mx/abierto/#reserva"]], extra: "Email: info@alpinia.mx" },
  { title: "Teotihuacan driver", desc: "Nothing official to book here. Hire one driver for the full day (8:30 am pickup, wait at the site, drive back). Ask the Airbnb host or Patrick’s friends for a local driver first, it’s the cheapest option.", when: "Fri Oct 23", urg: "week", urgText: "By Oct 16", cost: "**~3,500–4,500 MXN** per car for the day, split 4 ways. Daytrip is one-way only, from US$40 per person.", links: [["Daytrip: Puebla → Teotihuacan", "https://daytrip.com/en/transfers/puebla-mx/teotihuacan-mx"], ["GetYourGuide private tours", "https://www.getyourguide.com/teotihuacan-l17038/private-tours-tc221/"]] },
  { title: "Africam Safari", desc: "Buying online skips the ticket-office line. No car? Check the park’s safari-vehicle combos on the ticket page.", when: "Thu Oct 22", urg: "few", urgText: "Few days before", cost: "**458 MXN** per adult. Uber ~300 MXN each way per car.", links: [["Buy tickets", "https://africam.myshopify.com/collections/boletos-y-combos"], ["Park site", "https://africamsafari.com/"]] },
  { title: "Lucha libre, Arena Puebla", desc: "Monday shows rarely sell out, so the box office on the night works too. Ring General is the sweet spot.", when: "Mon Oct 26 · 8 pm", urg: "few", urgText: "Few days before", cost: "**112–472 MXN** per person by section.", links: [["Ticketmaster (Arena Puebla)", "https://www.ticketmaster.com.mx/arena-puebla-boletos-puebla/venue/164672"], ["CMLL arena page", "https://cmll.com/arenas/arena-puebla/"]] },
  { title: "Airport rides", desc: "Order the Uber after you land; inter-city Uber pre-booking is unreliable. Estrella Roja buses run around the clock from the CDMX airport as backup.", when: "Oct 19 & 28", urg: "door", urgText: "On the day", cost: "**~2,000 MXN** per car each way, more after midnight.", links: [["Estrella Roja tickets", "https://www.estrellaroja.com.mx/"]] },
  { title: "Teotihuacan entry", desc: "Pay at the gate. Bring cash, cards aren’t reliably accepted. The INAH site sells online too, but foreign cards often get declined.", when: "Fri Oct 23", urg: "door", urgText: "At the door", cost: "**~90–210 MXN** per person (sources disagree).", links: [["INAH tickets", "https://boletos.inah.gob.mx/"]] },
  { title: "Everything else", desc: "Cholula pyramid (Wed–Sun), Cacaxtla, Estrella de Puebla (Tue–Sun 1–9 pm), Museo Amparo, Museo del Barroco. Optional: Talavera Uriarte workshop tour, book a day ahead.", when: "Various", urg: "door", urgText: "At the door", cost: "Cholula **~105–210**, Estrella **80**, museums **~50–100** MXN each.", links: [["Talavera Uriarte tour", "https://www.uriartetalavera.com.mx/recorrido-guiado"]] },
];

export const SOURCES: [string, string][] = [
  ["Teotihuacan hours & fees 2026", "https://www.tusbuenasnoticias.com/noticias/turismo/2026/01/20/55904-estos-son-los-dias-y-horarios-para-visitar-las-piramides-de-teotihuacan"],
  ["Teotihuacan reopening, April 2026", "https://www.ejecentral.com.mx/nuestro-eje/hoy-reabre-teotihuacan-sin-acceso-a-las-piramides-de-la-luna-y-el-sol-que-espacios-si-estan-abiertos-horario-y-articulos-permitidos"],
  ["Cholula pyramid hours & cost 2026", "https://municipiospuebla.mx/nota/puebla/conoce-el-costo-de-acceso-la-piramide-de-cholula-este-2026"],
  ["Cholula tunnels reopening (El Universal Puebla)", "https://www.eluniversalpuebla.com.mx/estado/tuneles-de-cholula-reabriran-antes-de-terminar-2026-inah/"],
  ["Valle de Catrinas 2026 dates & tickets", "https://www.poblanerias.com/2026/09/valle-de-catrinas-en-atlixco-2026/"],
  ["CMLL Arena Puebla", "https://cmll.com/arenas/arena-puebla/"],
  ["Cantona hours & access", "https://www.eluniversalpuebla.com.mx/que-hacer/como-llegar-a-cantona-la-zona-arqueologica-de-puebla-que-es-unica-en-su-tipo/"],
  ["Alpinia hours & activities", "https://www.tripadvisor.com/Attraction_Review-g152773-d12286760-Reviews-Alpinia-Puebla_Central_Mexico_and_Gulf_Coast.html"],
  ["Africam Safari hours & prices", "https://www.eluniversalpuebla.com.mx/que-hacer/africam-safari-horarios-precios-y-como-llegar-desde-la-cdmx/"],
  ["Cacaxtla-Xochitécatl hours", "https://capital-cdmx.org/cacaxtla-xochitecatl-horarios-costo-y-como-visitar-la-zona-arqueologica-de-tlaxcala/"],
  ["Africam ticket prices", "https://africam.myshopify.com/collections/boletos-y-combos"],
  ["Alpinia official site", "https://alpinia.mx/"],
  ["Catrinia ticket page", "https://catrinia.com/valle-de-catrinas/"],
  ["Estrella de Puebla prices", "https://www.eluniversalpuebla.com.mx/que-hacer/estrella-de-puebla-precios-horarios-y-todo-lo-que-debes-saber-de-la-rueda-de-la-fortuna/"],
  ["Lucha libre prices 2026", "https://www.poblanerias.com/2026/09/donde-ver-lucha-libre-en-puebla-arenas/"],
  ["Estrella Roja airport buses", "https://blog.estrellaroja.com.mx/terminales/autobus-puebla-aeropuerto-cdmx/"],
];
