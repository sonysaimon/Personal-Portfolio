"use client";
import { useMemo } from "react";
import { buildPlan, type DayEvent } from "@/lib/planner";
import { addDays, fmt, key, longDate, parseKey, toMin } from "@/lib/time";
import { eventsOnDay } from "@/lib/client-events";
import { Btn, H1, kindStyle, Notice, Skeleton, sourceLabel, T, providerName } from "./ui";
import type { Store } from "./store";

export function TodayPage({ store, dateKey, setDateKey, goSettings }: { store: Store; dateKey: string; setDateKey: (k: string) => void; goSettings: () => void }) {
  const { prefs, classes, tasks, updateTask } = store;
  const ev = store.useEvents(dateKey, dateKey);
  const today = key(new Date());
  const d = parseKey(dateKey);
  const isToday = dateKey === today;

  const dayBlocks = useMemo(() => eventsOnDay(ev.data?.events ?? [], dateKey), [ev.data, dateKey]);
  const allDay = dayBlocks.filter((b) => b.allDay);
  const plan = useMemo(() => {
    const events: DayEvent[] = dayBlocks.filter((b) => !b.allDay && b.busy).map((b) => ({ title: b.title, startMin: b.startMin, endMin: b.endMin, sub: b.location || (b.source === "local" ? undefined : sourceLabel[b.source]) }));
    return buildPlan(dateKey, { prefs, classes, events, tasks });
  }, [dateKey, prefs, classes, tasks, dayBlocks]);

  const dueToday = tasks.filter((t) => !t.done && t.due && t.due <= dateKey).length;
  const hoursFree = Math.round(plan.free.reduce((s, f) => s + (f.end - f.start), 0) / 6) / 10;
  const problems = (ev.data?.providers ?? []).filter((p) => !p.ok);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <H1 sub={`${hoursFree} hours open${dueToday ? ` · ${dueToday} due` : ""}${ev.loading ? " · syncing calendars…" : ""}`}>
          {isToday ? "Good morning." : longDate(d)}{isToday && <span style={{ color: T.mute }}> {longDate(d)}</span>}
        </H1>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small onClick={() => setDateKey(key(addDays(d, -1)))}>‹</Btn>
          <Btn small onClick={() => setDateKey(today)}>Today</Btn>
          <Btn small onClick={() => setDateKey(key(addDays(d, 1)))}>›</Btn>
        </div>
      </div>

      {ev.error && <Notice tone="error" onClose={() => store.loadEvents(dateKey, dateKey)}>Couldn’t load calendar events: {ev.error}. <button onClick={() => store.loadEvents(dateKey, dateKey)} style={{ border: "none", background: "none", color: T.red, textDecoration: "underline", cursor: "pointer", fontFamily: T.font, fontSize: 13.5, padding: 0 }}>Try again</button></Notice>}
      {problems.map((p) => (
        <Notice key={p.provider} tone="error">
          {providerName[p.provider]}: {p.error}{" "}
          {p.needsReauth && <button onClick={goSettings} style={{ border: "none", background: "none", color: T.red, textDecoration: "underline", cursor: "pointer", fontFamily: T.font, fontSize: 13.5, padding: 0 }}>Reconnect in Settings</button>}
        </Notice>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 260px", gap: 48 }} className="today-grid">
        <div>
          {allDay.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 16, marginBottom: 6 }}>
              <div style={{ textAlign: "right", fontSize: 13, color: T.mute, paddingTop: 8 }}>all day</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 18 }}>
                {allDay.map((b) => <span key={b.id} style={{ background: T.amberWash, color: T.amber, borderRadius: 6, padding: "5px 10px", fontSize: 13 }}>{b.title}</span>)}
              </div>
            </div>
          )}
          {ev.loading && !ev.data && <Skeleton lines={4} />}
          {!ev.loading && plan.items.length === 0 && <div style={{ color: T.mute, padding: "40px 0" }}>Nothing on the calendar and no open tasks. Add a task or a class and the plan fills itself in.</div>}
          {plan.items.map((it, i) => {
            const ks = kindStyle[it.kind];
            const task = it.taskId ? tasks.find((t) => t.id === it.taskId) : undefined;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 16, alignItems: "stretch" }}>
                <div style={{ textAlign: "right", fontSize: 13, color: T.mute, paddingTop: 12, fontVariantNumeric: "tabular-nums" }}>{fmt(it.start)}</div>
                <div style={{ borderLeft: `1px solid ${T.line}`, padding: "6px 0 6px 18px", position: "relative" }}>
                  <div style={{ position: "absolute", left: -4, top: 17, width: 7, height: 7, borderRadius: 4, background: ks.fg }} />
                  <div style={{
                    background: ks.bg, borderRadius: 8, padding: "10px 14px", minHeight: Math.max(44, (it.end - it.start) * 0.9),
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, border: it.kind === "task" ? `1px solid ${T.line}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 15, color: it.kind === "break" ? T.mute : T.ink, textDecoration: task?.done ? "line-through" : "none" }}>{it.title}{it.partial && <span style={{ color: T.mute }}> · first block</span>}</div>
                      <div style={{ fontSize: 12.5, color: ks.fg, marginTop: 2 }}>{ks.label}{it.sub ? ` · ${it.sub}` : ""} · {fmt(it.start)}–{fmt(it.end)}</div>
                    </div>
                    {task && <input type="checkbox" checked={task.done} onChange={() => updateTask(task.id, { done: !task.done })} aria-label={`Mark ${task.title} done`} style={{ marginTop: 4, accentColor: T.sage }} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 16 }}>
            <div style={{ textAlign: "right", fontSize: 13, color: T.faint, paddingTop: 12 }}>{fmt(toMin(prefs.dayEnd))}</div>
            <div style={{ borderLeft: `1px solid ${T.line}`, height: 24 }} />
          </div>
        </div>

        <div style={{ fontSize: 14 }}>
          <div style={{ color: T.mute, marginBottom: 10 }}>How this plan was made</div>
          <div style={{ lineHeight: 1.55, color: T.ink }}>
            Focus work goes in the {{ early: "early morning", late: "late morning", afternoon: "afternoon", evening: "evening" }[prefs.focus]}, around your classes and calendar events. Quick tasks fill the leftover gaps. Blocks are capped at {prefs.blockMin} minutes with {prefs.breakMin}-minute breaks.
          </div>
          {plan.unplaced.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ color: T.mute, marginBottom: 8 }}>Didn’t fit today</div>
              {plan.unplaced.map((t) => <div key={t.id} style={{ padding: "6px 0", borderTop: `1px solid ${T.line}` }}>{t.title} <span style={{ color: T.faint }}>{t.estMin} min</span></div>)}
            </div>
          )}
          <div style={{ marginTop: 24, color: T.mute, fontSize: 13, lineHeight: 1.5 }}>Change class times or work hours in Settings and the plan updates.</div>
        </div>
      </div>
    </div>
  );
}
