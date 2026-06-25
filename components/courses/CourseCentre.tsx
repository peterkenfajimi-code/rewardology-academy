"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  COURSES,
  allLessons,
  findLesson,
  type Course,
  type CourseLesson,
  type CourseModule,
  type KnowledgeQuiz,
} from "@/lib/courses/courseData";
import { getLessonQuiz, getModuleQuizQuestions } from "@/lib/courses/quizContent";
import { lessonPlainText } from "@/lib/courses/lessonText";
import { getEssentialById } from "@/lib/articles/essentials";
import { BrowserVoiceBar } from "@/components/tts/BrowserVoiceBar";
import {
  courseXp,
  isCourseComplete,
  lessonKey,
  MAX_COURSE_XP,
  mergeLessonXp,
  nextLessonForCourse,
  readLocalCourseXp,
  totalCourseXp,
  writeLocalCourseXp,
  type LessonXpMap,
} from "@/lib/courses/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { TestimonialPrompt } from "@/components/testimonials/TestimonialPrompt";
import { SourceRatingBadge } from "@/components/testimonials/SourceRatingBadge";
import { useSourceRatings } from "@/components/testimonials/useSourceRatings";
import { getSourceRating } from "@/lib/testimonials/ratings";
import "@/styles/course-centre.css";
import { dispatchXpUpdated } from "@/lib/xp/dispatch";
import { levelFor, rankProgress } from "@/lib/xp/levels";

const LABELS = ["A", "B", "C", "D"];
const RING_CIRCUMFERENCE = 390;

type View = "lobby" | "overview" | "lesson" | "mod-quiz" | "result" | "certificate";

function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

type ResultData = {
  course: Course;
  mod: CourseModule;
  quizLes: CourseLesson;
  quizQuestions: KnowledgeQuiz[];
  answers: boolean[];
  xpEarned: number;
  courseComplete: boolean;
};

