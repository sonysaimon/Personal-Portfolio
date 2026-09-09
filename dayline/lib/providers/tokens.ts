import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/crypto";
import { MICROSOFT_SCOPES } from "@/auth";

export class ReauthRequired extends Error {
  constructor(public provider: string) { super(`${provider} connection needs to be re-authorised`); }
}

interface AccountRow { id: string; provider: string; access_token: string | null; refresh_token: string | null; expires_at: number | null; needsReauth: boolean }

async function refresh(provider: string, refreshToken: string): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
  let url: string; let body: URLSearchParams;
  if (provider === "google") {
    url = "https://oauth2.googleapis.com/token";
    body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET! });
  } else if (provider === "microsoft-entra-id") {
    const issuer = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER || "https://login.microsoftonline.com/common/v2.0";
    url = issuer.replace(/\/v2\.0\/?$/, "") + "/oauth2/v2.0/token";
    body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!, client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!, scope: MICROSOFT_SCOPES });
  } else throw new Error(`Unknown provider ${provider}`);

  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    const err = new Error(`Token refresh failed for ${provider}: ${json.error ?? res.status}`);
    (err as { permanent?: boolean }).permanent = res.status === 400 || res.status === 401 || json.error === "invalid_grant";
    throw err;
  }
  return json;
}

/** Returns a valid access token for the account, refreshing (and persisting) it when expired. */
export async function getAccessToken(account: AccountRow): Promise<string> {
  if (account.needsReauth) throw new ReauthRequired(account.provider);
  const now = Math.floor(Date.now() / 1000);
  if (account.access_token && account.expires_at && account.expires_at - 60 > now) return decrypt(account.access_token);
  if (!account.refresh_token) {
    await prisma.account.update({ where: { id: account.id }, data: { needsReauth: true } });
    throw new ReauthRequired(account.provider);
  }
  try {
    const t = await refresh(account.provider, decrypt(account.refresh_token));
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: encrypt(t.access_token),
        expires_at: now + (Number(t.expires_in) || 3600),
        ...(t.refresh_token ? { refresh_token: encrypt(t.refresh_token) } : {}),
      },
    });
    return t.access_token;
  } catch (e) {
    if ((e as { permanent?: boolean }).permanent) {
      await prisma.account.update({ where: { id: account.id }, data: { needsReauth: true } });
      throw new ReauthRequired(account.provider);
    }
    throw e;
  }
}

/** Best-effort revocation before deleting an account. Microsoft has no per-token revoke endpoint. */
export async function revokeTokens(account: AccountRow): Promise<void> {
  if (account.provider !== "google") return;
  const token = account.refresh_token ?? account.access_token;
  if (!token) return;
  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: decrypt(token) }), cache: "no-store",
    });
  } catch { /* ignore */ }
}
