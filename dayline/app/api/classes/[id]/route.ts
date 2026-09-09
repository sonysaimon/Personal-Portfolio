import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, notFound } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const { id } = await params;
  const r = await prisma.classBlock.deleteMany({ where: { id, userId } });
  if (r.count === 0) return notFound();
  return new Response(null, { status: 204 });
}
