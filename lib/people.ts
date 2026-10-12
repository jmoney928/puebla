export const PEOPLE = [
  { name: "Alec", color: "var(--cobalt)" },
  { name: "Sullivan", color: "var(--rosa)" },
  { name: "Jack", color: "var(--marigold)" },
  { name: "Patrick", color: "var(--teal)" },
] as const;

export type Person = (typeof PEOPLE)[number]["name"];
export const NAMES: readonly string[] = PEOPLE.map((p) => p.name);
export const isPerson = (v: unknown): v is Person => typeof v === "string" && NAMES.includes(v);
export const colorOf = (name: string) => PEOPLE.find((p) => p.name === name)?.color ?? "var(--muted)";

// Trip days for the journal, Oct 19–28, 2026
export const TRIP_DAYS = Array.from({ length: 10 }, (_, i) => {
  const d = 19 + i;
  const iso = `2026-10-${String(d).padStart(2, "0")}`;
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(iso + "T12:00:00").getDay()];
  return { iso, d, dow, label: `${dow} ${d}` };
});
export const isTripDay = (v: unknown): v is string => typeof v === "string" && TRIP_DAYS.some((t) => t.iso === v);
