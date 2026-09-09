import { Doc } from "@/components/Doc";

export const metadata = { title: "Privacy policy · Dayline" };

export default function Privacy() {
  return (
    <Doc title="Privacy policy" updated="September 9, 2026">
      <p>Dayline is a personal day planner made by Soichiro (Sonny) Saimon. This page explains what Dayline collects, why, and what you can do about it.</p>

      <h2>What Dayline collects</h2>
      <ul>
        <li><strong>Your account.</strong> When you sign in with Google or Microsoft, Dayline stores your name, email address, and profile picture URL so it can show you your own data.</li>
        <li><strong>Calendar events.</strong> Dayline reads events from the Google Calendars and Outlook calendars you connect, for the days you look at, so it can plan around them. Events are fetched when you open the app and are not stored in Dayline’s database.</li>
        <li><strong>What you enter.</strong> Tasks, class times, events you add inside Dayline, and your planning preferences (work hours, lunch, focus time) are saved to your account.</li>
        <li><strong>Access tokens.</strong> To read your calendar, Dayline keeps the OAuth tokens that Google or Microsoft issue. They are encrypted at rest and only ever used on the server; they are never sent to your browser.</li>
      </ul>

      <h2>How Google user data is used</h2>
      <p>Dayline’s use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use requirements. Calendar data is used only to display your events and build your daily plan. It is not used for advertising, not sold, not shared with third parties, and not used to train AI models. Dayline requests the <em>calendar.events</em> and <em>calendar.calendarlist.readonly</em> scopes and does not create, edit, or delete events in your Google Calendar.</p>

      <h2>How Microsoft data is used</h2>
      <p>With the <em>Calendars.ReadWrite</em> and <em>User.Read</em> permissions, Dayline reads your calendar view and basic profile. In the current release Dayline does not create or modify Outlook events.</p>

      <h2>What Dayline does not do</h2>
      <ul>
        <li>No advertising, analytics trackers, or data brokers.</li>
        <li>No selling or sharing of your data.</li>
        <li>No reading of your email (mail features are not part of this release and would ask for separate consent).</li>
      </ul>

      <h2>Where data lives</h2>
      <p>The app runs on Vercel and stores account data in a Postgres database hosted by Neon. Both are subject to their own security practices. Data is transmitted over HTTPS.</p>

      <h2>Deleting your data</h2>
      <p>Open <strong>Settings → Delete my account and data</strong>. This removes every row associated with your account and revokes Dayline’s access to your Google account. You can also revoke access at any time from your <a href="https://myaccount.google.com/permissions">Google account permissions</a> or <a href="https://account.live.com/consent/Manage">Microsoft account permissions</a>.</p>

      <h2>Contact</h2>
      <p>Questions about privacy: <a href="mailto:sonnysaimonac@gmail.com">sonnysaimonac@gmail.com</a>.</p>
    </Doc>
  );
}
