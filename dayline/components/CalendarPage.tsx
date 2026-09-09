"use client";
import { useMemo, useState } from "react";
import { DAYS, MONTHS, addDays, fmt, key, toMin, weekStartOf } from "@/lib/time";
import { eventsOnDay } from "@/lib/client-events";
import { Btn, Field, H1, Input, kindStyle, Notice, sourceLabel, T, providerName } from "./ui";
import type { Store } from "./store";

export function CalendarPage({ store, goSettings }: { store: Store; goSettings: () => void }) {
  const { prefs, classes } = store;
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => weekStartOf(today));
  const [form, setForm] = useState<{ title: string; date: string; start: string; end: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const ev = store.useEvents(key(days[0]), key(days[6]));
  const h0 = Math.floor(toMin(prefs.dayStart) / 60), h1 = Math.ceil(toMin(prefs.dayEnd) / 60);
  const hours = Array.from({ length: Math.max(1, h1 - h0) }, (_, i) => h0 + i);
  const PX = 44;

  const byDay = useMemo(() => Object.fromEntries(days.map((d) => [key(d), eventsOnDay(ev.data?.events ?? [], key(d))])), [ev.data, weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  const blocksFor = (d: Date) => {
    const k = key(d);
    return [
      ...classes.filter((c) => c.days.includes(d.getDay())).map((c) => ({ id: c.id, kind: "class", title: c.name, start: toMin(c.start), end: toMin(c.end), removable: false, sub: "" })),
      ...(byDay[k] ?? []).filter((b) => !b.allDay).map((b) => ({ id: b.id, kind: "event", title: b.title, start: b.startMin, end: b.endMin, removable: b.source === "local", sub: sourceLabel[b.source] })),
    ];
  };
  const allDayFor = (d: Date) => (byDay[key(d)] ?? []).filter((b) => b.allDay);

  const save = async () => {
    if (!form || !form.title.trim()) return;
    setSaving(true);
    await store.addLocalEvent(form);
    setSaving(false);
    setForm(null);
  };
  const problems = (ev.data?.providers ?? []).filter((p) => !p.ok);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <H1 sub={<>Classes repeat weekly. Synced events are read-only here; events you add are yours to edit.{ev.loading ? " Syncing…" : ""}</>}>{MONTHS[weekStart.getMonth()]} {weekStart.getDate()} – {MONTHS[days[6].getMonth()]} {days[6].getDate()}</H1>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</Btn>
          <Btn small onClick={() => setWeekStart(weekStartOf(today))}>This week</Btn>
          <Btn small onClick={() => setWeekStart(addDays(weekStart, 7))}>›</Btn>
          <Btn small primary onClick={() => setForm({ title: "", date: key(today), start: "13:00", end: "14:00" })}>Add event</Btn>
        </div>
      </div>

      {ev.error && <Notice tone="error">Couldn’t load calendar events: {ev.error}. <button onClick={() => store.loadEvents(key(days[0]), key(days[6]))} style={{ border: "none", background: "none", color: T.red, textDecoration: "underline", cursor: "pointer", fontFamily: T.font, fontSize: 13.5, padding: 0 }}>Try again</button></Notice>}
      {problems.map((p) => (
        <Notice key={p.provider} tone="error">{providerName[p.provider]}: {p.error} {p.needsReauth && <button onClick={goSettings} style={{ border: "none", background: "none", color: T.red, textDecoration: "underline", cursor: "pointer", fontFamily: T.font, fontSize: 13.5, padding: 0 }}>Reconnect in Settings</button>}</Notice>
      ))}

      {form && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: "14px 0 18px", borderBottom: `1px solid ${T.line}`, marginBottom: 18 }}>
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} width={220} autoFocus onKeyDown={(e) => e.key === "Enter" && save()} /></Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Starts"><Input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
          <Field label="Ends"><Input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
          <Btn primary onClick={save} disabled={saving}>{saving ? "Saving…" : "Save event"}</Btn>
          <Btn onClick={() => setForm(null)}>Cancel</Btn>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `56px repeat(7, minmax(110px, 1fr))`, minWidth: 820 }}>
          <div />
          {days.map((d) => (
            <div key={key(d)} style={{ padding: "0 8px 10px", fontSize: 13, color: key(d) === key(today) ? T.ink : T.mute, borderBottom: `1px solid ${T.line}` }}>
              {DAYS[d.getDay()]} <span style={{ fontSize: 18, marginLeft: 4, fontWeight: key(d) === key(today) ? 600 : 400 }}>{d.getDate()}</span>
              {allDayFor(d).map((b) => <div key={b.id} title={b.title} style={{ marginTop: 4, background: T.amberWash, color: T.amber, borderRadius: 4, padding: "2px 6px", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>)}
            </div>
          ))}
          <div style={{ position: "relative", height: hours.length * PX }}>
            {hours.map((h) => <div key={h} style={{ position: "absolute", top: (h - h0) * PX - 7, right: 10, fontSize: 11.5, color: T.faint }}>{fmt(h * 60)}</div>)}
          </div>
          {days.map((d) => (
            <div key={key(d)} style={{ position: "relative", height: hours.length * PX, borderLeft: `1px solid ${T.line}` }}>
              {hours.map((h) => <div key={h} style={{ position: "absolute", top: (h - h0) * PX, left: 0, right: 0, borderTop: `1px solid ${T.line}` }} />)}
              {blocksFor(d).map((b) => {
                const ks = kindStyle[b.kind];
                return (
                  <div key={b.id + key(d)} title={`${b.title} ${fmt(b.start)}–${fmt(b.end)}${b.sub ? ` · ${b.sub}` : ""}`} style={{
                    position: "absolute", top: (b.start - h0 * 60) / 60 * PX + 1, height: Math.max(20, (b.end - b.start) / 60 * PX - 3), left: 4, right: 4,
                    background: ks.bg, color: ks.fg, borderRadius: 6, padding: "4px 7px", fontSize: 12.5, overflow: "hidden", borderLeft: `3px solid ${ks.fg}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</span>
                      {b.removable && <button onClick={() => store.removeLocalEvent(b.id)} aria-label="Remove event" style={{ border: "none", background: "none", color: ks.fg, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>}
                    </div>
                    <div style={{ opacity: 0.75, fontSize: 11.5 }}>{fmt(b.start)}{b.sub && b.kind === "event" && b.sub !== "Event" ? ` · ${b.sub}` : ""}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
