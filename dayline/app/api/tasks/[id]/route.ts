import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest, notFound } from "@/lib/session";
import { taskOut } from "@/lib/serialize";
import { dateOrNull, intIn, json, PRIORITY, str } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const { id } = await params;
  const body = await json(req); if (!body) return badRequest("Invalid JSON");
  const data: Record<string, unknown> = {};
  if ("title" in body) { const v = str(body.title); if (!v) return badRequest("Title is required"); data.title = v; }
  if ("estMin" in body) { const v = intIn(body.estMin, 5, 600); if (v === null) return badRequest("Minutes must be 5–600"); data.estMin = v; }
  if ("deep" in body) data.deep = !!body.deep;
  if ("done" in body) data.done = !!body.done;
  if ("priority" in body) { if (!PRIORITY.includes(body.priority as never)) return badRequest("Bad priority"); data.priority = body.priority; }
  if ("due" in body) { const v = dateOrNull(body.due); if (v === undefined) return badRequest("Bad due date"); data.due = v ? new Date(v) : null; }
  const r = await prisma.task.updateMany({ where: { id, userId }, data });
  if (r.count === 0) return notFound();
  const t = await prisma.task.findUnique({ where: { id } });
  return Response.json(taskOut(t!));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const { id } = await params;
  const r = await prisma.task.deleteMany({ where: { id, userId } });
  if (r.count === 0) return notFound();
  return new Response(null, { status: 204 });
}
