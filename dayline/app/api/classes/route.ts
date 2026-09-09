import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest } from "@/lib/session";
import { classOut } from "@/lib/serialize";
import { daysArr, json, optStr, range, str } from "@/lib/validate";

export async function GET() {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const rows = await prisma.classBlock.findMany({ where: { userId }, orderBy: { start: "asc" } });
  return Response.json(rows.map(classOut));
}

export async function POST(req: Request) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const body = await json(req); if (!body) return badRequest("Invalid JSON");
  const name = str(body.name, 80); if (!name) return badRequest("Course name is required");
  const days = daysArr(body.days); if (!days) return badRequest("Pick at least one day");
  const r = range(body.start, body.end); if (!r) return badRequest("End must be after start");
  const c = await prisma.classBlock.create({ data: { userId, name, days, start: r.start, end: r.end, location: optStr(body.location, 80) || null } });
  return Response.json(classOut(c), { status: 201 });
}
