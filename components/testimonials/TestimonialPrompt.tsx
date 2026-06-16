"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { TestimonialSourceType } from "@/lib/testimonials/types";
import {
  dismissTestimonialPrompt,
  isSubmittedLocal,
  isTestimonialPromptDismissed,
  markSubmittedLocal,
} from "@/lib/testimonials/promptState";
import "@/styles/testimonial-prompt.css";

type Props = {
  enabled: boolean;
  sourceType: TestimonialSourceType;
  sourceId: string;
  sourceLabel: string;
  promptTitle?: string;
  accentColor?: string;
};

function defaultDisplayName(user: ReturnType<typeof useAuth>["user"]): string {
  if (!user) return "";
  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  return meta.full_name || meta.name || user.email?.split("@")[0] || "";
}

export function TestimonialPrompt({
  enabled,
  sourceType,
  sourceId,
  sourceLabel,
  promptTitle,
  accentColor = "#C8963E",
}: Props) {
  const { user, openAuth } = useAuth();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const title = promptTitle ?? `How was ${sourceLabel}?`;

  useEffect(() => {
    if (!enabled || isTestimonialPromptDismissed() || isSubmittedLocal(sourceType, sourceId)) {
      setVisible(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const params = new URLSearchParams({ sourceType, sourceId });
        const res = await fetch(`/api/testimonials?${params}`);
        const data = (await res.json()) as { submitted?: boolean };
        if (cancelled) return;
        if (data.submitted) {
          markSubmittedLocal(sourceType, sourceId);
          setVisible(false);
          return;
        }
        setVisible(true);
      } catch {
        if (!cancelled) setVisible(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, sourceType, sourceId]);

  useEffect(() => {
    if (user) setDisplayName((prev) => prev || defaultDisplayName(user));
  }, [user]);

  const canSubmit = useMemo(
    () => rating >= 1 && consent && displayName.trim().length >= 2 && !submitting,
    [rating, consent, displayName, submitting]
  );

  const handleDismiss = useCallback(() => {
    dismissTestimonialPrompt();
    setVisible(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    if (!user) {
      openAuth("signup");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceId,
          sourceLabel,
          rating,
          quote: quote.trim() || undefined,
          displayName: displayName.trim(),
          roleTitle: roleTitle.trim() || undefined,
          location: location.trim() || undefined,
          consent,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Could not submit feedback" });
        return;
      }
      markSubmittedLocal(sourceType, sourceId);
      setMessage({
        type: "ok",
        text: data.message || "Thank you — your feedback was submitted for review.",
      });
      window.setTimeout(() => setVisible(false), 2200);
    } catch {
      setMessage({ type: "err", text: "Network error — please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    user,
    openAuth,
    sourceType,
    sourceId,
    sourceLabel,
    rating,
    quote,
    displayName,
    roleTitle,
    location,
    consent,
  ]);

  if (!visible) return null;

  const activeStars = hoverRating || rating;

  return (
    <div className="testimonial-prompt" style={{ borderColor: `${accentColor}44` }}>
      <div className="testimonial-prompt-title">{title}</div>
      <div className="testimonial-prompt-sub">
        Rate your experience and optionally share a short quote for other HR professionals.
        Approved feedback may appear on the homepage.
      </div>

      <div className="testimonial-stars" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`testimonial-star-btn${star <= activeStars ? " active" : ""}`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>

      {!user ? (
        <p className="testimonial-signin">
          <button type="button" className="testimonial-btn-ghost" onClick={() => openAuth("signup")}>
            Sign in
          </button>{" "}
          or{" "}
          <button type="button" className="testimonial-btn-ghost" onClick={() => openAuth("login")}>
            create an account
          </button>{" "}
          to submit feedback publicly.
        </p>
      ) : (
        <>
          <input
            className="testimonial-field"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
          />
          <div className="testimonial-row">
            <input
              className="testimonial-field"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Role (e.g. Compensation Analyst)"
              maxLength={80}
            />
            <input
              className="testimonial-field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Lagos)"
              maxLength={80}
            />
          </div>
          <textarea
            className="testimonial-field testimonial-textarea"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Optional testimonial (min. 20 characters if provided)"
            maxLength={500}
          />
          <label className="testimonial-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I agree this feedback may be shown on Rewardology Academy. See our{" "}
              <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </>
      )}

      <div className="testimonial-actions">
        <button
          type="button"
          className="testimonial-btn-primary"
          style={{ background: accentColor }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting…" : "Share feedback"}
        </button>
        <button type="button" className="testimonial-btn-ghost" onClick={handleDismiss}>
          Maybe later
        </button>
      </div>

      {message && (
        <div className={`testimonial-msg ${message.type}`} role="status">
          {message.text}
        </div>
      )}
    </div>
  );
}
