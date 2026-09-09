import { prisma } from "@/lib/prisma";
import type { CalEvent, EventsResponse, Provider, ProviderStatus } from "@/lib/types";
import { getAccessToken, ReauthRequired } from "@/lib/providers/tokens";
import { googleEvents } from "@/lib/providers/google";
import { microsoftEvents } from "@/lib/providers/microsoft";
import { zonedToUtc } from "@/lib/tz";
import { addDays, key, parseKey } from "@/lib/time";

const dateOnly = (d: Date) => d.toISOString().slice(0, 10);

/**
 * All events for a user between two date keys (inclusive), in the user's timezone:
 * Google + Microsoft (each linked account) + local events. Provider failures are
 * reported per provider rather than failing the whole request.
 */
export async function mergedEvents(userId: string, fromKey: string, toKey: string, tz: string): Promise<EventsResponse> {
  const from = zonedToUtc(fromKey, "00:00", tz);
  const to = zonedToUtc(key(addDays(parseKey(toKey), 1)), "00:00", tz);

  const [accounts, locals] = await Promise.all([
    prisma.account.findMany({ where: { userId, provider: { in: ["google", "microsoft-entra-id"] } } }),
    prisma.localEvent.findMany({ where: { userId, date: { gte: new Date(fromKey), lte: new Date(toKey) } }, orderBy: [{ date: "asc" }, { start: "asc" }] }),
  ]);

  const events: CalEvent[] = locals.map((e) => {
    const dk = dateOnly(e.date);
    return { id: e.id, source: "local", title: e.title, start: zonedToUtc(dk, e.start, tz).toISOString(), end: zonedToUtc(dk, e.end, tz).toISOString(), allDay: false, busy: true };
  });

  const providers: ProviderStatus[] = await Promise.all(accounts.map(async (a): Promise<ProviderStatus> => {
    const provider = a.provider as Provider;
    try {
      const token = await getAccessToken(a);
      const list = provider === "google" ? await googleEvents(token, from, to) : await microsoftEvents(token, from, to);
      events.push(...list);
      return { provider, ok: true, needsReauth: false };
    } catch (e) {
      if (e instanceof ReauthRequired) return { provider, ok: false, needsReauth: true, error: "Connection expired. Reconnect to keep syncing." };
      console.error(`[events] ${provider}:`, e);
      return { provider, ok: false, needsReauth: false, error: "Couldn't load events from this calendar right now." };
    }
  }));

  events.sort((a, b) => a.start.localeCompare(b.start));
  return { events, providers };
}
