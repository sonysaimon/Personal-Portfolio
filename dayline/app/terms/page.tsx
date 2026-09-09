import { Doc } from "@/components/Doc";

export const metadata = { title: "Terms of service · Dayline" };

export default function Terms() {
  return (
    <Doc title="Terms of service" updated="September 9, 2026">
      <p>These are the terms for using Dayline at app.soichirosaimon.com. By signing in you agree to them.</p>

      <h2>What Dayline is</h2>
      <p>Dayline is a free planning tool that reads your connected calendars and the tasks and classes you enter, and suggests a schedule for the day. It is a personal project, offered as-is.</p>

      <h2>Your account</h2>
      <p>You sign in with a Google or Microsoft account; there is no separate password. You are responsible for keeping that account secure. You may delete your Dayline account at any time from Settings.</p>

      <h2>Acceptable use</h2>
      <p>Use Dayline only for your own planning. Don’t try to access other people’s data, disrupt the service, or use it for anything unlawful.</p>

      <h2>Your data</h2>
      <p>You own what you enter. Dayline stores it only to provide the service, as described in the <a href="/privacy">privacy policy</a>.</p>

      <h2>No warranty</h2>
      <p>Dayline is provided without warranties of any kind. The plan it generates is a suggestion; check it against your real calendar. Dayline may change or shut down at any time, and the author is not liable for missed events, lost data, or other damages arising from its use.</p>

      <h2>Changes</h2>
      <p>These terms may be updated. The date at the top shows the current version. Continued use after a change means you accept the new terms.</p>

      <h2>Contact</h2>
      <p><a href="mailto:sonnysaimonac@gmail.com">sonnysaimonac@gmail.com</a></p>
    </Doc>
  );
}
