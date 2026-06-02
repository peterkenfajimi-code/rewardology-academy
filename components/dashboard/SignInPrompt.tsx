"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function SignInPrompt({ configured }: { configured: boolean }) {
  const { openAuth } = useAuth();

  return (
    <div className="dash-gate">
      <div className="dash-eyebrow">Member area</div>
      <h1 className="dash-gate-title">
        Your <em>dashboard</em> awaits
      </h1>
      <p className="dash-gate-sub">
        {configured
          ? "Sign in to see your XP, level, badges, and quiz history — synced across all your devices."
          : "Accounts aren't enabled yet. Once Supabase is configured, sign in here to track your XP, badges, and quiz history across devices."}
      </p>
      {configured && (
        <div className="ra-auth ra-auth-actions" style={{ justifyContent: "center" }}>
          <button className="ra-auth-btn" onClick={() => openAuth("login")}>
            Log in
          </button>
          <button className="ra-auth-btn ra-auth-btn-primary" onClick={() => openAuth("signup")}>
            Join now
          </button>
        </div>
      )}
    </div>
  );
}
