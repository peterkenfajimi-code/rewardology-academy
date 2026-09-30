"use client";

import { useEffect, useState } from "react";
import { CompanyLogo } from "@/components/repository/CompanyLogo";
import type { Company } from "@/lib/repository/types";

type Props = {
  company: Company;
  onUpdated: (company: Company) => void;
};

export function RepositoryCompanyLogoPanel({ company, onUpdated }: Props) {
  const [domain, setDomain] = useState(company.website_domain ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  useEffect(() => {
    setDomain(company.website_domain ?? "");
    setPreviewUrl(null);
    setFile(null);
    setStatus(null);
  }, [company.company_id, company.website_domain]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function suggest() {
    setStatus(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/repository-admin/logo-preview?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setPreviewUrl(URL.createObjectURL(await res.blob()));
    } catch (e) {
      setPreviewUrl(null);
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "No suggestion available" });
    } finally {
      setBusy(false);
    }
  }

  async function submit(source: "suggestion" | "upload" | "domain_only") {
    setStatus(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.set("domain", domain);
      form.set("source", source);
      if (source === "upload" && file) form.set("file", file);
      const res = await fetch(`/api/repository-admin/companies/${company.company_id}/logo`, {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { company?: Company; error?: string };
      if (!res.ok || !data.company) throw new Error(data.error ?? "Save failed");
      onUpdated(data.company);
      setPreviewUrl(null);
      setFile(null);
      setStatus({
        kind: "ok",
        text: source === "domain_only" ? "Domain saved." : "Logo stored in Supabase Storage.",
      });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  }

  async function removeLogo() {
    setStatus(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/repository-admin/companies/${company.company_id}/logo`, { method: "DELETE" });
      const data = (await res.json()) as { company?: Company; error?: string };
      if (!res.ok || !data.company) throw new Error(data.error ?? "Remove failed");
      onUpdated(data.company);
      setStatus({ kind: "ok", text: "Logo removed — the public site shows initials." });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Remove failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="repo-admin-logo-panel">
      <h3>Logo</h3>
      <div className="repo-admin-logo-current">
        <CompanyLogo name={company.name} logoPath={company.logo_storage_path} size={56} />
        <span className="repo-admin-muted">
          {company.logo_storage_path ? "Stored logo (shown on the public site)" : "No logo — public site shows initials"}
        </span>
        {company.logo_storage_path ? (
          <button type="button" className="repo-admin-btn repo-admin-btn-ghost" disabled={busy} onClick={removeLogo}>
            Remove
          </button>
        ) : null}
      </div>

      <div className="repo-admin-grid">
        <label>
          Website domain
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. gtcoplc.com" />
        </label>
      </div>
      <div className="repo-admin-logo-actions">
        <button type="button" className="repo-admin-btn" disabled={busy || !domain.trim()} onClick={suggest}>
          Suggest from logo.dev
        </button>
        <button type="button" className="repo-admin-btn repo-admin-btn-ghost" disabled={busy} onClick={() => submit("domain_only")}>
          Save domain only
        </button>
      </div>

      {previewUrl ? (
        <div className="repo-admin-logo-preview">
          <img src={previewUrl} alt={`Suggested logo for ${company.name}`} />
          <div className="repo-admin-logo-actions">
            <button type="button" className="repo-admin-btn repo-admin-btn-primary" disabled={busy} onClick={() => submit("suggestion")}>
              Accept suggestion
            </button>
            <button type="button" className="repo-admin-btn repo-admin-btn-ghost" disabled={busy} onClick={() => setPreviewUrl(null)}>
              Skip
            </button>
          </div>
        </div>
      ) : null}

      <p className="repo-admin-muted">
        Prefer the company&apos;s own asset (press kit, newsroom, annual report cover) when you have it:
      </p>
      <div className="repo-admin-logo-actions">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="button" className="repo-admin-btn" disabled={busy || !file} onClick={() => submit("upload")}>
          Upload
        </button>
      </div>

      {status ? (
        <p className={status.kind === "error" ? "repo-admin-alert error" : "repo-admin-alert"}>{status.text}</p>
      ) : null}
    </div>
  );
}
