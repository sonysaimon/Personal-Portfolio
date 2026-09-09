// Wall-clock <-> UTC conversion for an IANA timezone, without a library (server side).
import { pad } from "./time";

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function formatter(tz: string) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || !tz) return false;
  try { formatter(tz); return true; } catch { return false; }
}

function parts(tz: string, at: Date) {
  const p: Record<string, number> = {};
  for (const x of formatter(tz).formatToParts(at)) if (x.type !== "literal") p[x.type] = Number(x.value);
  return p;
}

function offsetMinutes(tz: string, at: Date): number {
  const p = parts(tz, at);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** "2026-09-09" + "14:30" in tz → UTC Date */
export function zonedToUtc(dateKey: string, hhmm: string, tz: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off1 = offsetMinutes(tz, new Date(guess));
  let t = guess - off1 * 60000;
  const off2 = offsetMinutes(tz, new Date(t));
  if (off2 !== off1) t = guess - off2 * 60000;
  return new Date(t);
}

/** UTC Date → { dateKey, min } in tz */
export function utcToZoned(at: Date, tz: string): { dateKey: string; min: number } {
  const p = parts(tz, at);
  return { dateKey: `${p.year}-${pad(p.month)}-${pad(p.day)}`, min: (p.hour % 24) * 60 + p.minute };
}
