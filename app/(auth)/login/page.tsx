import { AuthGate } from "@/components/auth/AuthGate";

export const metadata = {
  title: "Sign in — Rewardology Academy",
  description: "Sign in to access courses, quizzes, comics, and your learning dashboard.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthGate mode="login" next={next} />;
}
