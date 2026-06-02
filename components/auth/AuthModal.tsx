"use client";

import { useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthMode } from "@/components/auth/AuthProvider";
import { AuthForm } from "@/components/auth/AuthForm";

type Props = {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onClose: () => void;
  supabase: SupabaseClient | null;
  configured: boolean;
  nextPath?: string;
};

export function AuthModal({
  mode,
  setMode,
  onClose,
  supabase,
  configured,
  nextPath = "/dashboard",
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="ra-auth ra-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ra-modal" role="dialog" aria-modal="true">
        <button className="ra-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <AuthForm
          mode={mode}
          setMode={setMode}
          supabase={supabase}
          configured={configured}
          nextPath={nextPath}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}
