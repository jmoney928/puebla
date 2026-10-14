// Trip days for the blog, Oct 19–28, 2026
export const TRIP_DAYS = Array.from({ length: 10 }, (_, i) => {
  const d = 19 + i;
  const iso = `2026-10-${String(d).padStart(2, "0")}`;
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(iso + "T12:00:00").getDay()];
  return { iso, d, dow, label: `${dow} ${d}` };
});
export const isTripDay = (v: unknown): v is string => typeof v === "string" && TRIP_DAYS.some((t) => t.iso === v);
