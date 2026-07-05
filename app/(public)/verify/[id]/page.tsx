import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  VerifyCertificateNotFound,
  VerifyCertificateView,
} from "@/components/certificates/VerifyCertificateView";
import type { PublicCertificate } from "@/lib/certificates/types";

type Props = { params: Promise<{ id: string }> };

async function loadCertificate(id: string): Promise<PublicCertificate | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_certificate", {
    p_id: id,
  });
  if (error || !data) return null;
  return data as PublicCertificate;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cert = await loadCertificate(id);
  if (!cert) {
    return { title: "Credential not found — Rewardology Academy" };
  }
  return {
    title: `${cert.credentialName} — Verified — Rewardology Academy`,
    description: `Verified ${cert.credentialName} issued to ${cert.recipientName} by Rewardology Academy.`,
    openGraph: {
      title: `${cert.credentialName} — Rewardology Academy`,
      description: `Verified credential awarded to ${cert.recipientName}`,
    },
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { id } = await params;
  const cert = await loadCertificate(id);
  if (!cert) return <VerifyCertificateNotFound id={id.toUpperCase()} />;
  return <VerifyCertificateView cert={cert} />;
}
