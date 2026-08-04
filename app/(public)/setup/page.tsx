import { redirect } from "next/navigation";
import { isPlatformAdminConfigured, isPlatformAdminEmail } from "@/lib/auth/admin";
import { isElevenLabsConfigured, isSanityConfigured, isSupabaseConfigured } from "@/lib/env";
import { checkResendHealth } from "@/lib/resend/health";
import { createClient } from "@/lib/supabase/server";
import { TestimonialsSetupPanel } from "@/components/setup/TestimonialsSetupPanel";
import { DeploySetupPanel } from "@/components/setup/DeploySetupPanel";
import { ImprovMXSetupPanel } from "@/components/setup/ImprovMXSetupPanel";
import { ResendSetupPanel } from "@/components/setup/ResendSetupPanel";
import { SupabaseSetupPanel } from "@/components/setup/SupabaseSetupPanel";
import { AdminDashboardPanel } from "@/components/setup/AdminDashboardPanel";
import Link from "next/link";
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

function AdminConfigNotice() {
  return (
    <div className="page-wrap narrow">
      <div className="ph-eyebrow">Platform</div>
      <h1 className="ph-title" style={{ fontSize: "clamp(24px,3vw,32px)" }}>
        Admin access <em>not configured</em>
      </h1>
      <p className="ph-sub">
        Set <code>ADMIN_EMAIL</code> and <code>NEXT_PUBLIC_ADMIN_EMAIL</code> in your Netlify
        environment variables, then redeploy. Run{" "}
        <code>node scripts/configure-netlify-env.mjs</code> locally if needed.
      </p>
      <Link href="/dashboard" className="setup-btn">
        Go to member dashboard →
      </Link>
    </div>
  );
}

function AdminAccessDenied() {
  return (
    <div className="page-wrap narrow">
      <div className="ph-eyebrow">Platform</div>
      <h1 className="ph-title" style={{ fontSize: "clamp(24px,3vw,32px)" }}>
        Admin access <em>required</em>
      </h1>
      <p className="ph-sub">
        Integration Status is only available to the platform owner account. Sign in with the admin
        email configured for this site.
      </p>
      <Link href="/dashboard" className="setup-btn">
        Go to member dashboard →
      </Link>
    </div>
  );
}

export default async function SetupPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?next=/setup");
    }

    if (!isPlatformAdminConfigured()) {
      return <AdminConfigNotice />;
    }

    if (!isPlatformAdminEmail(user.email)) {
      return <AdminAccessDenied />;
    }
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
