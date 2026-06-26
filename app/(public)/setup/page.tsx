import { redirect } from "next/navigation";
import { isElevenLabsConfigured, isSanityConfigured, isSupabaseConfigured } from "@/lib/env";
import { checkResendHealth } from "@/lib/resend/health";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_FORWARD_GMAIL } from "@/lib/site";
import { TestimonialsSetupPanel } from "@/components/setup/TestimonialsSetupPanel";
import { DeploySetupPanel } from "@/components/setup/DeploySetupPanel";
import { ImprovMXSetupPanel } from "@/components/setup/ImprovMXSetupPanel";
import { ResendSetupPanel } from "@/components/setup/ResendSetupPanel";
import { SupabaseSetupPanel } from "@/components/setup/SupabaseSetupPanel";
import { AdminDashboardPanel } from "@/components/setup/AdminDashboardPanel";
import "@/styles/setup.css";

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="s-row" style={{ justifyContent: "space-between" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span
        className="s-pill"
        style={
          ok
            ? { background: "rgba(52,211,153,.15)", color: "#34d399" }
            : { background: "rgba(200,150,62,.15)", color: "#e2ac50" }
        }
      >
        {ok ? "Connected" : "Demo / not configured"}
      </span>
    </div>
  );
}

export default async function SetupPage() {
  // Gate: only the admin email may access this page
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email?.toLowerCase() === CONTACT_FORWARD_GMAIL.toLowerCase();
    if (!isAdmin) redirect("/");
  }

  const supabaseOk = isSupabaseConfigured();
  const resendHealth = await checkResendHealth();
  const resendOk = resendHealth.reachable;

  return (
    <div className="page-wrap narrow">
      {/* ── Admin stats dashboard ── */}
      <AdminDashboardPanel />

      <hr className="ph-hr" style={{ margin: "48px 0 40px" }} />

      {/* ── Integration status ── */}
      <div className="ph-eyebrow">Platform</div>
      <h2 className="ph-title" style={{ fontSize: "clamp(24px,3vw,32px)" }}>
        Integration <em>Status</em>
      </h2>
      <p className="ph-sub">
        Copy <code>.env.example</code> to <code>.env.local</code> and add your keys to switch from
        demo mode to live services.
      </p>
      <hr className="ph-hr" />

      <div className="s-grid" style={{ marginBottom: 40 }}>
        <StatusRow label="Sanity CMS" ok={isSanityConfigured()} />
        <StatusRow label="Supabase" ok={supabaseOk} />
        <StatusRow label="Resend email" ok={resendOk} />
        <StatusRow label="ElevenLabs TTS" ok={isElevenLabsConfigured()} />
      </div>

      <DeploySetupPanel />
      <hr className="ph-hr" style={{ margin: "40px 0" }} />
      <SupabaseSetupPanel configured={supabaseOk} />
      <hr className="ph-hr" style={{ margin: "40px 0" }} />
      <ResendSetupPanel />
      <hr className="ph-hr" style={{ margin: "40px 0" }} />
      <ImprovMXSetupPanel />
      <hr className="ph-hr" style={{ margin: "40px 0" }} />
      <TestimonialsSetupPanel configured={supabaseOk} />
    </div>
  );
}
