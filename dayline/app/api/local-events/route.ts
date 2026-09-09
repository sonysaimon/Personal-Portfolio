import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest } from "@/lib/session";
import { localOut } from "@/lib/serialize";
import { json, range, str } from "@/lib/validate";
import { isDateKey } from "@/lib/time";

export async function GET() {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const rows = await prisma.localEvent.findMany({ where: { userId }, orderBy: [{ date: "asc" }, { start: "asc" }] });
  return Response.json(rows.map(localOut));
}

export async function POST(req: Request) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const body = await json(req); if (!body) return badRequest("Invalid JSON");
  const title = str(body.title); if (!title) return badRequest("Title is required");
  if (!isDateKey(body.date)) return badRequest("Bad date");
  const r = range(body.start, body.end); if (!r) return badRequest("End must be after start");
  const e = await prisma.localEvent.create({ data: { userId, title, date: new Date(body.date), start: r.start, end: r.end } });
  return Response.json(localOut(e), { status: 201 });
}
