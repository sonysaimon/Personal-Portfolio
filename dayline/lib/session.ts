import { auth } from "@/auth";

/** Returns the signed-in user's id, or null. Every /api route must gate on this. */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export const unauthorized = () => Response.json({ error: "Not signed in" }, { status: 401 });
export const badRequest = (msg: string) => Response.json({ error: msg }, { status: 400 });
export const notFound = () => Response.json({ error: "Not found" }, { status: 404 });
