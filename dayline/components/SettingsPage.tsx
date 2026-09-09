"use client";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { DAYS, fmt, toMin } from "@/lib/time";
import type { Focus, Provider } from "@/lib/types";
import { api } from "@/lib/api";
import { Btn, Field, H1, Input, Select, T, providerName } from "./ui";
import type { Store } from "./store";

const PROVIDERS: Provider[] = ["google", "microsoft-entra-id"];

export function SettingsPage({ store }: { store: Store }) {
  const p = store.prefs;
  const setP = store.setPrefs;
  const blank = { name: "", days: [1, 3, 5], start: "10:00", end: "11:00", location: "" };
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const addClass = async () => { if (!form.name.trim()) return; setBusy("class"); await store.addClass(form); setBusy(null); setForm(blank); };
  const toggleDay = (i: number) => setForm({ ...form, days: form.days.includes(i) ? form.days.filter((d) => d !== i) : [...form.days, i].sort() });

  const connect = (provider: Provider) => { setBusy(provider); void signIn(provider, { redirectTo: "/?tab=settings" }); };
  const disconnect = async (provider: Provider) => { setBusy(provider); await store.disconnect(provider); setBusy(null); };
  const deleteAccount = async () => {
    setBusy("delete");
    try { await api("/api/account", { method: "DELETE" }); await signOut({ redirectTo: "/" }); }
    catch (e) { store.setNotice(e instanceof Error ? e.message : "Couldn't delete your account."); setBusy(null); }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <H1 sub="The planner builds each day around these.">Settings</H1>

      <div style={{ fontSize: 15, marginBottom: 12 }}>How you work</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingBottom: 28, borderBottom: `1px solid ${T.line}`, marginBottom: 28 }}>
        <Field label="Best focus time">
          <Select value={p.focus} onChange={(v) => setP({ focus: v as Focus })} options={[["early", "Early morning"], ["late", "Late morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]]} />
        </Field>
        <Field label="Day starts"><Input type="time" value={p.dayStart} onChange={(e) => e.target.value && setP({ dayStart: e.target.value })} /></Field>
        <Field label="Day ends"><Input type="time" value={p.dayEnd} onChange={(e) => e.target.value && setP({ dayEnd: e.target.value })} /></Field>
        <Field label="Lunch"><Input type="time" value={p.lunch} onChange={(e) => e.target.value && setP({ lunch: e.target.value })} /></Field>
        <Field label="Longest block (min)"><Input type="number" min={15} step={15} value={p.blockMin} onChange={(e) => setP({ blockMin: Math.min(480, Math.max(15, Number(e.target.value) || 60)) })} width={90} /></Field>
        <Field label="Break (min)"><Input type="number" min={0} step={5} value={p.breakMin} onChange={(e) => setP({ breakMin: Math.min(120, Math.max(0, Number(e.target.value) || 0)) })} width={80} /></Field>
      </div>

      <div style={{ fontSize: 15, marginBottom: 12 }}>Class schedule</div>
      {store.classes.map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.line}` }}>
          <div>
            <span style={{ fontSize: 15 }}>{c.name}</span>
            <span style={{ color: T.mute, fontSize: 13, marginLeft: 10 }}>{c.days.map((d) => DAYS[d]).join(" ")} · {fmt(toMin(c.start))}–{fmt(toMin(c.end))}{c.location && ` · ${c.location}`}</span>
          </div>
          <Btn small onClick={() => store.removeClass(c.id)}>Remove</Btn>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: "18px 0 28px", borderBottom: `1px solid ${T.line}`, marginBottom: 28 }}>
        <Field label="Course"><Input value={form.name} placeholder="e.g. STAT 200" onChange={(e) => setForm({ ...form, name: e.target.value })} width={130} /></Field>
        <Field label="Days">
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5, 6, 0].map((i) => (
              <button key={i} type="button" onClick={() => toggleDay(i)} aria-pressed={form.days.includes(i)} style={{ fontFamily: T.font, fontSize: 12.5, width: 34, height: 32, borderRadius: 6, border: `1px solid ${form.days.includes(i) ? T.blue : T.line}`, background: form.days.includes(i) ? T.blueWash : "#fff", color: form.days.includes(i) ? T.blue : T.mute, cursor: "pointer" }}>{DAYS[i].slice(0, 2)}</button>
            ))}
          </div>
        </Field>
        <Field label="Starts"><Input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
        <Field label="Ends"><Input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
        <Field label="Room"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} width={120} /></Field>
        <Btn primary onClick={addClass} disabled={busy === "class"}>Add class</Btn>
      </div>

      <div style={{ fontSize: 15, marginBottom: 6 }}>Connected calendars</div>
      <div style={{ fontSize: 13.5, color: T.mute, marginBottom: 12, lineHeight: 1.5 }}>Events from connected calendars appear in Today and Calendar. You can link both to one account. Calendar events are read-only in Dayline; tokens stay on the server.</div>
      {PROVIDERS.map((prov) => {
        const c = store.connections.find((x) => x.provider === prov);
        const only = store.connections.length <= 1;
        return (
          <div key={prov} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.line}` }}>
            <div>
              <div style={{ fontSize: 15 }}>{providerName[prov]} {prov === "google" ? "Calendar" : "Outlook"}</div>
              <div style={{ fontSize: 12.5, color: c?.needsReauth ? T.red : T.mute, marginTop: 2 }}>
                {!c ? "Not connected" : c.needsReauth ? "Connection expired — reconnect to keep syncing" : `Connected ${new Date(c.connectedAt).toLocaleDateString()}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!c && <Btn small primary onClick={() => connect(prov)} disabled={busy === prov}>Connect</Btn>}
              {c?.needsReauth && <Btn small primary onClick={() => connect(prov)} disabled={busy === prov}>Reconnect</Btn>}
              {c && <Btn small onClick={() => disconnect(prov)} disabled={busy === prov || only} style={only ? { opacity: 0.5 } : undefined}>Disconnect</Btn>}
            </div>
          </div>
        );
      })}
      {store.connections.length <= 1 && <div style={{ fontSize: 12.5, color: T.faint, marginTop: 8 }}>Your only sign-in method can’t be disconnected. Link the other provider first, or delete your account below.</div>}

      <div style={{ fontSize: 15, marginTop: 36, marginBottom: 8 }}>Delete my account and data</div>
      <div style={{ fontSize: 13.5, color: T.mute, marginBottom: 12, lineHeight: 1.5 }}>Removes your tasks, classes, events, preferences, and calendar connections, and revokes Dayline’s access to your Google account. This can’t be undone.</div>
      {!confirmDelete
        ? <Btn danger onClick={() => setConfirmDelete(true)}>Delete my account and data</Btn>
        : <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5 }}>Are you sure?</span>
            <Btn danger onClick={deleteAccount} disabled={busy === "delete"}>{busy === "delete" ? "Deleting…" : "Yes, delete everything"}</Btn>
            <Btn onClick={() => setConfirmDelete(false)}>Cancel</Btn>
          </div>}
      <div style={{ marginTop: 40, fontSize: 12.5, color: T.faint }}><a href="/privacy" style={{ color: T.mute }}>Privacy</a> · <a href="/terms" style={{ color: T.mute }}>Terms</a></div>
    </div>
  );
}
