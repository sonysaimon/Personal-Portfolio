// Browser-side helpers: resolve normalised events onto a local-timezone day.
import type { CalEvent } from "./types";
import { key } from "./time";

export interface DayBlock { id: string; source: CalEvent["source"]; title: string; startMin: number; endMin: number; allDay: boolean; busy: boolean; location?: string }

const minOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Events touching a local date key. Timed events are clamped to the day; all-day events get allDay=true. */
export function eventsOnDay(events: CalEvent[], dateKey: string): DayBlock[] {
  const out: DayBlock[] = [];
  for (const e of events) {
    if (e.allDay) {
      if (e.start <= dateKey && dateKey < e.end) out.push({ id: e.id, source: e.source, title: e.title, startMin: 0, endMin: 0, allDay: true, busy: e.busy, location: e.location });
      continue;
    }
    const s = new Date(e.start), en = new Date(e.end);
    const sk = key(s), ek = key(en);
    if (sk > dateKey || ek < dateKey) continue;
    const startMin = sk < dateKey ? 0 : minOf(s);
    let endMin = ek > dateKey ? 24 * 60 : minOf(en);
    if (ek === dateKey && endMin === 0 && sk < dateKey) continue; // ended exactly at midnight
    if (endMin <= startMin) endMin = startMin + 15;
    out.push({ id: e.id, source: e.source, title: e.title, startMin, endMin, allDay: false, busy: e.busy, location: e.location });
  }
  return out.sort((a, b) => a.startMin - b.startMin);
}

export const browserTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };
