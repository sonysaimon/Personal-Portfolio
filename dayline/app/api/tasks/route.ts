import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest } from "@/lib/session";
import { taskOut } from "@/lib/serialize";
import { dateOrNull, intIn, json, PRIORITY, str } from "@/lib/validate";

export async function GET() {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return Response.json(tasks.map(taskOut));
}

export async function POST(req: Request) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const body = await json(req); if (!body) return badRequest("Invalid JSON");
  const title = str(body.title); if (!title) return badRequest("Title is required");
  const estMin = intIn(body.estMin ?? 30, 5, 600); if (estMin === null) return badRequest("Minutes must be 5–600");
  const priority = PRIORITY.includes(body.priority as never) ? (body.priority as string) : "medium";
  const due = dateOrNull(body.due ?? null); if (due === undefined) return badRequest("Bad due date");
  const t = await prisma.task.create({ data: { userId, title, estMin, deep: !!body.deep, priority, due: due ? new Date(due) : null } });
  return Response.json(taskOut(t), { status: 201 });
}
