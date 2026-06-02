import { isElevenLabsConfigured, isSanityConfigured, isSupabaseConfigured } from "@/lib/env";
import { DeploySetupPanel } from "@/components/setup/DeploySetupPanel";
import { SupabaseSetupPanel } from "@/components/setup/SupabaseSetupPanel";
import "@/styles/setup.css";

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className="s-row"
      style={{ justifyContent: "space-between" }}
    >
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

export default function SetupPage() {
  const supabaseOk = isSupabaseConfigured();

  return (
    <div className="page-wrap narrow">
      <div className="ph-eyebrow">Platform</div>
      <h1 className="ph-title">
        Integration <em>Status</em>
      </h1>
      <p className="ph-sub">
        Copy <code>.env.example</code> to <code>.env.local</code> and add your keys to switch from
        demo mode to live services.
      </p>
      <hr className="ph-hr" />

      <div className="s-grid" style={{ marginBottom: 40 }}>
        <StatusRow label="Sanity CMS" ok={isSanityConfigured()} />
        <StatusRow label="Supabase" ok={supabaseOk} />
        <StatusRow label="ElevenLabs TTS" ok={isElevenLabsConfigured()} />
      </div>

      <DeploySetupPanel />

      <hr className="ph-hr" style={{ margin: "40px 0" }} />

      <SupabaseSetupPanel configured={supabaseOk} />
    </div>
  );
}
