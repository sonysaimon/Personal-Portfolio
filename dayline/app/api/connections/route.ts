import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized, badRequest, notFound } from "@/lib/session";
import { revokeTokens } from "@/lib/providers/tokens";
import type { Connection } from "@/lib/types";

const PROVIDERS = ["google", "microsoft-entra-id"] as const;

export async function GET() {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const rows = await prisma.account.findMany({ where: { userId, provider: { in: [...PROVIDERS] } }, orderBy: { createdAt: "asc" } });
  const out: Connection[] = rows.map((a) => ({ provider: a.provider as Connection["provider"], email: null, needsReauth: a.needsReauth, scope: a.scope, connectedAt: a.createdAt.toISOString() }));
  return Response.json(out);
}

/** DELETE /api/connections?provider=google — unlink a provider (not the last one; delete the account for that). */
export async function DELETE(req: NextRequest) {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const provider = req.nextUrl.searchParams.get("provider");
  if (!PROVIDERS.includes(provider as never)) return badRequest("Unknown provider");
  const accounts = await prisma.account.findMany({ where: { userId } });
  const target = accounts.find((a) => a.provider === provider);
  if (!target) return notFound();
  if (accounts.length <= 1) return Response.json({ error: "This is your only way to sign in. To remove it, delete your account instead." }, { status: 409 });
  await revokeTokens(target);
  await prisma.account.delete({ where: { id: target.id } });
  return new Response(null, { status: 204 });
}
