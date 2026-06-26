"use client";

import { useEffect, useState } from "react";

type AdminStats = {
  users: { total: number; newLast7: number; newLast30: number; active7: number; active30: number };
  xp: { total: number; courses: number; quizzes: number; daily: number; articles: number; dictionary: number; comics: number };
  courses: { id: number; title: string; started: number; completed: number; avgPct: number }[];
  quizzes: { usersAttempted: number; attempts: number; perfectScores: number };
  testimonials: { pending: number; approved: number; rejected: number };
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-value" style={accent ? { color: accent } : undefined}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="adm-stat-label">{label}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

function SectionHead({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="adm-section-head">
      <span className="adm-section-icon">{icon}</span>
      <h3 className="adm-section-title">{title}</h3>
    </div>
  );
}

export function AdminDashboardPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup/admin-stats");
      if (!res.ok) {
        setError("Could not load stats. Make sure you are signed in as the admin.");
        return;
      }
      setStats(await res.json() as AdminStats);
      setLastRefreshed(new Date());
    } catch {
      setError("Network error loading stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="adm-loading">Loading platform stats…</div>;
  if (error) return <div className="adm-error">{error}</div>;
  if (!stats) return null;

  const { users, xp, courses, quizzes, testimonials } = stats;

  return (
    <div className="adm-dashboard">
      <div className="adm-header">
        <div>
          <h2 className="adm-title">Admin Dashboard</h2>
          {lastRefreshed && (
            <div className="adm-refreshed">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button type="button" className="setup-btn" onClick={load}>
          ↻ Refresh
        </button>
      </div>

      {/* ── Users ── */}
      <SectionHead title="Users" icon="👥" />
      <div className="adm-stat-grid">
        <StatCard label="Total registered" value={users.total} accent="#c8963e" />
        <StatCard label="New this week" value={users.newLast7} sub="last 7 days" />
        <StatCard label="New this month" value={users.newLast30} sub="last 30 days" />
        <StatCard label="Active this week" value={users.active7} sub="any learning activity" />
        <StatCard label="Active this month" value={users.active30} sub="any learning activity" />
      </div>

      {/* ── XP ── */}
      <SectionHead title="XP earned across all users" icon="⚡" />
      <div className="adm-stat-grid">
        <StatCard label="Total XP" value={xp.total.toLocaleString()} accent="#c8963e" />
        <StatCard label="From courses" value={xp.courses.toLocaleString()} />
        <StatCard label="From quizzes" value={xp.quizzes.toLocaleString()} />
        <StatCard label="From daily quiz" value={xp.daily.toLocaleString()} />
        <StatCard label="From articles" value={xp.articles.toLocaleString()} />
        <StatCard label="From dictionary" value={xp.dictionary.toLocaleString()} />
        <StatCard label="From comics" value={xp.comics.toLocaleString()} />
      </div>

      {/* ── Courses ── */}
      <SectionHead title="Course engagement" icon="📚" />
      <div className="adm-course-table">
        <div className="adm-course-row adm-course-hd">
          <span>Course</span>
          <span>Started</span>
          <span>Completed</span>
          <span>Avg progress</span>
        </div>
        {courses.map((c) => (
          <div key={c.id} className="adm-course-row">
            <span className="adm-course-name">{c.title}</span>
            <span>{c.started}</span>
            <span>{c.completed}</span>
            <span>
              <div className="adm-bar-wrap">
                <div className="adm-bar-fill" style={{ width: `${c.avgPct}%` }} />
                <span className="adm-bar-lbl">{c.avgPct}%</span>
              </div>
            </span>
          </div>
        ))}
      </div>

      {/* ── Quizzes ── */}
      <SectionHead title="Quizzes" icon="🧠" />
      <div className="adm-stat-grid">
        <StatCard label="Users attempted" value={quizzes.usersAttempted} />
        <StatCard label="Total attempts" value={quizzes.attempts} />
        <StatCard label="Perfect scores" value={quizzes.perfectScores} accent="#4ade80" />
      </div>

      {/* ── Testimonials ── */}
      <SectionHead title="Testimonials" icon="💬" />
      <div className="adm-stat-grid">
        <StatCard label="Pending review" value={testimonials.pending} accent={testimonials.pending > 0 ? "#e2ac50" : undefined} />
        <StatCard label="Approved" value={testimonials.approved} accent="#4ade80" />
        <StatCard label="Rejected" value={testimonials.rejected} />
      </div>
    </div>
  );
}
