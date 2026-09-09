import { auth } from "@/auth";
import { Landing } from "@/components/Landing";
import { Planner } from "@/components/Planner";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user) return <Landing />;
  return <Planner user={{ name: session.user.name, email: session.user.email, image: session.user.image }} />;
}
