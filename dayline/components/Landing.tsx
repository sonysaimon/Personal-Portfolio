import { signIn } from "@/auth";

const T = { paper: "#FCFCFA", ink: "#1F2321", mute: "#7A7F7B", line: "#E7E7E2", font: '"Avenir Next", "Segoe UI", "Helvetica Neue", system-ui, sans-serif' };

function Provider({ id, label }: { id: "google" | "microsoft-entra-id"; label: string }) {
  return (
    <form action={async () => { "use server"; await signIn(id, { redirectTo: "/" }); }}>
      <button type="submit" style={{ fontFamily: T.font, fontSize: 14.5, padding: "10px 18px", borderRadius: 6, border: `1px solid ${T.ink}`, background: T.ink, color: T.paper, cursor: "pointer", minWidth: 220 }}>{label}</button>
    </form>
  );
}

export function Landing({ error }: { error?: string }) {
  return (
    <div style={{ fontFamily: T.font, color: T.ink, background: T.paper, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 24px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: 15, letterSpacing: 0.2, marginBottom: 40 }}>Dayline</div>
        <h1 style={{ fontSize: 30, fontWeight: 400, letterSpacing: -0.4, lineHeight: 1.25, margin: "0 0 32px" }}>A daily plan built around your calendar, your classes, and the work you actually need to do.</h1>
        {error && <div role="alert" style={{ background: "#F6E7E4", color: "#8C3A32", padding: "10px 14px", borderRadius: 8, fontSize: 13.5, marginBottom: 20, lineHeight: 1.45 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Provider id="google" label="Continue with Google" />
          <Provider id="microsoft-entra-id" label="Continue with Microsoft" />
        </div>
        <p style={{ color: T.mute, fontSize: 13, lineHeight: 1.5, marginTop: 28, maxWidth: 440 }}>Dayline reads your calendar to plan around it. Nothing is written to your calendar. See the <a href="/privacy" style={{ color: T.mute }}>privacy policy</a> and <a href="/terms" style={{ color: T.mute }}>terms</a>.</p>
      </main>
      <footer style={{ padding: "20px 24px", fontSize: 12.5, color: T.mute, borderTop: `1px solid ${T.line}`, textAlign: "center" }}>
        <a href="https://soichirosaimon.com" style={{ color: T.mute }}>soichirosaimon.com</a>
      </footer>
    </div>
  );
}
