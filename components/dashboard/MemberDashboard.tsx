import Link from "next/link";
import { DAILY_QUIZ_XP } from "@/lib/daily-quiz/dailyQuizData";
import { DICTIONARY_XP_PER_TERM } from "@/lib/dictionary/terms";
import { DashboardProgressFill } from "@/components/dashboard/DashboardProgressFill";
import { evaluateBadges, type BadgeActionFlags } from "@/lib/xp/badges";
import { XP_LEVELS, levelFor, rankProgress, PINNACLE_RANK_XP } from "@/lib/xp/levels";
import { MAX_PLATFORM_XP } from "@/lib/xp/platformMax";
import {
  COMIC_XP_PER_ISSUE,
  sumXpSources,
  XP_EARN_RATES,
  XP_SOURCE_LABELS,
  XP_SOURCE_MAX,
  type XpSources,
} from "@/lib/xp/xpRates";

type MemberDashboardProps = {
  displayName: string;
  sources: XpSources;
  badgeActions: BadgeActionFlags;
};

function fmt(n: number) {
  return n.toLocaleString();
}

type ActivityItem = {
  dot: "gold" | "teal" | "muted";
  html: string;
  xp: string;
  time: string;
};

function buildActivity(sources: XpSources): ActivityItem[] {
  const acts: ActivityItem[] = [];
  if (sources.courses > 0) {
    acts.push({
      dot: "teal",
      html: `Earned <strong>${fmt(sources.courses)} XP</strong> from course lessons`,
      xp: `+${fmt(sources.courses)}`,
      time: "Courses",
    });
  }
  if (sources.quizzes > 0) {
    acts.push({
      dot: "gold",
      html: `Earned <strong>${fmt(sources.quizzes)} XP</strong> from quiz completions`,
      xp: `+${fmt(sources.quizzes)}`,
      time: "Quizzes",
    });
  }
  if (sources.articles > 0) {
    acts.push({
      dot: "teal",
      html: `Earned <strong>${fmt(sources.articles)} XP</strong> from articles read`,
      xp: `+${fmt(sources.articles)}`,
      time: "Articles",
    });
  }
  if (sources.dictionary > 0) {
    acts.push({
      dot: "muted",
      html: `Explored <strong>${Math.round(sources.dictionary / DICTIONARY_XP_PER_TERM)}</strong> dictionary terms`,
      xp: `+${fmt(sources.dictionary)}`,
      time: "Dictionary",
    });
  }
  if (sources.comics > 0) {
    acts.push({
      dot: "gold",
      html: `Read <strong>${Math.round(sources.comics / COMIC_XP_PER_ISSUE)}</strong> comics issues`,
      xp: `+${fmt(sources.comics)}`,
      time: "Comics",
    });
  }
  if (sources.daily > 0) {
    acts.push({
      dot: "teal",
      html: `Completed <strong>${Math.round(sources.daily / DAILY_QUIZ_XP)}</strong> daily quizzes`,
      xp: `+${fmt(sources.daily)}`,
      time: "Daily",
    });
  }
  return acts;
}

