import { auth } from "@/auth";
import { Landing } from "@/components/Landing";
import { Planner } from "@/components/Planner";
import { authErrorMessage } from "@/lib/auth-errors";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.user) {
    const { error } = await searchParams;
    return <Landing error={authErrorMessage(error)} />;
  }
  return <Planner user={{ name: session.user.name, email: session.user.email, image: session.user.image }} />;
}
