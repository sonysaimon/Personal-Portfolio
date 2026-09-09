const T = { paper: "#FCFCFA", ink: "#1F2321", mute: "#7A7F7B", line: "#E7E7E2", font: '"Avenir Next", "Segoe UI", "Helvetica Neue", system-ui, sans-serif' };

export function Doc({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: T.font, color: T.ink, background: T.paper, minHeight: "100vh" }}>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px", lineHeight: 1.6, fontSize: 15 }}>
        <a href="/" style={{ fontSize: 14, color: T.mute, textDecoration: "none" }}>← Dayline</a>
        <h1 style={{ fontSize: 30, fontWeight: 400, letterSpacing: -0.4, margin: "28px 0 4px" }}>{title}</h1>
        <div style={{ color: T.mute, fontSize: 13.5, marginBottom: 32 }}>Last updated {updated}</div>
        <style>{`.doc h2{font-size:18px;font-weight:500;margin:32px 0 8px}.doc p,.doc li{margin:0 0 10px}.doc ul{padding-left:20px}`}</style>
        <div className="doc">{children}</div>
        <div style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${T.line}`, fontSize: 13, color: T.mute }}>
          <a href="/privacy" style={{ color: T.mute }}>Privacy</a> · <a href="/terms" style={{ color: T.mute }}>Terms</a> · <a href="https://soichirosaimon.com" style={{ color: T.mute }}>soichirosaimon.com</a>
        </div>
      </main>
    </div>
  );
}
