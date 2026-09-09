import { Landing } from "@/components/Landing";

const MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "An account with this email already exists through the other provider. Sign in with the provider you used first, then connect this one from Settings → Connected calendars.",
  AccessDenied: "Sign-in was cancelled or access was denied. Dayline needs calendar access to build your plan.",
  Configuration: "Sign-in isn't configured correctly on the server. If you're the owner, check the OAuth environment variables.",
  OAuthCallbackError: "The sign-in provider returned an error. Please try again.",
  Verification: "That sign-in link is no longer valid. Please try again.",
};

export default async function AuthError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <Landing error={MESSAGES[error ?? ""] ?? "Something went wrong during sign-in. Please try again."} />;
}
