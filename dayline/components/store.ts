"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { browserTz } from "@/lib/client-events";
import type { ClassBlock, Connection, EventsResponse, LocalEvent, Prefs, Task } from "@/lib/types";
import { DEFAULT_PREFS } from "@/lib/types";

export interface EventsState { data?: EventsResponse; loading: boolean; error?: string }

export function useStore() {
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [classes, setClasses] = useState<ClassBlock[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, EventsState>>({});
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const gen = useRef(0);

  const fail = (e: unknown) => { setNotice(e instanceof Error ? e.message : "Something went wrong."); };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, c, t, k] = await Promise.all([api<Prefs>("/api/preferences"), api<ClassBlock[]>("/api/classes"), api<Task[]>("/api/tasks"), api<Connection[]>("/api/connections")]);
        if (!alive) return;
        setPrefsState(p); setClasses(c); setTasks(t); setConnections(k);
      } catch (e) {
        if (alive) setLoadError(e instanceof Error ? e.message : "Couldn't load your data.");
      } finally { if (alive) setLoaded(true); }
    })();
    return () => { alive = false; };
  }, []);

  // ---- events (per range, cached until invalidated) ----
  const loadEvents = useCallback(async (from: string, to: string) => {
    const k = `${from}_${to}`;
    const myGen = gen.current;
    setEvents((s) => ({ ...s, [k]: { ...s[k], loading: true, error: undefined } }));
    try {
      const data = await api<EventsResponse>(`/api/events?from=${from}&to=${to}&tz=${encodeURIComponent(browserTz())}`);
      if (gen.current !== myGen) return;
      setEvents((s) => ({ ...s, [k]: { data, loading: false } }));
    } catch (e) {
      setEvents((s) => ({ ...s, [k]: { ...s[k], loading: false, error: e instanceof Error ? e.message : "Couldn't load events." } }));
    }
  }, []);

  const useEvents = (from: string, to: string): EventsState => {
    const k = `${from}_${to}`;
    const st = events[k];
    useEffect(() => { if (!eventsRef.current[k]) void loadEvents(from, to); }, [k, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
    return st ?? { loading: true };
  };
  const invalidateEvents = useCallback(() => { gen.current++; setEvents({}); }, []);

  // ---- preferences (debounced save) ----
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<Prefs>>({});
  const setPrefs = (patch: Partial<Prefs>) => {
    setPrefsState((p) => ({ ...p, ...patch }));
    pending.current = { ...pending.current, ...patch };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const body = pending.current; pending.current = {};
      try { setPrefsState(await api<Prefs>("/api/preferences", { method: "PUT", json: body })); } catch (e) { fail(e); }
    }, 600);
  };

  // ---- tasks ----
  const addTask = async (t: Omit<Task, "id" | "done" | "createdAt">) => {
    try { const created = await api<Task>("/api/tasks", { method: "POST", json: t }); setTasks((s) => [created, ...s]); } catch (e) { fail(e); }
  };
  const updateTask = async (id: string, patch: Partial<Task>) => {
    const prev = tasks;
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try { const saved = await api<Task>(`/api/tasks/${id}`, { method: "PATCH", json: patch }); setTasks((s) => s.map((t) => (t.id === id ? saved : t))); } catch (e) { setTasks(prev); fail(e); }
  };
  const removeTask = async (id: string) => {
    const prev = tasks;
    setTasks((s) => s.filter((t) => t.id !== id));
    try { await api(`/api/tasks/${id}`, { method: "DELETE" }); } catch (e) { setTasks(prev); fail(e); }
  };

  // ---- classes ----
  const addClass = async (c: Omit<ClassBlock, "id">) => {
    try { const created = await api<ClassBlock>("/api/classes", { method: "POST", json: c }); setClasses((s) => [...s, created]); } catch (e) { fail(e); }
  };
  const removeClass = async (id: string) => {
    const prev = classes;
    setClasses((s) => s.filter((c) => c.id !== id));
    try { await api(`/api/classes/${id}`, { method: "DELETE" }); } catch (e) { setClasses(prev); fail(e); }
  };

  // ---- local events ----
  const addLocalEvent = async (e: Omit<LocalEvent, "id">) => {
    try { await api<LocalEvent>("/api/local-events", { method: "POST", json: e }); invalidateEvents(); } catch (err) { fail(err); }
  };
  const removeLocalEvent = async (id: string) => {
    try { await api(`/api/local-events/${id}`, { method: "DELETE" }); invalidateEvents(); } catch (err) { fail(err); }
  };

  // ---- connections ----
  const disconnect = async (provider: string) => {
    try { await api(`/api/connections?provider=${provider}`, { method: "DELETE" }); setConnections((s) => s.filter((c) => c.provider !== provider)); invalidateEvents(); } catch (e) { fail(e); }
  };

  return {
    loaded, loadError, notice, setNotice,
    prefs, setPrefs, classes, addClass, removeClass, tasks, addTask, updateTask, removeTask,
    addLocalEvent, removeLocalEvent, useEvents, loadEvents, invalidateEvents,
    connections, disconnect,
  };
}

export type Store = ReturnType<typeof useStore>;
