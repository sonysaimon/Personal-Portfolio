import { prisma } from "@/lib/prisma";
import { currentUserId, unauthorized } from "@/lib/session";
import { revokeTokens } from "@/lib/providers/tokens";
import { signOut } from "@/auth";

/** DELETE /api/account — revoke provider tokens, then remove every row for the user (cascades). */
export async function DELETE() {
  const userId = await currentUserId(); if (!userId) return unauthorized();
  const accounts = await prisma.account.findMany({ where: { userId } });
  await Promise.all(accounts.map(revokeTokens));
  await prisma.user.delete({ where: { id: userId } }); // cascades: accounts, sessions, prefs, classes, tasks, events
  await signOut({ redirect: false });
  return new Response(null, { status: 204 });
}