export function MemberDashboard({ displayName, sources, badgeActions }: MemberDashboardProps) {
  const totalXp = sumXpSources(sources);
  const { current, next } = levelFor(totalXp);
  const prog = rankProgress(totalXp);
  const badges = evaluateBadges(totalXp, badgeActions);
  const earnedBadgeCount = badges.filter((b) => b.earned).length;
  const activity = buildActivity(sources);
  const pinnacleName = XP_LEVELS[XP_LEVELS.length - 1].name;

  return (
    <div className="db-root">
      <header className="db-hero">
        <div className="db-hero-inner">
          <div>
            <p className="db-hero-eye">Your Learning Profile</p>
            <h1 className="db-hero-name">Welcome back, {displayName}.</h1>
            <p className="db-hero-rank">
              Current rank: <span>{current.name}</span>
            </p>

            <div className="db-progress-block">
              <div className="db-progress-meta">
                <span className="db-progress-label">Progress to next rank</span>
                <span className="db-progress-target">
                  {next ? (
                    <>
                      <em>{fmt(totalXp)}</em> / {fmt(next.min)} XP
                    </>
                  ) : (
                    <em>Maximum rank achieved</em>
                  )}
                </span>
              </div>
              <div className="db-progress-track">
                <DashboardProgressFill pct={prog} />
              </div>
              <div className="db-next-rank">
                {next
                  ? `${fmt(next.min - totalXp)} XP to reach ${next.name}`
                  : `You have reached ${pinnacleName} — the pinnacle rank.`}
              </div>
            </div>

            <div className="db-cta-row">
              <Link href="/courses" className="db-btn db-btn-gold">
                Continue Learning →
              </Link>
              <Link href="/quizzes" className="db-btn db-btn-ghost">
                Take a Quiz
              </Link>
            </div>
          </div>

          <div className="db-hero-xp-card">
            <div className="db-hero-xp-total">
              <div className="db-xp-big">{fmt(totalXp)}</div>
              <div className="db-xp-label">Total XP Earned</div>
            </div>
            <div className="db-xp-sources">
              {(Object.keys(XP_SOURCE_LABELS) as (keyof typeof XP_SOURCE_LABELS)[]).map((key) => (
                <div key={key} className="db-xp-src">
                  <span className="db-xp-src-name">{XP_SOURCE_LABELS[key]}</span>
                  <span className="db-xp-src-val">{fmt(sources[key])} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="db-grid">
        <div className="db-card">
          <div className="db-card-title">Rank Ladder</div>
          <div className="db-card-sub">
            {XP_LEVELS.length} levels · {XP_LEVELS[0].name} → {pinnacleName}
          </div>
          <div className="db-rank-ladder">
            {XP_LEVELS.map((rank, i) => {
              const achieved = totalXp >= rank.min;
              const isCurrent = rank.name === current.name;
              let rowClass = "db-rank-row";
              if (isCurrent) rowClass += " current";
              else if (achieved) rowClass += " achieved";
              else rowClass += " locked";

              return (
                <div key={rank.name} className={rowClass}>
                  <div className="db-rank-num">{i + 1}</div>
                  <div className="db-rank-name">{rank.name}</div>
                  {isCurrent ? <span className="db-rank-badge">Current</span> : null}
                  <div className="db-rank-xp">{fmt(rank.min)} XP</div>
                  {achieved ? <span className="db-rank-check">✓</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-title">Badges</div>
          <div className="db-card-sub">
            {earnedBadgeCount} of {badges.length} earned
          </div>
          <div className="db-badges-grid">
            {badges.map((badge) => (
              <div key={badge.id} className={`db-badge-cell${badge.earned ? " earned" : ""}`}>
                <div className="db-badge-icon">{badge.icon}</div>
                <div className="db-badge-name">{badge.name}</div>
                <div className="db-badge-desc">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-title">XP by Module</div>
          <div className="db-card-sub">Your progress across all platform content</div>
          <div className="db-modules">
            {(Object.keys(XP_SOURCE_LABELS) as (keyof typeof XP_SOURCE_LABELS)[]).map((key) => {
              const value = sources[key];
              const max = XP_SOURCE_MAX[key];
              const pct = max ? Math.min((value / max) * 100, 100) : null;
              const fillW = pct ?? Math.min((value / 100) * 10, 100);

              return (
                <div key={key} className="db-mod-row">
                  <div className="db-mod-name">{XP_SOURCE_LABELS[key]}</div>
                  <div className="db-mod-track">
                    <div className="db-mod-fill" style={{ width: `${fillW}%` }} />
                  </div>
                  <div className="db-mod-xp">{fmt(value)} XP</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-title">Recent Activity</div>
          <div className="db-card-sub">
            {activity.length > 0
              ? `${activity.length} active module${activity.length !== 1 ? "s" : ""} · ${fmt(totalXp)} XP total`
              : "Your last interactions on the platform"}
          </div>
          {activity.length === 0 ? (
            <div className="db-empty-state">
              <p className="db-empty-title">No activity yet.</p>
              <p>Complete a lesson, quiz, or article to earn your first XP.</p>
            </div>
          ) : (
            <div className="db-activity">
              {activity.map((item) => (
                <div key={item.time} className="db-act-item">
                  <div className={`db-act-dot ${item.dot}`} />
                  <div
                    className="db-act-text"
                    dangerouslySetInnerHTML={{ __html: item.html }}
                  />
                  <div className="db-act-xp">{item.xp} XP</div>
                  <div className="db-act-time">{item.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="db-card db-grid-full">
          <div className="db-card-title">About XP &amp; Ranks</div>
          <div className="db-card-sub">How your progression is calculated</div>
          <div className="db-rate-grid">
            {XP_EARN_RATES.map((rate) => (
              <div key={rate.label} className="db-rate-cell">
                <div className="db-rate-label">{rate.label}</div>
                <div className="db-rate-xp">{rate.xp} XP</div>
                <div className="db-rate-unit">
                  {rate.unit}
                  {rate.max != null ? ` · max ${fmt(rate.max)} XP` : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="db-scale-notice">
            <p>
              <strong>
                {pinnacleName} ({fmt(PINNACLE_RANK_XP)} XP)
              </strong>{" "}
              is the pinnacle rank and is intentionally aspirational. Today&apos;s platform offers{" "}
              {fmt(MAX_PLATFORM_XP)} XP of content across courses, articles, quizzes, comics, and the
              dictionary. As new content is published, this ceiling grows — ensuring there is always
              something to strive for.
            </p>
          </div>
        </div>
      </div>

      <footer className="db-footer">
        <p>
          <strong>Rewardology Academy</strong> · Your learning dashboard · Progress syncs to your
          account when signed in.
        </p>
      </footer>
    </div>
  );
}
