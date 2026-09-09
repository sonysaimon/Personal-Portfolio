export type Focus = "early" | "late" | "afternoon" | "evening";
export type Priority = "high" | "medium" | "low";
export type Provider = "google" | "microsoft-entra-id";

export interface Prefs { dayStart: string; dayEnd: string; focus: Focus; lunch: string; blockMin: number; breakMin: number }
export interface ClassBlock { id: string; name: string; days: number[]; start: string; end: string; location: string }
export interface Task { id: string; title: string; estMin: number; deep: boolean; priority: Priority; due: string | null; done: boolean; createdAt: string }
export interface LocalEvent { id: string; title: string; date: string; start: string; end: string }

/** Normalised calendar event. Timed events: start/end are ISO 8601 UTC. All-day: start/end are YYYY-MM-DD (end exclusive). */
export interface CalEvent {
  id: string;
  source: "google" | "microsoft" | "local";
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  busy: boolean;
  location?: string;
}

export interface ProviderStatus {
  provider: Provider;
  ok: boolean;
  needsReauth: boolean;
  error?: string;
}

export interface EventsResponse { events: CalEvent[]; providers: ProviderStatus[] }

export interface Connection { provider: Provider; email: string | null; needsReauth: boolean; scope: string | null; connectedAt: string }

export const DEFAULT_PREFS: Prefs = { dayStart: "07:00", dayEnd: "21:00", focus: "early", lunch: "12:30", blockMin: 90, breakMin: 15 };
