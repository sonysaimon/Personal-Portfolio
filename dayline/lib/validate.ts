import { isDateKey, isHHMM, toMin } from "./time";
import type { Prefs } from "./types";

export const FOCUS = ["early", "late", "afternoon", "evening"] as const;
export const PRIORITY = ["high", "medium", "low"] as const;

export const str = (v: unknown, max = 200): string | null => (typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null);
export const optStr = (v: unknown, max = 200): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const intIn = (v: unknown, lo: number, hi: number): number | null => { const n = Number(v); return Number.isInteger(n) && n >= lo && n <= hi ? n : null; };
export const dateOrNull = (v: unknown): string | null | undefined => (v === null || v === "" ? null : isDateKey(v) ? v : undefined);
export const hhmm = (v: unknown): string | null => (isHHMM(v) ? v : null);
export const range = (start: unknown, end: unknown): { start: string; end: string } | null => {
  const s = hhmm(start), e = hhmm(end);
  return s && e && toMin(e) > toMin(s) ? { start: s, end: e } : null;
};
export const daysArr = (v: unknown): number[] | null =>
  Array.isArray(v) && v.length > 0 && v.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) ? Array.from(new Set(v as number[])).sort() : null;

export function prefsPatch(body: Record<string, unknown>): Partial<Prefs> | null {
  const out: Partial<Prefs> = {};
  if ("dayStart" in body) { const v = hhmm(body.dayStart); if (!v) return null; out.dayStart = v; }
  if ("dayEnd" in body) { const v = hhmm(body.dayEnd); if (!v) return null; out.dayEnd = v; }
  if ("lunch" in body) { const v = hhmm(body.lunch); if (!v) return null; out.lunch = v; }
  if ("focus" in body) { if (!FOCUS.includes(body.focus as Prefs["focus"])) return null; out.focus = body.focus as Prefs["focus"]; }
  if ("blockMin" in body) { const v = intIn(body.blockMin, 15, 480); if (v === null) return null; out.blockMin = v; }
  if ("breakMin" in body) { const v = intIn(body.breakMin, 0, 120); if (v === null) return null; out.breakMin = v; }
  return out;
}

export async function json(req: Request): Promise<Record<string, unknown> | null> {
  try { const b = await req.json(); return b && typeof b === "object" && !Array.isArray(b) ? b : null; } catch { return null; }
}
