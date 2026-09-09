"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { key } from "@/lib/time";
import { useStore } from "./store";
import { Notice, Skeleton, T } from "./ui";
import { TodayPage } from "./TodayPage";
import { CalendarPage } from "./CalendarPage";
import { TasksPage } from "./TasksPage";
import { SettingsPage } from "./SettingsPage";

type Tab = "today" | "calendar" | "tasks" | "settings";
const TABS: Tab[] = ["today", "calendar", "tasks", "settings"];

export function Planner({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const store = useStore();
  const [page, setPage] = useState<Tab>("today");
  const [dateKey, setDateKey] = useState(() => key(new Date()));

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.includes(t as Tab)) setPage(t as Tab);
  }, []);
  const go = (t: Tab) => { setPage(t); const u = new URL(window.location.href); u.searchParams.set("tab", t); window.history.replaceState(null, "", u); };

  const nav: [Tab | "inbox", string][] = [["today", "Today"], ["calendar", "Calendar"], ["tasks", "Tasks"], ["inbox", "Inbox"], ["settings", "Settings"]];
  const counts: Partial<Record<string, number>> = { tasks: store.tasks.filter((t) => !t.done).length };
  const reauth = store.connections.filter((c) => c.needsReauth).length;

  return (
    <div style={{ fontFamily: T.font, color: T.ink, background: T.paper, minHeight: "100vh", display: "flex" }}>
      <style>{`
        @media (max-width: 760px) { .today-grid { grid-template-columns: 1fr !important; } .rail { flex-direction: row !important; width: auto !important; border-right: none !important; border-bottom: 1px solid ${T.line}; padding: 12px 16px !important; overflow-x: auto; align-items: center; } .rail .who { display: none; } .shell { flex-direction: column !important; } .main { padding: 24px 18px !important; } }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid ${T.blue}; outline-offset: 2px; }
        @media (prefers-reduced-motion: no-preference) { button { transition: background .12s; } }
      `}</style>
      <div className="shell" style={{ display: "flex", width: "100%" }}>
        <nav className="rail" style={{ width: 176, padding: "36px 22px", borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <div style={{ fontSize: 15, marginBottom: 20, letterSpacing: 0.2 }}>Dayline</div>
          {nav.map(([id, label]) => {
            const soon = id === "inbox";
            return (
              <button key={id} onClick={() => !soon && go(id as Tab)} disabled={soon} title={soon ? "Gmail and Outlook mail are coming in a later release" : undefined} style={{
                fontFamily: T.font, fontSize: 14, textAlign: "left", padding: "7px 10px", borderRadius: 6, border: "none", cursor: soon ? "default" : "pointer",
                background: page === id ? T.wash : "transparent", color: page === id ? T.ink : soon ? T.faint : T.mute, display: "flex", justifyContent: "space-between", gap: 12, whiteSpace: "nowrap",
              }}>
                {label}
                {soon ? <span style={{ color: T.faint, fontSize: 11 }}>soon</span> : counts[id] ? <span style={{ color: T.faint, fontSize: 12.5 }}>{counts[id]}</span> : id === "settings" && reauth ? <span style={{ color: T.red, fontSize: 12.5 }}>!</span> : null}
              </button>
            );
          })}
          <div className="who" style={{ marginTop: "auto", paddingTop: 24, fontSize: 12.5, color: T.mute, lineHeight: 1.4 }}>
            <div style={{ color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user.email ?? undefined}>{user.name || user.email}</div>
            {user.name && <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user.email ?? undefined}>{user.email}</div>}
            <button onClick={() => signOut({ redirectTo: "/" })} style={{ marginTop: 6, fontFamily: T.font, fontSize: 12.5, color: T.mute, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>Sign out</button>
          </div>
        </nav>
        <main className="main" style={{ flex: 1, padding: "40px 48px", maxWidth: 1080, minWidth: 0 }}>
          {store.notice && <Notice tone="error" onClose={() => store.setNotice(null)}>{store.notice}</Notice>}
          {store.loadError && <Notice tone="error">Couldn’t load your data: {store.loadError}. <button onClick={() => window.location.reload()} style={{ border: "none", background: "none", color: T.red, textDecoration: "underline", cursor: "pointer", fontFamily: T.font, fontSize: 13.5, padding: 0 }}>Reload</button></Notice>}
          {!store.loaded ? <Skeleton lines={5} /> : <>
            {page === "today" && <TodayPage store={store} dateKey={dateKey} setDateKey={setDateKey} goSettings={() => go("settings")} />}
            {page === "calendar" && <CalendarPage store={store} goSettings={() => go("settings")} />}
            {page === "tasks" && <TasksPage store={store} />}
            {page === "settings" && <SettingsPage store={store} />}
          </>}
        </main>
      </div>
    </div>
  );
}
