import { AuthGate } from "@/components/auth/AuthGate";

export const metadata = {
  title: "Create account — Rewardology Academy",
  description: "Join Rewardology Academy to access courses, quizzes, comics, and track your progress.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthGate mode="signup" next={next} />;
}
