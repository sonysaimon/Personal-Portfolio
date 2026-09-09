"use client";
import { useState } from "react";
import { DAYS, key, parseKey } from "@/lib/time";
import type { Priority, Task } from "@/lib/types";
import { Btn, Field, H1, Input, Select, T } from "./ui";
import type { Store } from "./store";

export function TasksPage({ store }: { store: Store }) {
  const { tasks, addTask, updateTask, removeTask } = store;
  const blank = { title: "", estMin: 30, deep: false, priority: "medium" as Priority, due: "" };
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);
  const add = async () => {
    if (!form.title.trim() || adding) return;
    setAdding(true);
    await addTask({ title: form.title, estMin: Number(form.estMin) || 30, deep: form.deep, priority: form.priority, due: form.due || null });
    setAdding(false);
    setForm(blank);
  };
  const open = tasks.filter((t) => !t.done), done = tasks.filter((t) => t.done);
  const todayKey = key(new Date());
  const dueLabel = (due: string) => { if (due < todayKey) return "overdue"; if (due === todayKey) return "today"; const d = parseKey(due); return `${DAYS[d.getDay()]} ${d.getDate()}`; };

  const Row = ({ t }: { t: Task }) => (
    <div style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.line}` }}>
      <input type="checkbox" checked={t.done} onChange={() => updateTask(t.id, { done: !t.done })} style={{ accentColor: T.sage }} aria-label={`Mark ${t.title} done`} />
      <div>
        <div style={{ fontSize: 15, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.mute : T.ink }}>{t.title}</div>
        <div style={{ fontSize: 12.5, color: T.mute, marginTop: 2 }}>
          {t.estMin} min · {t.deep ? "focus" : "quick"} · {t.priority}{t.due && ` · due ${dueLabel(t.due)}`}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn small onClick={() => updateTask(t.id, { deep: !t.deep })}>{t.deep ? "Make quick" : "Make focus"}</Btn>
        <Btn small onClick={() => removeTask(t.id)}>Delete</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <H1 sub="Focus tasks get your best hours. Quick tasks fill the gaps.">Tasks</H1>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", paddingBottom: 20, marginBottom: 6, borderBottom: `1px solid ${T.line}` }}>
        <Field label="New task"><Input value={form.title} placeholder="What needs doing?" onChange={(e) => setForm({ ...form, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} width={260} /></Field>
        <Field label="Minutes"><Input type="number" min={5} step={5} value={form.estMin} onChange={(e) => setForm({ ...form, estMin: Number(e.target.value) })} width={80} /></Field>
        <Field label="Type"><Select value={form.deep ? "deep" : "quick"} onChange={(v) => setForm({ ...form, deep: v === "deep" })} options={[["deep", "Focus"], ["quick", "Quick"]]} /></Field>
        <Field label="Priority"><Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v as Priority })} options={[["high", "High"], ["medium", "Medium"], ["low", "Low"]]} /></Field>
        <Field label="Due"><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
        <Btn primary onClick={add} disabled={adding}>{adding ? "Adding…" : "Add task"}</Btn>
      </div>
      {open.length === 0 && <div style={{ color: T.mute, padding: "28px 0" }}>Nothing open. Add a task above and it shows up in tomorrow’s plan.</div>}
      {open.map((t) => <Row key={t.id} t={t} />)}
      {done.length > 0 && <>
        <div style={{ color: T.mute, fontSize: 13, margin: "28px 0 4px" }}>Done</div>
        {done.map((t) => <Row key={t.id} t={t} />)}
      </>}
    </div>
  );
}
