import type { CalEvent } from "@/lib/types";

const GRAPH = "https://graph.microsoft.com/v1.0";

interface MEvent {
  id: string; subject?: string; isAllDay?: boolean; isCancelled?: boolean; showAs?: string;
  start: { dateTime: string }; end: { dateTime: string };
  location?: { displayName?: string }; responseStatus?: { response?: string };
}

const toIso = (s: string) => new Date(s.endsWith("Z") ? s : s + "Z").toISOString();

/** Events from the user's Outlook calendar view (all calendars merged by Graph) between two UTC instants. */
export async function microsoftEvents(token: string, from: Date, to: Date): Promise<CalEvent[]> {
  const q = new URLSearchParams({
    startDateTime: from.toISOString(), endDateTime: to.toISOString(), $top: "250",
    $select: "id,subject,start,end,isAllDay,isCancelled,showAs,location,responseStatus",
  });
  let url: string | undefined = `${GRAPH}/me/calendarView?${q}`;
  const out: CalEvent[] = [];
  for (let page = 0; url && page < 5; page++) {
    const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="UTC"' }, cache: "no-store" });
    if (!res.ok) throw new Error(`Microsoft Graph ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    const data = await res.json();
    for (const ev of (data.value ?? []) as MEvent[]) {
      if (ev.isCancelled) continue;
      if (ev.responseStatus?.response === "declined") continue;
      const allDay = !!ev.isAllDay;
      out.push({
        id: `microsoft:${ev.id}`,
        source: "microsoft",
        title: ev.subject || "(No title)",
        start: allDay ? ev.start.dateTime.slice(0, 10) : toIso(ev.start.dateTime),
        end: allDay ? ev.end.dateTime.slice(0, 10) : toIso(ev.end.dateTime),
        allDay,
        busy: ev.showAs !== "free",
        location: ev.location?.displayName || undefined,
      });
    }
    url = data["@odata.nextLink"];
  }
  return out;
}
