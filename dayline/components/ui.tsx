"use client";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

// ---------- design tokens ----------
export const T = {
  paper: "#FCFCFA",
  ink: "#1F2321",
  mute: "#7A7F7B",
  faint: "#B4B8B3",
  line: "#E7E7E2",
  wash: "#F3F3EF",
  blue: "#2C5480",
  blueWash: "#E7EEF6",
  sage: "#4E6E56",
  sageWash: "#E8EFE9",
  amber: "#9A6A1E",
  amberWash: "#F7EEDD",
  red: "#8C3A32",
  redWash: "#F6E7E4",
  font: '"Avenir Next", "Segoe UI", "Helvetica Neue", system-ui, sans-serif',
};

export const Btn = ({ children, onClick, primary, small, disabled, danger, type = "button", style }: { children: ReactNode; onClick?: () => void; primary?: boolean; small?: boolean; disabled?: boolean; danger?: boolean; type?: "button" | "submit"; style?: CSSProperties }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{
    fontFamily: T.font, fontSize: small ? 12.5 : 14, padding: small ? "5px 10px" : "8px 14px", borderRadius: 6,
    border: `1px solid ${primary ? T.ink : danger ? T.red : T.line}`, background: primary ? T.ink : "transparent", color: primary ? T.paper : danger ? T.red : T.ink,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, ...style,
  }}>{children}</button>
);

export const Input = ({ width, style, ...props }: InputHTMLAttributes<HTMLInputElement> & { width?: number | string }) => (
  <input {...props} style={{
    fontFamily: T.font, fontSize: 14, padding: "7px 9px", borderRadius: 6, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, outline: "none", width: width || "auto", ...style,
  }} />
);

export const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{ fontFamily: T.font, fontSize: 14, padding: "7px 9px", borderRadius: 6, border: `1px solid ${T.line}`, background: "#fff", color: T.ink }}>
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

export const H1 = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <div style={{ marginBottom: 28 }}>
    <h1 style={{ fontSize: 30, fontWeight: 400, letterSpacing: -0.4, margin: 0, lineHeight: 1.2 }}>{children}</h1>
    {sub && <div style={{ color: T.mute, fontSize: 14, marginTop: 4 }}>{sub}</div>}
  </div>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, color: T.mute }}>{label}{children}</label>
);

export const Notice = ({ children, onClose, tone = "info" }: { children: ReactNode; onClose?: () => void; tone?: "info" | "error" }) => (
  <div role={tone === "error" ? "alert" : "status"} style={{ background: tone === "error" ? T.redWash : T.wash, color: tone === "error" ? T.red : T.ink, padding: "10px 14px", borderRadius: 8, fontSize: 13.5, marginBottom: 18, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
    <div style={{ lineHeight: 1.45 }}>{children}</div>
    {onClose && <button onClick={onClose} aria-label="Dismiss" style={{ border: "none", background: "none", cursor: "pointer", color: T.mute, fontSize: 16, lineHeight: 1 }}>×</button>}
  </div>
);

export const Skeleton = ({ lines = 3 }: { lines?: number }) => (
  <div aria-hidden style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
    {Array.from({ length: lines }, (_, i) => <div key={i} style={{ height: 14, borderRadius: 4, background: T.wash, width: `${70 - i * 12}%` }} />)}
  </div>
);

export const kindStyle: Record<string, { bg: string; fg: string; label: string }> = {
  class: { bg: T.blueWash, fg: T.blue, label: "Class" },
  event: { bg: T.amberWash, fg: T.amber, label: "Event" },
  break: { bg: T.wash, fg: T.mute, label: "Break" },
  deep: { bg: T.sageWash, fg: T.sage, label: "Focus" },
  task: { bg: "#fff", fg: T.ink, label: "Task" },
};

export const sourceLabel: Record<string, string> = { google: "Google Calendar", microsoft: "Outlook", local: "Event" };
export const providerName: Record<string, string> = { google: "Google", "microsoft-entra-id": "Microsoft" };
