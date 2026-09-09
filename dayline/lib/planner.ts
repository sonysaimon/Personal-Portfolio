// Day planner. Kept algorithmically identical to the original dayflow.jsx buildPlan():
// classes/events first, lunch protected, focus tasks in the preferred window,
// quick tasks in leftover gaps, blocks capped with breaks.
import type { ClassBlock, Prefs, Priority, Task } from "./types";
import { parseKey, toMin } from "./time";

/** A timed event already resolved to minutes on the plan day (tz handled by the caller). */
export interface DayEvent { title: string; startMin: number; endMin: number; sub?: string }

export type PlanKind = "class" | "event" | "break" | "deep" | "task";
export interface PlanItem { kind: PlanKind; title: string; sub?: string; start: number; end: number; taskId?: string; partial?: boolean }
export interface FreeSlot { start: number; end: number }
export interface Plan { items: PlanItem[]; unplaced: Task[]; free: FreeSlot[] }

export interface PlanInput { prefs: Prefs; classes: ClassBlock[]; events: DayEvent[]; tasks: Task[] }

export function buildPlan(dateKey: string, data: PlanInput): Plan {
  const { prefs, classes, events, tasks } = data;
  const d = parseKey(dateKey);
  const dayStart = toMin(prefs.dayStart), dayEnd = toMin(prefs.dayEnd);

  const busy: PlanItem[] = [
    ...classes.filter((c) => c.days.includes(d.getDay())).map((c): PlanItem => ({ kind: "class", title: c.name, sub: c.location || undefined, start: toMin(c.start), end: toMin(c.end) })),
    ...events.map((e): PlanItem => ({ kind: "event", title: e.title, sub: e.sub, start: e.startMin, end: e.endMin })),
  ].sort((a, b) => a.start - b.start);

  const lunchStart = toMin(prefs.lunch);
  const lunch: PlanItem = { kind: "break", title: "Lunch", start: lunchStart, end: lunchStart + 45 };
  if (!busy.some((b) => b.start < lunch.end && b.end > lunch.start)) busy.push(lunch);
  busy.sort((a, b) => a.start - b.start);

  // free slots
  const free: FreeSlot[] = [];
  let cursor = dayStart;
  for (const b of busy) {
    if (b.start > cursor) free.push({ start: cursor, end: Math.min(b.start, dayEnd) });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < dayEnd) free.push({ start: cursor, end: dayEnd });

  // rank slots by focus preference
  const center = { early: 8 * 60, late: 11 * 60, afternoon: 14.5 * 60, evening: 19 * 60 }[prefs.focus] ?? 8 * 60;
  const ranked = free.slice().sort((a, b) => Math.abs((a.start + a.end) / 2 - center) - Math.abs((b.start + b.end) / 2 - center));
  const slots = ranked.map((s) => ({ ...s, cursor: s.start }));

  // task order
  const pr: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const open = tasks.filter((t) => !t.done).sort((a, b) => {
    const ad = a.due && a.due <= dateKey ? 0 : 1, bd = b.due && b.due <= dateKey ? 0 : 1;
    if (ad !== bd) return ad - bd;
    if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
    return (a.due || "9") < (b.due || "9") ? -1 : 1;
  });
  const deep = open.filter((t) => t.deep), shallow = open.filter((t) => !t.deep);

  const placed: PlanItem[] = [];
  const unplaced: Task[] = [];
  const place = (t: Task, order: typeof slots) => {
    const len = Math.min(t.estMin, prefs.blockMin);
    for (const s of order) {
      if (s.end - s.cursor >= len) {
        placed.push({ kind: t.deep ? "deep" : "task", title: t.title, start: s.cursor, end: s.cursor + len, taskId: t.id, partial: t.estMin > len });
        s.cursor += len + prefs.breakMin;
        return true;
      }
    }
    return false;
  };
  for (const t of deep) if (!place(t, slots)) unplaced.push(t);
  for (const t of shallow) if (!place(t, slots.slice().reverse())) unplaced.push(t);

  const items = [...busy, ...placed].sort((a, b) => a.start - b.start);
  return { items, unplaced, free };
}
