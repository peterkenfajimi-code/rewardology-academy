import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset your password — Rewardology Academy",
  description: "Enter your email address and we'll send you a link to reset your password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
