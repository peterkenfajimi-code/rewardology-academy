"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CONTACT_FORWARD_GMAIL } from "@/lib/site";
import { starsForRating, type TestimonialRow } from "@/lib/testimonials/types";

export function TestimonialsSetupPanel({ configured }: { configured: boolean }) {
  const { user } = useAuth();
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin =
    Boolean(user?.email) &&
    user!.email!.toLowerCase() === CONTACT_FORWARD_GMAIL.toLowerCase();

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup/testimonials");
      const data = (await res.json()) as { items?: TestimonialRow[]; error?: string };
      if (!res.ok) {
        setError(data.error || "Could not load queue");
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (configured && isAdmin) refresh();
  }, [configured, isAdmin, refresh]);

  const moderate = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/setup/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not update");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Network error");
    } finally {
      setBusyId(null);
    }
  };

  if (!configured) return null;

  return (
    <div className="setup-supabase">
      <h2 className="setup-section-title">Testimonials moderation</h2>
      <p className="setup-section-sub">
        Review learner feedback submitted after courses, quizzes, and comics. Approved quotes with
        at least 20 characters appear on the homepage.
      </p>

      {!user ? (
        <p style={{ fontSize: 14, opacity: 0.75 }}>
          Sign in as <code>{CONTACT_FORWARD_GMAIL}</code> to moderate the queue.
        </p>
      ) : !isAdmin ? (
        <p style={{ fontSize: 14, opacity: 0.75 }}>
          Signed in as {user.email}. Moderation is limited to the platform admin account.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button type="button" className="setup-btn" onClick={refresh} disabled={loading}>
              {loading ? "Loading…" : "Refresh queue"}
            </button>
            <span className="setup-check-pill">{items.length} pending</span>
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 14, marginBottom: 12 }}>{error}</p>
          )}

          {items.length === 0 && !loading ? (
            <p style={{ fontSize: 14, opacity: 0.75 }}>No pending testimonials.</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 12,
                    padding: 16,
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>
                    {item.source_type} · {item.source_label} · {starsForRating(item.rating)}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {item.display_name}
                    {item.role_title ? ` · ${item.role_title}` : ""}
                    {item.location ? ` · ${item.location}` : ""}
                  </div>
                  {item.quote ? (
                    <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                      &ldquo;{item.quote}&rdquo;
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
                      Rating only — no quote provided.
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className="setup-btn"
                      disabled={busyId === item.id}
                      onClick={() => moderate(item.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="setup-btn"
                      style={{ opacity: 0.85 }}
                      disabled={busyId === item.id}
                      onClick={() => moderate(item.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
