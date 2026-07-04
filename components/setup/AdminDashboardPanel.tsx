"use client";

import { useEffect, useState } from "react";

type AdminStats = {
  users: { total: number; newLast7: number; newLast30: number; active7: number; active30: number };
  xp: { total: number; courses: number; quizzes: number; daily: number; articles: number; dictionary: number; comics: number };
  courses: { id: number; title: string; started: number; completed: number; avgPct: number }[];
  quizzes: { usersAttempted: number; attempts: number; perfectScores: number };
  testimonials: { pending: number; approved: number; rejected: number };
  locations: {
    totalTracked: number;
    totalUsers: number;
    unknown: number;
    countriesRepresented: number;
    byCountry: { countryCode: string; countryName: string | null; users: number }[];
    byRegion: { countryCode: string; region: string; users: number }[];
    recent: {
      countryCode: string;
      countryName: string | null;
      region: string | null;
      city: string | null;
      lastSeenAt: string;
    }[];
  };
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

function formatLocationLabel(
  countryCode: string,
  countryName: string | null,
  region?: string | null,
  city?: string | null
) {
  const country = countryName || countryCode;
  const parts = [city, region, country].filter(Boolean);
  return parts.join(", ");
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
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

  const { users, xp, courses, quizzes, testimonials, locations } = stats;
  const topCountryUsers = locations.byCountry[0]?.users ?? 1;

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

      {/* ── User locations ── */}
      <SectionHead title="User locations" icon="🌍" />
      <div className="adm-stat-grid">
        <StatCard
          label="Users with location"
          value={locations.totalTracked}
          accent="#c8963e"
          sub={`of ${locations.totalUsers} registered`}
        />
        <StatCard label="Countries represented" value={locations.countriesRepresented} />
        <StatCard
          label="Location unknown"
          value={locations.unknown}
          sub="not yet recorded or unavailable"
        />
      </div>

      {locations.byCountry.length > 0 ? (
        <div className="adm-location-grid">
          <div className="adm-location-panel">
            <h4 className="adm-location-title">By country</h4>
            <div className="adm-location-table">
              <div className="adm-location-row adm-location-hd">
                <span>Country</span>
                <span>Users</span>
                <span>Share</span>
              </div>
              {locations.byCountry.map((row) => {
                const pct =
                  locations.totalTracked > 0
                    ? Math.round((row.users / locations.totalTracked) * 100)
                    : 0;
                const barPct = Math.round((row.users / topCountryUsers) * 100);
                return (
                  <div key={row.countryCode} className="adm-location-row">
                    <span className="adm-location-name">
                      {row.countryName || row.countryCode}
                      <span className="adm-location-code">{row.countryCode}</span>
                    </span>
                    <span>{row.users}</span>
                    <span>
                      <div className="adm-bar-wrap">
                        <div className="adm-bar-fill" style={{ width: `${barPct}%` }} />
                        <span className="adm-bar-lbl">{pct}%</span>
                      </div>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="adm-location-panel">
            <h4 className="adm-location-title">Top regions</h4>
            {locations.byRegion.length > 0 ? (
              <div className="adm-location-table">
                <div className="adm-location-row adm-location-hd adm-location-row-region">
                  <span>Region</span>
                  <span>Users</span>
                </div>
                {locations.byRegion.map((row) => (
                  <div key={`${row.countryCode}-${row.region}`} className="adm-location-row adm-location-row-region">
                    <span className="adm-location-name">
                      {row.region}
                      <span className="adm-location-code">{row.countryCode}</span>
                    </span>
                    <span>{row.users}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="adm-location-empty">No regional data yet.</p>
            )}

            <h4 className="adm-location-title" style={{ marginTop: 20 }}>
              Recent activity
            </h4>
            {locations.recent.length > 0 ? (
              <ul className="adm-location-recent">
                {locations.recent.map((row, i) => (
                  <li key={`${row.countryCode}-${row.lastSeenAt}-${i}`}>
                    <span>{formatLocationLabel(row.countryCode, row.countryName, row.region, row.city)}</span>
                    <span className="adm-location-time">{formatRelativeTime(row.lastSeenAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="adm-location-empty">No recent visits recorded.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="adm-location-empty">
          Location data will appear once signed-in users visit the site. Approximate geo is derived from IP/CDN headers — no GPS permission is requested.
        </p>
      )}

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
