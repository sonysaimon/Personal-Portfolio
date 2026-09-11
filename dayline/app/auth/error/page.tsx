import { Landing } from "@/components/Landing";
import { authErrorMessage } from "@/lib/auth-errors";

export default async function AuthError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <Landing error={authErrorMessage(error ?? "Default")} />;
}
