import type { NextRequest } from "next/server";
import { currentUserId, unauthorized, badRequest } from "@/lib/session";
import { mergedEvents } from "@/lib/events";
import { isDateKey, parseKey } from "@/lib/time";
import { isValidTimeZone } from "@/lib/tz";

/** GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=Area/City (max 62 days) */
export async function GET(req: NextRequest) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const q = req.nextUrl.searchParams;
  const from = q.get("from"), to = q.get("to") ?? from, tz = q.get("tz") ?? "UTC";
  if (!isDateKey(from) || !isDateKey(to) || to < from) return badRequest("from/to must be YYYY-MM-DD with to >= from");
  if ((parseKey(to).getTime() - parseKey(from).getTime()) / 86400000 > 62) return badRequest("Range too large");
  if (!isValidTimeZone(tz)) return badRequest("Bad tz");
  const data = await mergedEvents(userId, from, to, tz);
  return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