export function CourseCentre() {
  const { user } = useAuth();
  const sourceRatings = useSourceRatings();
  const searchParams = useSearchParams();
  const deepLinkHandled = useRef(false);

  const [view, setView] = useState<View>("lobby");
  const [lxp, setLxp] = useState<LessonXpMap>({});
  const [synced, setSynced] = useState(false);
  const [progressReady, setProgressReady] = useState(false);

  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  // Knowledge-check state (lesson view)
  const [kcSel, setKcSel] = useState<number | null>(null);
  const [kcAnswered, setKcAnswered] = useState(false);

  // Module-quiz state
  const [mqLes, setMqLes] = useState<CourseLesson | null>(null);
  const [mqModId, setMqModId] = useState<string | null>(null);
  const [mqQuestions, setMqQuestions] = useState<KnowledgeQuiz[]>([]);
  const [mqQ, setMqQ] = useState(0);
  const [mqSel, setMqSel] = useState<number | null>(null);
  const [mqAnswered, setMqAnswered] = useState(false);
  const [mqAnswers, setMqAnswers] = useState<boolean[]>([]);

  const [result, setResult] = useState<ResultData | null>(null);
  const [arcOffset, setArcOffset] = useState(RING_CIRCUMFERENCE);

  const [confetti, setConfetti] = useState<React.CSSProperties[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [revealOpen, setRevealOpen] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  const totalXP = useMemo(() => totalCourseXp(lxp), [lxp]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (levelFilter !== "All" && c.level !== levelFilter) return false;
      if (!q) return true;
      const hay = [c.title, c.subtitle, c.desc, ...c.outcomes, ...c.modules.map((m) => m.title)]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery, levelFilter]);

  const levelTabs = useMemo(
    () => ["All", ...Array.from(new Set(COURSES.map((c) => c.level)))],
    []
  );

  // Load progress: account first, otherwise this device's cache. Re-runs on login/logout.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/course-centre", { cache: "no-store" });
        const data = (await res.json()) as { authenticated: boolean; lxp: LessonXpMap };
        if (cancelled) return;
        if (data.authenticated) {
          setSynced(true);
          setLxp(data.lxp ?? {});
          writeLocalCourseXp(data.lxp ?? {});
          if (!cancelled) setProgressReady(true);
          return;
        }
      } catch {
        /* fall through to local cache */
      }
      if (!cancelled) {
        setSynced(false);
        setLxp(readLocalCourseXp());
        setProgressReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!progressReady || deepLinkHandled.current) return;
    const courseRaw = searchParams.get("course");
    if (!courseRaw) return;
    const courseId = Number(courseRaw);
    if (!Number.isFinite(courseId)) return;
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;

    deepLinkHandled.current = true;
    const lessonId = searchParams.get("lesson");
    if (lessonId) {
      const found = findLesson(courseId, lessonId);
      if (found) {
        setActiveCourseId(courseId);
        setOpenModules({ [found.mod.id]: true });
        if (found.lesson.type === "quiz" || searchParams.get("view") === "mod-quiz") {
          setMqLes(found.lesson);
          setMqModId(found.mod.id);
          setMqQuestions(getModuleQuizQuestions(found.lesson, found.mod));
          setMqQ(0);
          setMqSel(null);
          setMqAnswered(false);
          setMqAnswers([]);
          setView("mod-quiz");
        } else {
          setActiveLessonId(found.lesson.id);
          setKcSel(null);
          setKcAnswered(false);
          setView("lesson");
        }
        scrollTop();
        return;
      }
    }
    setActiveCourseId(courseId);
    setOpenModules({ [course.modules[0].id]: true });
    setView("overview");
    scrollTop();
  }, [progressReady, searchParams]);

  const activeCourse = useMemo(
    () => COURSES.find((c) => c.id === activeCourseId) ?? null,
    [activeCourseId]
  );

  const activeLesson = useMemo(() => {
    if (!activeCourse || !activeLessonId) return null;
    for (const m of activeCourse.modules) {
      const l = m.lessons.find((x) => x.id === activeLessonId);
      if (l) return { mod: m, lesson: l };
    }
    return null;
  }, [activeCourse, activeLessonId]);

  const scrollTop = () => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const launchConfetti = useCallback((col: string) => {
    const colors = [col, "#C8963E", "#4ADE80", "#60A5FA", "#F9A8D4"];
    const pieces: React.CSSProperties[] = Array.from({ length: 60 }, () => {
      const size = Math.random() * 8 + 4;
      return {
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animationDuration: `${Math.random() * 2 + 1.4}s`,
        animationDelay: `${Math.random() * 0.6}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
    });
    setConfetti(pieces);
    window.setTimeout(() => setConfetti([]), 4000);
  }, []);

  // Persist lesson XP locally + to the account (best result wins).
  const persistXp = useCallback(
    (courseId: number, lessonId: string, xp: number) => {
      const key = lessonKey(courseId, lessonId);
      setLxp((prev) => {
        const next = mergeLessonXp(prev, key, xp);
        writeLocalCourseXp(next);
        dispatchXpUpdated();
        return next;
      });
      if (synced) {
        (async () => {
          try {
            const res = await fetch("/api/course-centre", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ courseId, lessonId, xp }),
            });
            const data = (await res.json()) as { authenticated: boolean; lxp: LessonXpMap };
            if (data.authenticated && data.lxp) {
              setLxp(data.lxp);
              writeLocalCourseXp(data.lxp);
            }
          } catch {
            /* keep local result if sync fails */
          }
        })();
      }
    },
    [synced]
  );

  // ── Navigation ──
  const goLobby = useCallback(() => {
    setView("lobby");
    setActiveCourseId(null);
    setActiveLessonId(null);
    scrollTop();
  }, []);

  const openCourse = useCallback((id: number) => {
    setActiveCourseId(id);
    const course = COURSES.find((c) => c.id === id);
    if (course) setOpenModules({ [course.modules[0].id]: true });
    setView("overview");
    scrollTop();
  }, []);

  const backToOverview = useCallback(() => {
    if (activeCourseId != null) {
      setView("overview");
      scrollTop();
    } else {
      goLobby();
    }
  }, [activeCourseId, goLobby]);

  const startLesson = useCallback(
    (courseId: number, lesson: CourseLesson, mod: CourseModule) => {
      setActiveCourseId(courseId);
      if (lesson.type === "quiz") {
        setMqLes(lesson);
        setMqModId(mod.id);
        setMqQuestions(getModuleQuizQuestions(lesson, mod));
        setMqQ(0);
        setMqSel(null);
        setMqAnswered(false);
        setMqAnswers([]);
        setView("mod-quiz");
        scrollTop();
        return;
      }
      setActiveLessonId(lesson.id);
      setKcSel(null);
      setKcAnswered(false);
      setView("lesson");
      scrollTop();
    },
    []
  );

  // ── Knowledge check ──
  const checkKc = useCallback(() => {
    if (kcSel === null || kcAnswered || !activeCourse || !activeLesson) return;
    const { lesson, mod } = activeLesson;
    const q = getLessonQuiz(lesson);
    if (!q) return;
    setKcAnswered(true);
    const ok = kcSel === q.ans;
    const key = lessonKey(activeCourse.id, lesson.id);
    const already = (lxp[key] || 0) > 0;
    // Award XP on any attempt (correct or not) — matching the HTML prototype's
    // engagement-based model. Correct answers get confetti, wrong answers still complete.
    if (!already) {
      persistXp(activeCourse.id, lesson.id, lesson.xp);
      if (ok) {
        showToast(`⚡ +${lesson.xp} XP earned! Great work.`);
        launchConfetti(mod.color);
      } else {
        showToast(`+${lesson.xp} XP earned. Review the explanation and continue.`);
      }
    }
  }, [kcSel, kcAnswered, activeCourse, activeLesson, lxp, persistXp, showToast, launchConfetti]);

  // ── Module quiz ──
  const submitMq = useCallback(() => {
    if (mqSel === null || mqAnswered || !mqQuestions.length) return;
    setMqAnswered(true);
    const q = mqQuestions[mqQ];
    setMqAnswers((prev) => [...prev, mqSel === q.ans]);
  }, [mqSel, mqAnswered, mqQuestions, mqQ]);

  const finishMq = useCallback(
    (answers: boolean[]) => {
      if (!activeCourse || !mqLes || !mqModId || !mqQuestions.length) return;
      const mod = activeCourse.modules.find((m) => m.id === mqModId);
      if (!mod) return;
      const total = mqQuestions.length;
      const score = answers.filter(Boolean).length;
      const xpEarned = Math.round((score / total) * mqLes.xp);

      const key = lessonKey(activeCourse.id, mqLes.id);
      const nextMap = mergeLessonXp(lxp, key, xpEarned);
      const courseComplete = isCourseComplete(nextMap, activeCourse);

      if (xpEarned > (lxp[key] || 0)) {
        persistXp(activeCourse.id, mqLes.id, xpEarned);
      }

      setResult({
        course: activeCourse,
        mod,
        quizLes: mqLes,
        quizQuestions: mqQuestions,
        answers,
        xpEarned,
        courseComplete,
      });
      setArcOffset(RING_CIRCUMFERENCE);
      setView("result");
      scrollTop();

      window.setTimeout(() => {
        setArcOffset(RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * (score / total));
      }, 120);

      const pct = Math.round((score / total) * 100);
      if (courseComplete ? pct >= 60 : pct >= 80) launchConfetti(mod.color);
    },
    [activeCourse, mqLes, mqModId, mqQuestions, lxp, persistXp, launchConfetti]
  );

  const nextMq = useCallback(() => {
    if (!mqQuestions.length) return;
    const isLast = mqQ >= mqQuestions.length - 1;
    if (isLast) {
      finishMq(mqAnswers);
      return;
    }
    setMqQ((q) => q + 1);
    setMqSel(null);
    setMqAnswered(false);
  }, [mqQuestions, mqQ, mqAnswers, finishMq]);

  const retryMq = useCallback(() => {
    if (!result) return;
    startLesson(result.course.id, result.quizLes, result.mod);
  }, [result, startLesson]);

  const showCertificate = useCallback(() => {
    setView("certificate");
    scrollTop();
    if (result) launchConfetti(result.course.color);
  }, [result, launchConfetti]);

  const displayName = useMemo(() => {
    const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
    return (
      meta.full_name || meta.name || user?.email?.split("@")[0] || "HR Professional"
    );
  }, [user]);

  // ── Reset all progress ──
  function resetProgress() {
    if (!window.confirm("Reset all course progress and XP? This cannot be undone.")) return;
    setLxp({});
    writeLocalCourseXp({});
    // Also wipe server-side progress
    if (user) {
      fetch("/api/course-centre", { method: "DELETE" }).catch(() => {});
    }
    showToast("Progress reset. Starting fresh!");
    setView("lobby");
  }

  // ── Render: Lobby ──
  function renderLobby() {
    const { current: rank, next: nextRank } = levelFor(totalXP);
    const rankPct = Math.round(rankProgress(totalXP) * 100);
    const xpToNext = nextRank ? nextRank.min - totalXP : 0;
    return (
      <div className="cc-view">
        <div className="cc-lobby-hero">
          <div className="cc-lh-mesh" />
          <div className="cc-lh-grid" />
          <div className="cc-lh-inner">
            <div>
              <div className="cc-lh-eyebrow">Rewardology Academy</div>
              <h1 className="cc-lh-h1 cc-serif">
                Learn
                <br />
                <em>Total Rewards</em>
                <br />
                Like a Pro.
              </h1>
              <p className="cc-lh-desc">
                Structured beginner courses in compensation, benefits, salary structures, and market
                pricing. Earn XP as you learn — and build the expertise that sets great HR
                professionals apart.
              </p>
              <div className="cc-lh-stats">
                <div>
                  <div className="cc-lhs-n cc-serif">
                    {COURSES.filter((c) => courseXp(lxp, c.id) > 0).length}
                    <span>/{COURSES.length}</span>
                  </div>
                  <div className="cc-lhs-l">Courses started</div>
                </div>
                <div>
                  <div className="cc-lhs-n cc-serif">
                    {COURSES.filter((c) => isCourseComplete(lxp, c)).length}
                  </div>
                  <div className="cc-lhs-l">Certificates earned</div>
                </div>
                <div>
                  <div className="cc-lhs-n cc-serif">{totalXP.toLocaleString()}</div>
                  <div className="cc-lhs-l">{synced ? "XP · synced" : "XP earned"}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="cc-lh-card">
                <div className="cc-lhc-top">
                  <div className="cc-lhc-l">Your rank</div>
                  <div className="cc-lhc-xp cc-serif">{rank.name}</div>
                  <div className="cc-lhc-sub">{totalXP.toLocaleString()} XP earned</div>
                </div>
                <div className="cc-lhc-body">
                  <div className="cc-xp-bar-row">
                    <span>
                      {nextRank
                        ? `${xpToNext.toLocaleString()} XP to ${nextRank.name}`
                        : "Top rank reached"}
                    </span>
                    <span>{rankPct}%</span>
                  </div>
                  <div className="cc-xp-bar">
                    <div className="cc-xp-bar-f" style={{ width: `${rankPct}%` }} />
                  </div>
                  <div className="cc-pills">
                    {COURSES.map((c) => {
                      const earned = courseXp(lxp, c.id);
                      const pct = Math.min(100, Math.round((earned / c.total_xp) * 100));
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className="cc-pill"
                          onClick={() => openCourse(c.id)}
                        >
                          <span className="cc-pill-dot" style={{ background: c.color }} />
                          <span className="cc-pill-name">
                            <span style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>{c.title}</span>
                              <span className="cc-pill-xp">{pct}%</span>
                            </span>
                            <div className="cc-pill-bar">
                              <div
                                className="cc-pill-barf"
                                style={{ width: `${pct}%`, background: c.color }}
                              />
                            </div>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cc-courses-sec">
          <div className="cc-lobby-toolbar">
            <input
              className="cc-lobby-search"
              placeholder="🔍 Search courses and topics…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="cc-level-tabs">
              {levelTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`cc-ltab${levelFilter === tab ? " active" : ""}`}
                  onClick={() => setLevelFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="cc-cs-hd">
            <div className="cc-cs-title cc-serif">Available Courses</div>
            <div className="cc-cs-sub">
              {filteredCourses.length === COURSES.length
                ? "Click any course to begin"
                : `${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"} matched`}
            </div>
          </div>
          <div className="cc-courses-grid">
            {filteredCourses.map((c, i) => {
              const earned = courseXp(lxp, c.id);
              const pct = Math.min(100, Math.round((earned / c.total_xp) * 100));
              const done = isCourseComplete(lxp, c);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="cc-card"
                  style={{ ["--cc" as string]: c.color }}
                  onClick={() => openCourse(c.id)}
                >
                  <div
                    className="cc-banner"
                    style={{
                      background: `linear-gradient(135deg, ${hexToRgba(c.color, 0.13)} 0%, ${hexToRgba(c.color, 0.04)} 100%)`,
                    }}
                  >
                    <div className="cc-bg" />
                    <div className="cc-n-big cc-serif" style={{ fontSize: 46, fontWeight: 700, color: "rgba(255,255,255,.1)", position: "absolute", bottom: -4, left: 16, lineHeight: 1 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span
                      className="cc-lv"
                      style={{
                        background: hexToRgba(c.color, 0.18),
                        color: c.color,
                        border: `1px solid ${hexToRgba(c.color, 0.35)}`,
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {c.level}
                    </span>
                    {done && (
                      <span className="cc-badge" style={{ color: "#4ADE80", position: "relative", zIndex: 1 }}>
                        ✓ Complete
                      </span>
                    )}
                  </div>
                  <div className="cc-body">
                    <div className="cc-card-title cc-serif">{c.title}</div>
                    <div className="cc-desc-txt">{c.subtitle}</div>
                    <div className="cc-prog-l">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="cc-prog-bar">
                      <div className="cc-prog-f" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                    <div className="cc-foot">
                      <span className="cc-out">
                        <span>⏱ {c.duration}</span>
                        <span>📚 {c.lessons_count} lessons</span>
                      </span>
                      {done ? (
                        <span className="cc-cert-done">✓ Certificate ready</span>
                      ) : (
                        <span className="cc-xp-val" style={{ color: c.color }}>⚡ {c.total_xp} XP</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Overview ──
  function renderOverview() {
    const c = activeCourse;
    if (!c) return null;
    const earned = courseXp(lxp, c.id);
    const pct = Math.min(100, Math.round((earned / c.total_xp) * 100));
    const complete = isCourseComplete(lxp, c);
    const statusLabel = complete ? "Completed" : earned > 0 ? "In progress" : "Not started";
    return (
      <div className="cc-view" style={{ ["--cc" as string]: c.color }}>
        <div className="cc-cv-layout">
          {/* ── Left column ── */}
          <div>
            {/* Hero card */}
            <div className="cc-cv-hero">
              <div
                className="cc-cvh-top"
                style={{ background: `linear-gradient(135deg, ${hexToRgba(c.color, 0.15)}, rgba(7,25,46,0.3))` }}
              >
                <div className="cc-cvh-mesh"
                  style={{ background: `radial-gradient(ellipse 60% 50% at 70% 30%, ${hexToRgba(c.color, 0.22)}, transparent)` }}
                />
                <button type="button" className="cc-back" style={{ marginBottom: 16, position: "relative" }} onClick={goLobby}>
                  ← All Courses
                </button>
                <div className="cc-cvh-eyebrow" style={{ color: c.color }}>
                  Course {c.id}
                </div>
                <h1 className="cc-cvh-title cc-serif">{c.title}</h1>
                <p className="cc-cvh-sub">{c.subtitle}</p>
                <div className="cc-cvh-info">
                  <span className="cc-cvh-badge">🎓 {c.level}</span>
                  <span className="cc-cvh-badge">⏱ {c.duration}</span>
                  <span className="cc-cvh-badge">📚 {c.lessons_count} lessons</span>
                  <span className="cc-cvh-badge" style={{ color: c.color }}>⚡ {c.total_xp} XP</span>
                </div>
              </div>
              <div className="cc-cvh-body">
                <div className="cc-cv-out-lbl">What you&apos;ll learn</div>
                {c.outcomes.map((o) => (
                  <div key={o} className="cc-cv-out-item">
                    <span style={{ color: c.color, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Module accordion */}
            {c.modules.map((m) => renderModuleBlock(c, m))}
          </div>

          {/* ── Right column (sidebar) ── */}
          <div>
            <div className="cc-cvs-card">
              <div className="cc-cvs-label">Your Progress</div>
              <div className="cc-cvs-stat">
                <span>Status</span>
                <span className="cc-cvs-stat-val">{statusLabel}</span>
              </div>
              <div className="cc-cvs-stat">
                <span>Earned XP</span>
                <span className="cc-cvs-stat-val">{earned} / {c.total_xp} XP</span>
              </div>
              <div className="cc-cvs-stat">
                <span>Completion</span>
                <span className="cc-cvs-stat-val">{pct}%</span>
              </div>
              <div className="cc-cvs-stat">
                <span>Duration</span>
                <span className="cc-cvs-stat-val">{c.duration}</span>
              </div>
              <button
                type="button"
                className="cc-cvs-cta"
                style={{ background: c.color, color: c.bg }}
                onClick={() => {
                  const next = nextLessonForCourse(lxp, c);
                  if (next) startLesson(c.id, next.lesson, next.mod);
                }}
              >
                {earned > 0 ? "Continue →" : "Start Course →"}
              </button>
              {complete && (
                <button
                  type="button"
                  className="cc-cvs-cert-btn"
                  onClick={() => { setView("certificate"); scrollTop(); }}
                >
                  🎓 View Certificate
                </button>
              )}
            </div>
            <SourceRatingBadge
              rating={getSourceRating(sourceRatings, "course", c.id)}
              accentColor={c.color}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderModuleBlock(c: Course, m: CourseModule) {
    const open = !!openModules[m.id];
    const doneCount = m.lessons.filter((l) => (lxp[lessonKey(c.id, l.id)] || 0) > 0).length;
    const lessonCount = m.lessons.filter((l) => l.type === "lesson").length;
    const lessonsDone = m.lessons.filter(
      (l) => l.type === "lesson" && (lxp[lessonKey(c.id, l.id)] || 0) > 0
    ).length;
    return (
      <div key={m.id} className={`cc-mod-block${open ? " open" : ""}`}>
        <div
          className="cc-mod-hd"
          onClick={() => setOpenModules((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
        >
          <div
            className="cc-mod-ico cc-serif"
            style={{ background: hexToRgba(m.color, 0.15), color: m.color }}
          >
            {c.modules.indexOf(m) + 1}
          </div>
          <div className="cc-mod-ttl">{m.title}</div>
          <div className="cc-mod-meta">
            {doneCount}/{m.lessons.length} done
          </div>
          <div className="cc-mod-chev">›</div>
        </div>
        {open && (
          <div className="cc-les-list">
            {m.lessons.map((l) => {
              const done = (lxp[lessonKey(c.id, l.id)] || 0) > 0;
              const isQ = l.type === "quiz";
              const locked = isQ && lessonsDone < lessonCount;
              return (
                <div
                  key={l.id}
                  className={`cc-les-row${locked ? " locked" : ""}`}
                  onClick={() => {
                    if (!locked) startLesson(c.id, l, m);
                  }}
                >
                  <div
                    className="cc-les-ico"
                    style={{ background: hexToRgba(m.color, 0.15), color: m.color }}
                  >
                    {isQ ? "🎯" : "📖"}
                  </div>
                  <div className="cc-les-name">{l.title}</div>
                  <span
                    className="cc-les-typ"
                    style={{ background: hexToRgba(m.color, 0.12), color: m.color }}
                  >
                    {isQ ? "Quiz" : "Lesson"}
                  </span>
                  <span className="cc-les-dur">{l.duration}</span>
                  <span className="cc-les-xp" style={{ color: m.color }}>
                    ⚡{l.xp}
                  </span>
                  <span className="cc-les-st">{locked ? "🔒" : done ? "✓" : ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Render: Lesson ──
  function renderLesson() {
    const c = activeCourse;
    if (!c || !activeLesson) return null;
    const { mod: m, lesson: l } = activeLesson;
    const all = allLessons(c);
    const idx = all.findIndex((x) => x.lesson.id === l.id);
    const prev = idx > 0 ? all[idx - 1] : null;
    const next = idx < all.length - 1 ? all[idx + 1] : null;
    const doneAll = all.filter((x) => (lxp[lessonKey(c.id, x.lesson.id)] || 0) > 0).length;
    const lessonPct = Math.round((doneAll / all.length) * 100);
    // Only show KC if the lesson has an explicit quiz in the data (no auto-generated ones)
    const q = l.quiz ? getLessonQuiz(l) : null;
    const alreadyDone = (lxp[lessonKey(c.id, l.id)] || 0) > 0;

    return (
      <div className="cc-view" style={{ ["--cc" as string]: m.color }}>
        <div className="cc-les-topbar">
          <button type="button" className="cc-ltb-back" onClick={backToOverview}>
            ← Course
          </button>
          <div className="cc-ltb-ttl">{l.title}</div>
          <div className="cc-ltb-xp">⚡ {l.xp} XP</div>
        </div>
        <div className="cc-les-prog">
          <div className="cc-les-prog-f" style={{ width: `${lessonPct}%`, background: m.color }} />
        </div>
        <div className="cc-les-layout">
          <div className="cc-les-sb">
            {c.modules.map((mm) => (
              <div key={mm.id}>
                <div className="cc-sb-lbl" style={{ color: mm.color }}>
                  {mm.title}
                </div>
                {mm.lessons.map((ll) => {
                  const done = (lxp[lessonKey(c.id, ll.id)] || 0) > 0;
                  const active = ll.id === l.id;
                  return (
                    <div
                      key={ll.id}
                      className={`cc-sb-item${active ? " active" : ""}`}
                      onClick={() => startLesson(c.id, ll, mm)}
                    >
                      <span
                        className="cc-sb-dot"
                        style={{ background: done ? mm.color : "rgba(255,255,255,.2)" }}
                      />
                      <span style={{ flex: 1 }}>{ll.title}</span>
                      {done && <span style={{ fontSize: 11, color: "#4ADE80" }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div>
            <div className="cc-les-content">
              <div className="cc-lc-ey" style={{ color: m.color }}>
                <span style={{ width: 18, height: 1, background: m.color, display: "inline-block" }} />
                {m.title}
              </div>
              <h1 className="cc-lc-ttl cc-serif">{l.title}</h1>
              <div className="cc-lc-met">
                <span>⏱ {l.duration}</span>
                <span>⚡ {l.xp} XP</span>
                <span style={{ color: m.color }}>{c.level}</span>
              </div>

              <BrowserVoiceBar
                text={lessonPlainText(l)}
                title="Listen to lesson"
                className="cc-voice-bar q-voice-bar"
              />

              {typeof l.article === "number" && (() => {
                const article = getEssentialById(l.article);
                if (!article) return null;
                return (
                  <Link
                    href={`/articles/${article.slug}`}
                    className="cc-art-cta"
                    style={{ borderColor: hexToRgba(article.color, 0.35) }}
                  >
                    <span className="cc-art-cta-icon">📖</span>
                    <span>
                      <span className="cc-art-cta-label">Related article</span>
                      <span className="cc-art-cta-title">{article.title}</span>
                    </span>
                    <span className="cc-art-cta-arrow">→</span>
                  </Link>
                );
              })()}

              {l.objectives && (
                <div className="cc-obj-box">
                  <div className="cc-obj-lbl">Learning Objectives</div>
                  {l.objectives.map((o) => (
                    <div key={o} className="cc-obj-item">
                      <span
                        style={{ color: m.color, flexShrink: 0, marginTop: 2, fontSize: 11 }}
                      >
                        →
                      </span>
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* All blocks except takeaways — KC section is inserted before takeaways */}
              {(l.body ?? []).filter((b) => b.t !== "takeaways").map((b, bi) => {
                if (b.t === "intro")
                  return (
                    <div
                      key={bi}
                      className="cc-lc-intro cc-serif"
                      style={{ ["--cc" as string]: m.color }}
                      dangerouslySetInnerHTML={{ __html: b.v as string }}
                    />
                  );
                if (b.t === "h")
                  return (
                    <h2
                      key={bi}
                      className="cc-lc-h cc-serif"
                      dangerouslySetInnerHTML={{ __html: b.v as string }}
                    />
                  );
                if (b.t === "p")
                  return (
                    <p
                      key={bi}
                      className="cc-lc-p"
                      dangerouslySetInnerHTML={{ __html: b.v as string }}
                    />
                  );
                if (b.t === "box")
                  return (
                    <div
                      key={bi}
                      className="cc-lc-box"
                      style={{ borderColor: m.color, background: hexToRgba(m.color, 0.06) }}
                    >
                      <div className="cc-lc-box-lbl" style={{ color: m.color }}>
                        {b.label}
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: b.v as string }} />
                    </div>
                  );
                if (b.t === "scenario")
                  return (
                    <div key={bi} className="cc-lc-scenario">
                      <div className="cc-lc-sc-lbl">
                        📋 {b.label ?? (b.org ? `Scenario · ${b.org}` : "Scenario")}
                      </div>
                      <div className="cc-lc-sc-ttl cc-serif">{b.title}</div>
                      <div
                        className="cc-lc-sc-text"
                        dangerouslySetInnerHTML={{ __html: b.v as string }}
                      />
                    </div>
                  );
                if (b.t === "quiz_intro")
                  return (
                    <div
                      key={bi}
                      className="cc-lc-intro cc-serif"
                      style={{ ["--cc" as string]: m.color }}
                      dangerouslySetInnerHTML={{ __html: b.v as string }}
                    />
                  );
                if (b.t === "takeaways")
                  return (
                    <div
                      key={bi}
                      className="cc-lc-tk"
                      style={{ background: hexToRgba(m.color, 0.07), borderColor: hexToRgba(m.color, 0.3) }}
                    >
                      <div className="cc-lc-tk-lbl" style={{ color: m.color }}>
                        Key Takeaways
                      </div>
                      {(b.items ?? (b.v as string[] | undefined) ?? []).map((tk, ti) => (
                        <div key={ti} className="cc-lc-tk-item">
                          <span style={{ color: m.color, flexShrink: 0 }}>→</span>
                          <span>{tk}</span>
                        </div>
                      ))}
                    </div>
                  );
                if (b.t === "reveal") {
                  const rKey = `${l.id}-${bi}`;
                  const open = !!revealOpen[rKey];
                  return (
                    <div key={bi} className="cc-lc-reveal">
                      <button
                        type="button"
                        className={`cc-lc-reveal-btn${open ? " open" : ""}`}
                        style={{ borderColor: m.color, color: m.color }}
                        onClick={() =>
                          setRevealOpen((prev) => ({ ...prev, [rKey]: !prev[rKey] }))
                        }
                      >
                        <span>{open ? "Hide" : (b.label ?? "See the answer")}</span>
                        <span className="cc-lc-reveal-ico">{open ? "▲" : "▼"}</span>
                      </button>
                      {open && (
                        <div
                          className="cc-lc-reveal-body"
                          style={{ borderColor: hexToRgba(m.color, 0.3), background: hexToRgba(m.color, 0.06) }}
                          dangerouslySetInnerHTML={{ __html: b.v as string }}
                        />
                      )}
                    </div>
                  );
                }
                return null;
              })}

              {q && (
                <div className="cc-kc">
                  <div className="cc-kc-hd">
                    <div className="cc-kc-hd-eyebrow">Check Your Understanding</div>
                  </div>
                  <div className="cc-kc-body">
                    <div className="cc-kc-q">{q.q}</div>
                    <div className="cc-kc-opts">
                      {q.opts.map((o, i) => {
                        const answered = alreadyDone || kcAnswered;
                        const isCorrect = answered && i === q.ans;
                        const isWrong = answered && i === kcSel && kcSel !== q.ans;
                        let cls = "cc-kc-opt";
                        if (answered) {
                          cls += " locked";
                          if (isCorrect) cls += " ok";
                          else if (isWrong) cls += " no";
                        } else if (i === kcSel) {
                          cls += " sel";
                        }
                        return (
                          <div
                            key={i}
                            className={cls}
                            onClick={() => {
                              if (!alreadyDone && !kcAnswered) setKcSel(i);
                            }}
                          >
                            <div className="cc-kc-opt-row">
                              <span className="cc-kc-bull">{LABELS[i]}</span>
                              <span>{o}</span>
                            </div>
                            {isWrong && (
                              <div className="cc-kc-inline-exp">
                                {q.exp}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="cc-kc-act">
                      {alreadyDone || (kcAnswered && (lxp[lessonKey(activeCourseId!, l.id)] || 0) > 0) ? (
                        <div className="cc-kc-xp-msg">✓ XP earned for this lesson</div>
                      ) : (
                        <>
                          <span />
                          <button
                            type="button"
                            className="cc-btn-check"
                            disabled={kcSel === null}
                            onClick={checkKc}
                          >
                            Check Answer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Key takeaways — rendered after the KC section (matches prototype order) */}
              {(l.body ?? []).filter((b) => b.t === "takeaways").map((b, bi) => (
                <div
                  key={`tk-${bi}`}
                  className="cc-lc-tk"
                  style={{ background: hexToRgba(m.color, 0.07), borderColor: hexToRgba(m.color, 0.3) }}
                >
                  <div className="cc-lc-tk-lbl" style={{ color: m.color }}>
                    Key Takeaways
                  </div>
                  {(b.items ?? (b.v as string[] | undefined) ?? []).map((tk, ti) => (
                    <div key={ti} className="cc-lc-tk-item">
                      <span style={{ color: m.color, flexShrink: 0 }}>→</span>
                      <span>{tk}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* No-quiz lessons: "Mark complete" button awards XP */}
              {!q && !alreadyDone && (
                <button
                  type="button"
                  className="cc-mark-done-btn"
                  style={{ borderColor: m.color, color: m.color }}
                  onClick={() => {
                    persistXp(c.id, l.id, l.xp);
                    showToast(`⚡ +${l.xp} XP earned!`);
                    launchConfetti(m.color);
                  }}
                >
                  ✓ Mark complete — +{l.xp} XP
                </button>
              )}

              {/* Lesson complete XP banner — shows once XP is earned */}
              {(alreadyDone || (kcAnswered && (lxp[lessonKey(activeCourseId!, l.id)] || 0) > 0)) && (
                <div className="cc-xp-banner" style={{ borderColor: hexToRgba(m.color, 0.4), background: hexToRgba(m.color, 0.08) }}>
                  <span className="cc-xp-banner-ico">⚡</span>
                  <div>
                    <div className="cc-xp-banner-title" style={{ color: m.color }}>Lesson complete</div>
                    <div className="cc-xp-banner-sub">+{l.xp} XP added to your total.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="cc-les-foot">
              {prev ? (
                <button
                  type="button"
                  className="cc-lf-btn"
                  onClick={() => startLesson(c.id, prev.lesson, prev.mod)}
                >
                  <span className="cc-lf-dir">← Previous</span>
                  <span className="cc-lf-name cc-serif">{prev.lesson.title}</span>
                </button>
              ) : (
                <div />
              )}
              {next && (
                <button
                  type="button"
                  className="cc-lf-btn next"
                  onClick={() => {
                    if (!alreadyDone && q && !kcAnswered) {
                      showToast("Answer the knowledge check to earn XP before continuing.");
                      return;
                    }
                    startLesson(c.id, next.lesson, next.mod);
                  }}
                >
                  <span className="cc-lf-dir">Next →</span>
                  <span className="cc-lf-name cc-serif">{next.lesson.title}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Module Quiz ──
  function renderModQuiz() {
    const c = activeCourse;
    if (!c || !mqLes || !mqModId) return null;
    const mod = c.modules.find((m) => m.id === mqModId);
    if (!mod) return null;
    const qs =
      mqQuestions.length > 0 ? mqQuestions : getModuleQuizQuestions(mqLes, mod);
    if (!qs.length) {
      return (
        <div className="cc-view">
          <div className="cc-mq-inner">
            <p className="cc-lc-p">This module quiz could not be loaded. Please go back and try again.</p>
            <button type="button" className="cc-ltb-back" onClick={backToOverview}>
              ← Back to course
            </button>
          </div>
        </div>
      );
    }
    const q = qs[mqQ];
    const pct = Math.round((mqQ / qs.length) * 100);
    const correct = mqAnswers.filter(Boolean).length;
    const perQ = Math.round(mqLes.xp / qs.length);
    const isLast = mqQ >= qs.length - 1;

    return (
      <div className="cc-view" style={{ ["--cc" as string]: mod.color }}>
        <div className="cc-mq-inner">
          <div className="cc-mq-top">
            <button type="button" className="cc-ltb-back" onClick={backToOverview}>
              ← Exit Quiz
            </button>
            <div className="cc-mq-lbl" style={{ color: mod.color }}>
              {mod.title} Quiz
            </div>
            <div className="cc-mq-xp">⚡ {correct * perQ} XP</div>
          </div>
          <div className="cc-mq-prog-wrap">
            <div className="cc-mq-prog-f" style={{ width: `${pct}%`, background: mod.color }} />
          </div>
          <div className="cc-mq-prog-lbls">
            <span>
              Q {mqQ + 1} of {qs.length}
            </span>
            <span>{correct} correct</span>
          </div>

          <BrowserVoiceBar
            key={`mq-${mqQ}-${mqAnswered}`}
            text={
              mqAnswered
                ? `${q.q}. ${mqSel === q.ans ? "Correct." : "Incorrect."} ${q.exp}`
                : q.q
            }
            title={mqAnswered ? "Listen to explanation" : "Listen to question"}
            className="cc-voice-bar q-voice-bar"
          />

          <div className="cc-mq-card" key={mqQ}>
            <div className="cc-mq-step" style={{ color: mod.color }}>
              <span style={{ width: 16, height: 1, background: mod.color, display: "inline-block" }} />
              Question {mqQ + 1}
            </div>
            <div className="cc-mq-q cc-serif">{q.q}</div>
          </div>

          <div className="cc-mq-opts">
            {q.opts.map((o, i) => {
              let cls = "cc-mq-opt";
              if (mqAnswered) {
                cls += " locked";
                if (i === q.ans) cls += " ok";
                else if (i === mqSel && mqSel !== q.ans) cls += " no";
              } else if (i === mqSel) {
                cls += " sel";
              }
              return (
                <div
                  key={i}
                  className={cls}
                  onClick={() => {
                    if (!mqAnswered) setMqSel(i);
                  }}
                >
                  <span className="cc-mq-bull">{LABELS[i]}</span>
                  {o}
                </div>
              );
            })}
          </div>

          {mqAnswered && (
            <div className={`cc-mq-exp ${mqSel === q.ans ? "ok-exp" : "no-exp"}`}>
              <div className="cc-mq-exp-lbl">{mqSel === q.ans ? "✓ Correct!" : "✗ Incorrect"}</div>
              <span>{q.exp}</span>
            </div>
          )}

          <div className="cc-mq-acts">
            {!mqAnswered ? (
              <button
                type="button"
                className="cc-btn-mq"
                style={{ background: mod.color, color: c.bg }}
                disabled={mqSel === null}
                onClick={submitMq}
              >
                Submit Answer
              </button>
            ) : (
              <button type="button" className="cc-btn-mq cc-btn-mq-next" onClick={nextMq}>
                {isLast ? "See Results →" : "Next Question →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Quiz Result ──
  function renderResult() {
    if (!result) return null;
    const { course: c, mod: m, quizQuestions, answers, xpEarned, courseComplete } = result;
    const total = quizQuestions.length;
    const score = answers.filter(Boolean).length;
    const pct = total ? Math.round((score / total) * 100) : 0;

    const titles = ["Module Complete", "Excellent Work", "Perfect Score!"];
    const subs = [
      "Review the lesson content and try again to improve.",
      "Strong performance. A few questions to review below.",
      "Outstanding — you have mastered this module!",
    ];
    const ti = pct === 100 ? 2 : pct >= 60 ? 1 : 0;
    const titleParts = titles[ti].split(" ");

    return (
      <div className="cc-view" style={{ ["--cc" as string]: m.color }}>
        <div className="cc-qr-inner">
          <div className="cc-qr-ring">
            <svg viewBox="0 0 148 148" fill="none">
              <circle cx="74" cy="74" r="62" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
              <circle
                cx="74"
                cy="74"
                r="62"
                stroke={m.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={arcOffset}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1) .3s" }}
              />
            </svg>
            <div className="cc-qr-sc cc-serif">
              {score}/{total}
            </div>
            <div className="cc-qr-sc-lbl">correct</div>
          </div>

          <h2 className="cc-qr-title cc-serif">
            {titleParts.slice(0, -1).join(" ")} <em>{titleParts.slice(-1)}</em>
          </h2>
          <p className="cc-qr-sub">{subs[ti]}</p>
          <div
            className="cc-qr-xp-badge"
            style={{
              background: hexToRgba(m.color, 0.12),
              border: `1px solid ${hexToRgba(m.color, 0.4)}`,
              color: m.color,
            }}
          >
            ⚡ +{xpEarned} XP earned
          </div>

          <div className="cc-qr-bd">
            <div className="cc-qr-bd-title">Question Breakdown</div>
            {quizQuestions.map((qq, i) => (
              <div key={i} className="cc-qr-item">
                <div
                  className="cc-qr-dot"
                  style={{ background: answers[i] ? "#4ADE80" : "#F87171" }}
                />
                <div className="cc-qr-q">{qq.q}</div>
                <div className="cc-qr-res">{answers[i] ? "✓" : "✗"}</div>
              </div>
            ))}
          </div>

          <div className="cc-qr-acts">
            <button type="button" className="cc-btn-qr cc-btn-qr-ghost" onClick={retryMq}>
              ↺ Retry Quiz
            </button>
            <button
              type="button"
              className="cc-btn-qr cc-btn-qr-primary"
              style={{ background: m.color, color: c.bg }}
              onClick={courseComplete ? showCertificate : backToOverview}
            >
              {courseComplete ? "🎓 Get Certificate →" : "Continue Course →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Certificate ──
  function renderCertificate() {
    const c = result?.course ?? activeCourse;
    if (!c) return null;
    const earned = courseXp(lxp, c.id);
    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const certId = `RA-${c.id}-${Date.now().toString(36).toUpperCase()}`;

    return (
      <div className="cc-view">
        <div className="cc-cert-outer">
          <div className="cc-cert-actions">
            <button type="button" className="cc-btn-qr cc-btn-qr-ghost" onClick={goLobby}>
              ← All Courses
            </button>
            <button
              type="button"
              className="cc-btn-qr cc-btn-qr-primary"
              style={{ background: c.color, color: c.bg }}
              onClick={() => window.print()}
            >
              ⬇ Save Certificate
            </button>
          </div>

          <div className="cc-cert-card">
            <div className="cc-cert-inner-border" />
            <div
              className="cc-cert-top-bar"
              style={{ background: `linear-gradient(90deg, var(--teal), ${c.color}, var(--teal))` }}
            />
            <div className="cc-cert-inner">
              <div className="cc-cert-logo-row">
                <div className="cc-cert-mark">R</div>
                <span className="cc-cert-brand cc-serif">Rewardology Academy</span>
              </div>

              <div className="cc-cert-eyebrow">Certificate of Completion</div>
              <div className="cc-cert-title cc-serif">This certificate is awarded to</div>

              <div className="cc-cert-to">LEARNER</div>
              <div className="cc-cert-name cc-serif">{displayName}</div>

              <p className="cc-cert-statement">
                who has successfully completed{" "}
                <strong>{c.title}</strong> — {c.subtitle} — demonstrating
                mastery of the core concepts and practitioner skills in Total Rewards.
              </p>

              <div
                className="cc-cert-xp-badge"
                style={{
                  background: hexToRgba(c.color, 0.12),
                  border: `1px solid ${hexToRgba(c.color, 0.35)}`,
                  color: c.color,
                }}
              >
                ⚡ {earned} XP Earned
              </div>

              <div className="cc-cert-footer">
                <div className="cc-cert-sig-block">
                  <div className="cc-cert-sig cc-serif">Rewardology Academy</div>
                  <div className="cc-cert-sig-lbl">Total Rewards Learning Platform</div>
                </div>
                <div className="cc-cert-meta-block">
                  <div className="cc-cert-date-val">{dateStr}</div>
                  <div className="cc-cert-id-val">{certId}</div>
                </div>
              </div>
            </div>
          </div>

          <TestimonialPrompt
            enabled={Boolean(result?.courseComplete)}
            sourceType="course"
            sourceId={String(c.id)}
            sourceLabel={c.title}
            accentColor={c.color}
          />
        </div>
      </div>
    );
  }

  const breadcrumb = (() => {
    if (view === "lobby") return null;
    const parts: { label: string; action?: () => void }[] = [{ label: "Courses", action: goLobby }];
    if (activeCourse) {
      parts.push({
        label: activeCourse.title,
        action: view === "overview" ? undefined : backToOverview,
      });
    }
    if (view === "lesson" && activeLesson) {
      parts.push({ label: activeLesson.lesson.title });
    } else if (view === "mod-quiz" && mqLes) {
      parts.push({ label: mqLes.title });
    } else if (view === "certificate" && activeCourse) {
      parts.push({ label: "Certificate" });
    }
    return parts;
  })();

  return (
    <div className="cc-root">
      <div className="cc-topbar">
        <div className="cc-topbar-left">
          <span className="cc-xp-pill">
            <span className="cc-xp-bolt">⚡</span>
            {totalXP.toLocaleString()} XP Total
          </span>
          <span className="cc-sync">{synced ? "Synced to your account" : "Saved on this device"}</span>
        </div>
        {view !== "lobby" && (
          <button type="button" className="cc-nav-btn" onClick={goLobby}>
            ← All Courses
          </button>
        )}
        {view === "lobby" && (
          <button type="button" className="cc-reset-btn" onClick={resetProgress}>
            Reset progress
          </button>
        )}
      </div>

      {breadcrumb && (
        <div className="cc-breadcrumb show">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="cc-bc-wrap">
              {i > 0 && <span className="cc-bc-sep">/</span>}
              {crumb.action ? (
                <button type="button" className="cc-bc-item" onClick={crumb.action}>
                  {crumb.label}
                </button>
              ) : (
                <span className="cc-bc-active">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {view === "lobby" && renderLobby()}
      {view === "overview" && renderOverview()}
      {view === "lesson" && renderLesson()}
      {view === "mod-quiz" && renderModQuiz()}
      {view === "result" && renderResult()}
      {view === "certificate" && renderCertificate()}

      {confetti.length > 0 && (
        <div className="cc-confetti-w">
          {confetti.map((style, i) => (
            <span key={i} className="cc-cf-p" style={style} />
          ))}
        </div>
      )}
      {toast && <div className="cc-toast show">{toast}</div>}
    </div>
  );
}
