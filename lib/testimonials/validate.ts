import type { SubmitTestimonialPayload, TestimonialSourceType } from "@/lib/testimonials/types";

const SOURCE_TYPES = new Set<TestimonialSourceType>(["course", "quiz", "comic"]);

export function parseSubmitPayload(body: unknown):
  | { ok: true; data: SubmitTestimonialPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const b = body as Record<string, unknown>;
  const sourceType = b.sourceType;
  const sourceId = String(b.sourceId ?? "").trim();
  const sourceLabel = String(b.sourceLabel ?? "").trim();
  const displayName = String(b.displayName ?? "").trim();
  const rating = Number(b.rating);
  const quote = b.quote != null ? String(b.quote).trim() : "";
  const roleTitle = b.roleTitle != null ? String(b.roleTitle).trim() : "";
  const location = b.location != null ? String(b.location).trim() : "";
  const consent = b.consent === true;

  if (!SOURCE_TYPES.has(sourceType as TestimonialSourceType)) {
    return { ok: false, error: "Invalid source type" };
  }
  if (!sourceId || sourceId.length > 64) {
    return { ok: false, error: "Invalid source id" };
  }
  if (!sourceLabel || sourceLabel.length > 120) {
    return { ok: false, error: "Invalid source label" };
  }
  if (!displayName || displayName.length > 80) {
    return { ok: false, error: "Display name is required" };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be 1–5 stars" };
  }
  if (!consent) {
    return { ok: false, error: "Consent is required to share your feedback publicly" };
  }
  if (quote && quote.length < 20) {
    return { ok: false, error: "Testimonial must be at least 20 characters" };
  }
  if (quote.length > 500) {
    return { ok: false, error: "Testimonial is too long (max 500 characters)" };
  }
  if (roleTitle.length > 80) {
    return { ok: false, error: "Role is too long" };
  }
  if (location.length > 80) {
    return { ok: false, error: "Location is too long" };
  }

  return {
    ok: true,
    data: {
      sourceType: sourceType as TestimonialSourceType,
      sourceId,
      sourceLabel,
      rating,
      quote: quote || undefined,
      displayName,
      roleTitle: roleTitle || undefined,
      location: location || undefined,
      consent,
    },
  };
}
