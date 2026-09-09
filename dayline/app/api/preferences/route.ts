import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest } from "@/lib/session";
import { prefsOut } from "@/lib/serialize";
import { json, prefsPatch } from "@/lib/validate";

export async function GET() {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const p = await prisma.preferences.upsert({ where: { userId }, update: {}, create: { userId } });
  return Response.json(prefsOut(p));
}

export async function PUT(req: Request) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const body = await json(req); if (!body) return badRequest("Invalid JSON");
  const patch = prefsPatch(body); if (!patch) return badRequest("Invalid preferences");
  const p = await prisma.preferences.upsert({ where: { userId }, update: patch, create: { userId, ...patch } });
  return Response.json(prefsOut(p));
}
