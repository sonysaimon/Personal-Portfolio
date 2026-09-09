import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { maybeEncrypt } from "@/lib/crypto";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
].join(" ");

export const MICROSOFT_SCOPES = "openid email profile offline_access User.Read Calendars.ReadWrite";

// Wrap the Prisma adapter so OAuth tokens are encrypted before they reach the database.
function encryptingAdapter(base: Adapter): Adapter {
  return {
    ...base,
    async linkAccount(account: AdapterAccount): Promise<void> {
      const stored: AdapterAccount = {
        ...account,
        access_token: maybeEncrypt(account.access_token) ?? undefined,
        refresh_token: maybeEncrypt(account.refresh_token) ?? undefined,
        id_token: undefined, // not needed after sign-in; don't keep it around
      };
      await base.linkAccount!(stored);
    },
  };
}

export const config: NextAuthConfig = {
  adapter: encryptingAdapter(PrismaAdapter(prisma)),
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: { signIn: "/", error: "/auth/error" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: GOOGLE_SCOPES, access_type: "offline", prompt: "consent" } },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER || "https://login.microsoftonline.com/common/v2.0",
      authorization: { params: { scope: MICROSOFT_SCOPES } },
      // The default profile() downloads the photo as a base64 data URI; we don't want that in the DB.
      profile(p) {
        return { id: p.sub, name: p.name ?? null, email: p.email ?? p.preferred_username ?? null, image: null };
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      // On a repeat sign-in (or a "Reconnect" from Settings) the adapter doesn't touch the
      // existing Account row, so refresh the stored tokens here and clear any re-auth flag.
      if (account?.provider && account.providerAccountId) {
        await prisma.account.updateMany({
          where: { provider: account.provider, providerAccountId: account.providerAccountId },
          data: {
            access_token: maybeEncrypt(account.access_token) ?? undefined,
            refresh_token: maybeEncrypt(account.refresh_token) ?? undefined,
            expires_at: account.expires_at ?? undefined,
            scope: account.scope ?? undefined,
            token_type: account.token_type ?? undefined,
            needsReauth: false,
          },
        });
      }
      return true;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
