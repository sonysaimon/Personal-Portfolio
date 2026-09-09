import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest } from "@/lib/session";
import { mergedEvents } from "@/lib/events";
import { buildPlan, type DayEvent } from "@/lib/planner";
import { classOut, prefsOut, taskOut } from "@/lib/serialize";
import { isDateKey, toMin } from "@/lib/time";
import { isValidTimeZone, utcToZoned } from "@/lib/tz";

/** GET /api/plan?date=YYYY-MM-DD&tz=Area/City — same buildPlan() the UI uses, run server-side. */
export async function GET(req: NextRequest) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const q = req.nextUrl.searchParams;
  const date = q.get("date"), tz = q.get("tz") ?? "UTC";
  if (!isDateKey(date)) return badRequest("date must be YYYY-MM-DD");
  if (!isValidTimeZone(tz)) return badRequest("Bad tz");

  const [prefs, classes, tasks, ev] = await Promise.all([
    prisma.preferences.upsert({ where: { userId }, update: {}, create: { userId } }),
    prisma.classBlock.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    mergedEvents(userId, date, date, tz),
  ]);
  const p = prefsOut(prefs);
  const dayEnd = toMin(p.dayEnd);
  const events: DayEvent[] = ev.events.filter((e) => !e.allDay && e.busy).flatMap((e) => {
    const s = utcToZoned(new Date(e.start), tz), en = utcToZoned(new Date(e.end), tz);
    const startMin = s.dateKey < date ? 0 : s.dateKey > date ? null : s.min;
    const endMin = en.dateKey > date ? Math.max(dayEnd, 24 * 60) : en.dateKey < date ? null : en.min;
    return startMin === null || endMin === null || endMin <= startMin ? [] : [{ title: e.title, startMin, endMin, sub: e.location }];
  });
  const plan = buildPlan(date, { prefs: p, classes: classes.map(classOut), events, tasks: tasks.map(taskOut) });
  return Response.json({ date, tz, ...plan, providers: ev.providers }, { headers: { "Cache-Control": "private, no-store" } });
}
