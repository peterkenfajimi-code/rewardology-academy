import { sendEmail } from "@/lib/resend/sendEmail";
import { CONTACT_FORWARD_GMAIL, getPublicSiteUrl } from "@/lib/site";
import { starsForRating } from "@/lib/testimonials/types";
import type { SubmitTestimonialPayload } from "@/lib/testimonials/types";

export async function notifyAdminNewTestimonial(
  payload: SubmitTestimonialPayload,
  testimonialId: string
): Promise<void> {
  const setupUrl = `${getPublicSiteUrl()}/setup`;
  const quoteBlock = payload.quote
    ? `<blockquote style="margin:12px 0;padding:12px 16px;border-left:3px solid #C8963E;background:#f8f6f2;">${escapeHtml(payload.quote)}</blockquote>`
    : "<p><em>Rating only — no quote provided.</em></p>";

  const html = `
    <h2 style="font-family:Georgia,serif;color:#0a1628;">New testimonial pending review</h2>
    <p>A learner submitted feedback after completing <strong>${escapeHtml(payload.sourceLabel)}</strong>.</p>
    <ul>
      <li><strong>Rating:</strong> ${starsForRating(payload.rating)} (${payload.rating}/5)</li>
      <li><strong>Name:</strong> ${escapeHtml(payload.displayName)}</li>
      <li><strong>Role:</strong> ${escapeHtml(payload.roleTitle || "—")}</li>
      <li><strong>Location:</strong> ${escapeHtml(payload.location || "—")}</li>
      <li><strong>Source:</strong> ${escapeHtml(payload.sourceType)} · ${escapeHtml(payload.sourceId)}</li>
      <li><strong>ID:</strong> ${escapeHtml(testimonialId)}</li>
    </ul>
    ${quoteBlock}
    <p><a href="${setupUrl}">Review in Integration Status →</a></p>
  `.trim();

  const text = [
    `New testimonial pending review`,
    `Activity: ${payload.sourceLabel}`,
    `Rating: ${payload.rating}/5`,
    `From: ${payload.displayName}`,
    payload.quote ? `Quote: ${payload.quote}` : "Rating only",
    `Review: ${setupUrl}`,
  ].join("\n");

  await sendEmail({
    to: CONTACT_FORWARD_GMAIL,
    subject: `New testimonial — ${payload.sourceLabel} (${payload.rating}★)`,
    html,
    text,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
