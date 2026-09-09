import type { CalEvent } from "@/lib/types";

const API = "https://www.googleapis.com/calendar/v3";

async function gfetch(token: string, url: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Google Calendar ${res.status}: ${text.slice(0, 200)}`);
    (err as { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

interface GCal { id: string; summary?: string; selected?: boolean; primary?: boolean; accessRole?: string }
interface GEvent {
  id: string; summary?: string; status?: string; transparency?: string; location?: string;
  start: { date?: string; dateTime?: string }; end: { date?: string; dateTime?: string };
  attendees?: { self?: boolean; responseStatus?: string }[];
}

/** Events from every calendar the user has ticked in Google Calendar, between two UTC instants. */
export async function googleEvents(token: string, from: Date, to: Date): Promise<CalEvent[]> {
  let calendars: GCal[];
  try {
    const list = await gfetch(token, `${API}/users/me/calendarList?minAccessRole=reader&showHidden=false`);
    calendars = (list.items as GCal[]).filter((c) => c.selected !== false);
  } catch (e) {
    // Older consents without the calendarList scope: fall back to the primary calendar.
    if ((e as { status?: number }).status === 403) calendars = [{ id: "primary", primary: true }];
    else throw e;
  }
  if (calendars.length === 0) calendars = [{ id: "primary", primary: true }];

  const out: CalEvent[] = [];
  for (const cal of calendars) {
    let pageToken: string | undefined;
    for (let page = 0; page < 5; page++) {
      const q = new URLSearchParams({ timeMin: from.toISOString(), timeMax: to.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "250" });
      if (pageToken) q.set("pageToken", pageToken);
      const data = await gfetch(token, `${API}/calendars/${encodeURIComponent(cal.id)}/events?${q}`);
      for (const ev of (data.items ?? []) as GEvent[]) {
        if (ev.status === "cancelled") continue;
        const me = ev.attendees?.find((a) => a.self);
        if (me?.responseStatus === "declined") continue;
        const allDay = !!ev.start.date;
        out.push({
          id: `google:${cal.id}:${ev.id}`,
          source: "google",
          title: ev.summary || "(No title)",
          start: allDay ? ev.start.date! : new Date(ev.start.dateTime!).toISOString(),
          end: allDay ? ev.end.date! : new Date(ev.end.dateTime!).toISOString(),
          allDay,
          busy: ev.transparency !== "transparent",
          location: ev.location || undefined,
        });
      }
      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }
  }
  return out;
}
