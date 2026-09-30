import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import {
  COMPANY_LOGO_BUCKET,
  COMPANY_LOGO_MAX_BYTES,
  detectLogoMime,
  logoExtension,
  normalizeDomain,
} from "@/lib/repository/company-logo";
import { fetchLogoDevLogo } from "@/lib/repository/logo-dev";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

type Params = { params: Promise<{ id: string }> };

function guard(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }
  return null;
}

async function loadCompany(supabase: ReturnType<typeof createRepositoryAdminClient>, id: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("company_id, website_domain, logo_storage_path")
    .eq("company_id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * multipart/form-data:
 *   domain  — optional; saved to website_domain
 *   source  — "suggestion" (download from logo.dev) | "upload" (use `file`) | "domain_only"
 *   file    — the reviewer's own asset (press kit, newsroom), when source = "upload"
 */
export async function POST(req: NextRequest, { params }: Params) {
  const denied = guard(req);
  if (denied) return denied;
  const { id } = await params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const supabase = createRepositoryAdminClient();
  const company = await loadCompany(supabase, id);
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const domainInput = String(form.get("domain") ?? "").trim();
  const domain = domainInput ? normalizeDomain(domainInput) : company.website_domain;
  if (domainInput && !domain) {
    return NextResponse.json({ error: "Enter a valid domain, e.g. gtcoplc.com" }, { status: 400 });
  }

  const source = String(form.get("source") ?? "");
  let logo: { bytes: Uint8Array; mime: string } | null = null;

  if (source === "suggestion") {
    if (!domain) return NextResponse.json({ error: "Set the website domain first" }, { status: 400 });
    const result = await fetchLogoDevLogo(domain);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    logo = result;
  } else if (source === "upload") {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Choose an image file to upload" }, { status: 400 });
    }
    if (file.size > COMPANY_LOGO_MAX_BYTES) {
      return NextResponse.json({ error: "Logo must be 1 MB or smaller" }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectLogoMime(bytes);
    if (!mime) return NextResponse.json({ error: "Upload a PNG, JPEG, WebP or SVG image" }, { status: 400 });
    logo = { bytes, mime };
  } else if (source !== "domain_only") {
    return NextResponse.json({ error: "Unknown logo source" }, { status: 400 });
  }

  const update: { website_domain: string | null; logo_storage_path?: string } = { website_domain: domain ?? null };

  if (logo) {
    const path = `${id}/${Date.now()}.${logoExtension(logo.mime)}`;
    const { error: uploadError } = await supabase.storage
      .from(COMPANY_LOGO_BUCKET)
      .upload(path, logo.bytes, { contentType: logo.mime, upsert: false });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    update.logo_storage_path = path;
  }

  const { data, error } = await supabase
    .from("companies")
    .update(update)
    .eq("company_id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (logo && company.logo_storage_path && company.logo_storage_path !== update.logo_storage_path) {
    await supabase.storage.from(COMPANY_LOGO_BUCKET).remove([company.logo_storage_path]);
  }

  return NextResponse.json({ company: data });
}

/** Remove the stored logo; the public site falls back to the initials placeholder. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = guard(req);
  if (denied) return denied;
  const { id } = await params;

  const supabase = createRepositoryAdminClient();
  const company = await loadCompany(supabase, id);
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("companies")
    .update({ logo_storage_path: null })
    .eq("company_id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (company.logo_storage_path) {
    await supabase.storage.from(COMPANY_LOGO_BUCKET).remove([company.logo_storage_path]);
  }
  return NextResponse.json({ company: data });
}
