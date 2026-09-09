import type { ClassBlock, LocalEvent, Prefs, Task } from "./types";

type DbTask = { id: string; title: string; estMin: number; deep: boolean; priority: string; due: Date | null; done: boolean; createdAt: Date };
type DbClass = { id: string; name: string; days: number[]; start: string; end: string; location: string | null };
type DbLocal = { id: string; title: string; date: Date; start: string; end: string };
type DbPrefs = { dayStart: string; dayEnd: string; focus: string; lunch: string; blockMin: number; breakMin: number };

export const dateKeyOf = (d: Date) => d.toISOString().slice(0, 10);

export const taskOut = (t: DbTask): Task => ({ id: t.id, title: t.title, estMin: t.estMin, deep: t.deep, priority: t.priority as Task["priority"], due: t.due ? dateKeyOf(t.due) : null, done: t.done, createdAt: t.createdAt.toISOString() });
export const classOut = (c: DbClass): ClassBlock => ({ id: c.id, name: c.name, days: c.days, start: c.start, end: c.end, location: c.location ?? "" });
export const localOut = (e: DbLocal): LocalEvent => ({ id: e.id, title: e.title, date: dateKeyOf(e.date), start: e.start, end: e.end });
export const prefsOut = (p: DbPrefs): Prefs => ({ dayStart: p.dayStart, dayEnd: p.dayEnd, focus: p.focus as Prefs["focus"], lunch: p.lunch, blockMin: p.blockMin, breakMin: p.breakMin });
