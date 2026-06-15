"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUIZ_CENTRE, type QuizCentreQuiz } from "@/lib/quizzes/quizCentre";
import {
  mergeResult,
  readLocalProgress,
  totalXpFromMap,
  writeLocalProgress,
  type ProgressMap,
} from "@/lib/quizzes/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrowserVoiceBar } from "@/components/tts/BrowserVoiceBar";
import { dispatchXpUpdated } from "@/lib/xp/dispatch";
import "@/styles/quiz-centre.css";

const LABELS = ["A", "B", "C", "D"];
const RING_CIRCUMFERENCE = 427;
const QUIZ_CERT_NAME_KEY = "ra_quiz_name";

type View = "lobby" | "runner" | "results" | "certificate";

function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function QuizCentre() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("lobby");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [completed, setCompleted] = useState<ProgressMap>({});
  const [synced, setSynced] = useState(false);
  const [lastXp, setLastXp] = useState(0);
  const [arcOffset, setArcOffset] = useState(RING_CIRCUMFERENCE);
  const [confetti, setConfetti] = useState<React.CSSProperties[]>([]);
  const [certAllDone, setCertAllDone] = useState(false);
  const [certName, setCertName] = useState("");
  const [certNameInput, setCertNameInput] = useState("");

  const totalXP = useMemo(() => totalXpFromMap(completed), [completed]);
  const allQuizzesDone = useMemo(
    () => QUIZ_CENTRE.every((q) => Boolean(completed[q.id])),
    [completed]
  );

  // Load progress: from the signed-in account when available, otherwise
  // from this device's localStorage cache. Re-runs whenever the user logs
  // in or out so XP/progress reflects the active account immediately.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/quiz-centre", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated: boolean;
          progress: ProgressMap;
        };
        if (cancelled) return;
        if (data.authenticated) {
          setSynced(true);
          setCompleted(data.progress ?? {});
          writeLocalProgress(data.progress ?? {});
          return;
        }
      } catch {
        /* fall through to local cache */
      }
      if (!cancelled) {
        setSynced(false);
        setCompleted(readLocalProgress());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const activeQuiz: QuizCentreQuiz | null = useMemo(
    () => QUIZ_CENTRE.find((q) => q.id === activeId) ?? null,
    [activeId]
  );

  const correctCount = answers.filter(Boolean).length;
  const perQuestionXp = activeQuiz
    ? Math.round(activeQuiz.xp / activeQuiz.questions.length)
    : 0;
  const liveXp = correctCount * perQuestionXp;

  const goLobby = useCallback(() => {
    setView("lobby");
    setActiveId(null);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const openCertificate = useCallback((allDone: boolean) => {
    setCertAllDone(allDone);
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(QUIZ_CERT_NAME_KEY) || "" : "";
    setCertNameInput(saved);
    setCertName(saved);
    setView("certificate");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const saveCertName = useCallback(() => {
    const name = certNameInput.trim();
    if (!name) return;
    localStorage.setItem(QUIZ_CERT_NAME_KEY, name);
    setCertName(name);
  }, [certNameInput]);

  const startQuiz = useCallback((id: number) => {
    setActiveId(id);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOpt(null);
    setAnswered(false);
    setView("runner");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const submitAnswer = useCallback(() => {
    if (selectedOpt === null || answered || !activeQuiz) return;
    const q = activeQuiz.questions[currentQ];
    const isCorrect = selectedOpt === q.ans;
    setAnswers((prev) => [...prev, isCorrect]);
    setAnswered(true);
  }, [selectedOpt, answered, activeQuiz, currentQ]);

  const finishQuiz = useCallback(
    (finalAnswers: boolean[]) => {
      if (!activeQuiz) return;
      const quizId = activeQuiz.id;
      const score = finalAnswers.filter(Boolean).length;
      const total = activeQuiz.questions.length;
      const pct = Math.round((score / total) * 100);
      const xpEarned = Math.round((score / total) * activeQuiz.xp);

      setLastXp(xpEarned);

      const result = { score, total, xp: xpEarned, date: new Date().toISOString() };
      setCompleted((prev) => {
        const next = mergeResult(prev, quizId, result);
        writeLocalProgress(next);
        dispatchXpUpdated();
        return next;
      });

      // Sync to the user's account when signed in; the server returns the
      // authoritative progress (best-XP-per-quiz across all devices).
      if (synced) {
        (async () => {
          try {
            const res = await fetch("/api/quiz-centre", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quizId, score, total, xp: xpEarned }),
            });
            const data = (await res.json()) as {
              authenticated: boolean;
              progress: ProgressMap;
            };
            if (data.authenticated && data.progress) {
              setCompleted(data.progress);
              writeLocalProgress(data.progress);
            }
          } catch {
            /* keep local result if the sync request fails */
          }
        })();
      }

      setArcOffset(RING_CIRCUMFERENCE);
      setView("results");
      if (typeof window !== "undefined") window.scrollTo(0, 0);

      window.setTimeout(() => {
        setArcOffset(RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * (score / total));
      }, 120);

      if (pct >= 80) launchConfetti(activeQuiz.color);
    },
    [activeQuiz, synced]
  );

  const nextQuestion = useCallback(() => {
    if (!activeQuiz) return;
    const isLast = currentQ >= activeQuiz.questions.length - 1;
    if (isLast) {
      finishQuiz(answers);
      return;
    }
    setCurrentQ((c) => c + 1);
    setSelectedOpt(null);
    setAnswered(false);
  }, [activeQuiz, currentQ, answers, finishQuiz]);

  const launchConfetti = useCallback((col: string) => {
    const colors = [col, "#C8963E", "#4ADE80", "#60A5FA", "#F9A8D4", "#FCD34D"];
    const pieces: React.CSSProperties[] = Array.from({ length: 80 }, () => {
      const size = Math.random() * 10 + 5;
      return {
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animationDuration: `${Math.random() * 2 + 1.5}s`,
        animationDelay: `${Math.random() * 0.8}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
    });
    setConfetti(pieces);
    window.setTimeout(() => setConfetti([]), 4000);
  }, []);

  const confirmBack = useCallback(() => {
    if (answered || currentQ === 0 || window.confirm("Exit quiz? Progress will be lost.")) {
      goLobby();
    }
  }, [answered, currentQ, goLobby]);

  // ── Lobby ──
  function renderLobby() {
    return (
      <div className="qc-view active">
        <div className="qc-lobby-hero">
          <div className="qc-lobby-mesh" />
          <div className="qc-lobby-grid" />
          <div className="qc-eyebrow">Quiz Centre</div>
          <h1 className="qc-lobby-h1">
            Test Your <em>Total Rewards</em> Knowledge
          </h1>
          <p className="qc-lobby-desc">
            10 topic quizzes · 100 questions · earn XP with every correct answer — built for HR
            professionals serious about compensation expertise.
          </p>
        </div>

        <div className="qc-lobby-stats">
          <div style={{ textAlign: "center" }}>
            <div className="qc-ls-num">10</div>
            <div className="qc-ls-label">Quizzes</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="qc-ls-num">100</div>
            <div className="qc-ls-label">Questions</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="qc-ls-num">
              1<span>,500</span>
            </div>
            <div className="qc-ls-label">Max XP</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="qc-ls-num">{totalXP.toLocaleString()}</div>
            <div className="qc-ls-label">{synced ? "Your XP · synced" : "Your XP"}</div>
          </div>
        </div>

        <div className="qc-grid-wrap">
          <div className="qc-grid-header">
            <div className="qc-grid-title">All Quizzes</div>
            <div className="qc-grid-sub">Select any topic to begin</div>
          </div>
          {allQuizzesDone && (
            <div className="qc-all-cert-wrap">
              <div className="qc-all-cert-icon">🏅</div>
              <div>
                <div className="qc-all-cert-title">All 10 Quizzes Complete!</div>
                <div className="qc-all-cert-sub">
                  You&apos;ve completed the full Quiz Centre. Download your certificate.
                </div>
              </div>
              <button type="button" className="qc-all-cert-btn" onClick={() => openCertificate(true)}>
                Get Certificate
              </button>
            </div>
          )}
          <div className="qc-grid">
            {QUIZ_CENTRE.map((quiz) => {
              const done = completed[quiz.id];
              return (
                <button
                  key={quiz.id}
                  type="button"
                  className="qc-card"
                  style={{ ["--cc" as string]: quiz.color }}
                  onClick={() => startQuiz(quiz.id)}
                >
                  <div
                    className="qc-banner"
                    style={{
                      background: `linear-gradient(160deg, ${quiz.bg} 0%, ${hexToRgba(quiz.color, 0.25)} 100%)`,
                    }}
                  >
                    <div className="qc-icon-big">{quiz.icon}</div>
                    <div className="qc-num">{String(quiz.id).padStart(2, "0")}</div>
                    <span
                      className="qc-badge"
                      style={{
                        background: hexToRgba(quiz.color, 0.18),
                        color: quiz.color,
                        border: `1px solid ${hexToRgba(quiz.color, 0.35)}`,
                      }}
                    >
                      Beginner
                    </span>
                    {done && (
                      <div className="qc-completed" title="Completed">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="qc-body">
                    <div className="qc-cat" style={{ color: quiz.color }}>
                      {quiz.category}
                    </div>
                    <div className="qc-title">{quiz.title}</div>
                    <div className="qc-desc">{quiz.desc}</div>
                    <div className="qc-footer">
                      <div className="qc-meta">
                        <span>10 questions</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span>~5 min</span>
                      </div>
                      <div className="qc-xp" style={{ color: quiz.color }}>
                        ⚡ {quiz.xp} XP
                      </div>
                      <div className="qc-arrow">→</div>
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

  // ── Runner ──
  function renderRunner() {
    if (!activeQuiz) return null;
    const q = activeQuiz.questions[currentQ];
    const total = activeQuiz.questions.length;
    const pct = Math.round((currentQ / total) * 100);
    const isLast = currentQ >= total - 1;

    return (
      <div className="qc-view active qc-runner" style={{ ["--cc" as string]: activeQuiz.color }}>
        <div
          className="qc-runner-bg"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 60% 20%, ${hexToRgba(activeQuiz.color, 0.08)} 0%, transparent 60%)`,
          }}
        />
        <div className="qc-runner-inner">
          <div className="qc-runner-hd">
            <button type="button" className="qc-back" onClick={confirmBack}>
              ← Exit Quiz
            </button>
            <div className="qc-runner-label">{activeQuiz.title}</div>
            <div className="qc-xp-live">⚡ {liveXp} XP</div>
          </div>

          <div className="qc-progress-wrap">
            <div className="qc-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="qc-progress-labels">
            <span>
              Question {currentQ + 1} of {total}
            </span>
            <span>{correctCount} correct</span>
          </div>

          <BrowserVoiceBar
            key={`q-${currentQ}-${answered}`}
            text={
              answered
                ? `${q.q}. ${selectedOpt === q.ans ? "Correct." : "Incorrect."} ${q.exp}`
                : q.q
            }
            title={answered ? "Listen to explanation" : "Listen to question"}
          />

          <div className="qc-q-card qc-anim-up" key={currentQ}>
            <div className="qc-q-step">Question {currentQ + 1}</div>
            <div className="qc-q-text">{q.q}</div>
          </div>

          <div className="qc-options">
            {q.opts.map((opt, i) => {
              let cls = "qc-opt";
              if (answered) {
                cls += " locked";
                if (i === q.ans) cls += " correct";
                else if (i === selectedOpt) cls += " wrong";
              } else if (i === selectedOpt) {
                cls += " selected";
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  onClick={() => {
                    if (!answered) setSelectedOpt(i);
                  }}
                >
                  <span className="qc-opt-bullet">{LABELS[i]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`qc-explanation ${selectedOpt === q.ans ? "correct-exp" : "wrong-exp"}`}
            >
              <div className="qc-exp-label">
                {selectedOpt === q.ans ? "✓ Correct!" : "✗ Incorrect"}
              </div>
              <span>{q.exp}</span>
            </div>
          )}

          <div className="qc-runner-actions">
            {!answered ? (
              <button
                type="button"
                className="qc-btn-submit"
                onClick={submitAnswer}
                disabled={selectedOpt === null}
              >
                Submit Answer
              </button>
            ) : (
              <button type="button" className="qc-btn-next" onClick={nextQuestion}>
                {isLast ? "See Results →" : "Next Question →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Results ──
  function renderResults() {
    if (!activeQuiz) return null;
    const total = activeQuiz.questions.length;
    const score = correctCount;
    const pct = Math.round((score / total) * 100);
    const xpEarned = lastXp;

    let title: React.ReactNode;
    let sub: string;
    if (pct === 100) {
      title = (
        <>
          <em>Perfect Score!</em>
        </>
      );
      sub = "Outstanding. You have total command of this topic.";
    } else if (pct >= 80) {
      title = (
        <>
          <em>Excellent</em> Work
        </>
      );
      sub = "Strong performance. A couple of questions to revisit and you'll have this mastered.";
    } else if (pct >= 60) {
      title = (
        <>
          <em>Good</em> Progress
        </>
      );
      sub = "Solid foundation. Review the explanations below and try again to lock in the concepts.";
    } else {
      title = (
        <>
          Keep <em>Building</em>
        </>
      );
      sub = "Good start. Use the breakdown below to focus your review — every attempt improves your knowledge.";
    }

    const nextQuiz = QUIZ_CENTRE.find((q) => q.id === activeQuiz.id + 1);

    return (
      <div className="qc-view active" style={{ ["--cc" as string]: activeQuiz.color }}>
        <div className="qc-results-inner">
          <div className="qc-results-ring">
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke={activeQuiz.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={arcOffset}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1) .3s" }}
              />
            </svg>
            <div className="qc-results-score">
              {score}/{total}
            </div>
            <div className="qc-results-score-label">correct</div>
          </div>

          <h2 className="qc-results-title">{title}</h2>
          <p className="qc-results-sub">{sub}</p>
          <div className="qc-results-xp" style={{ color: activeQuiz.color }}>
            ⚡ +{xpEarned} XP earned
          </div>

          <div className="qc-results-breakdown">
            <div className="qc-rb-title">Question Breakdown</div>
            <div className="qc-rb-items">
              {activeQuiz.questions.map((qq, i) => (
                <div className="qc-rb-item" key={i}>
                  <div
                    className="qc-rb-dot"
                    style={{ background: answers[i] ? "#4ADE80" : "#F87171" }}
                  />
                  <div className="qc-rb-q">{qq.q}</div>
                  <div className="qc-rb-result">{answers[i] ? "✓" : "✗"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="qc-results-actions">
            <button type="button" className="qc-btn-retry" onClick={() => startQuiz(activeQuiz.id)}>
              ↺ Retry Quiz
            </button>
            <button type="button" className="qc-btn-retry" onClick={() => openCertificate(false)}>
              🎓 Certificate
            </button>
            {nextQuiz && (
              <button
                type="button"
                className="qc-btn-next-quiz"
                style={{ background: nextQuiz.color }}
                onClick={() => startQuiz(nextQuiz.id)}
              >
                Next: {nextQuiz.title} →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderCertificate() {
    const done = Object.keys(completed).length;
    const totalScore = Object.values(completed).reduce((s, r) => s + (r.score ?? 0), 0);
    const totalQ = Object.values(completed).reduce((s, r) => s + (r.total ?? 10), 0);
    const pct = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
    const showDoc = Boolean(certName);

    return (
      <div className="qc-view active qc-cert-view">
        <div className="qc-cert-container">
          {!showDoc ? (
            <div className="qc-cert-name-form">
              <h3>Your Certificate is Ready</h3>
              <p>Enter your name to personalise and download your Quiz Centre certificate</p>
              <input
                className="qc-cert-name-inp"
                value={certNameInput}
                onChange={(e) => setCertNameInput(e.target.value)}
                placeholder="Your full name"
                maxLength={60}
              />
              <button type="button" className="qc-cert-gen-btn" onClick={saveCertName}>
                Generate Certificate
              </button>
            </div>
          ) : (
            <>
              <div className="qc-cert-actions-row">
                <button type="button" className="qc-btn-retry" onClick={goLobby}>
                  ← Back to Quizzes
                </button>
                <button type="button" className="qc-cert-print-btn" onClick={() => window.print()}>
                  🖨 Download / Print
                </button>
              </div>
              <div className="qc-cert-doc">
                <div className="qc-cert-stripe" />
                <div className="qc-cert-body">
                  <div className="qc-cert-logo">
                    <span className="qc-cert-logo-mark">R</span>
                    <span>Rewardology Academy</span>
                  </div>
                  <div className="qc-cert-ey">Certificate of Achievement</div>
                  <h1 className="qc-cert-h1">
                    This certifies that <em>the following</em>
                  </h1>
                  <div className="qc-cert-sub">HR professional has demonstrated knowledge in Total Rewards</div>
                  <div className="qc-cert-name-display">{certName}</div>
                  <div className="qc-cert-achievement">Achievement</div>
                  <div className="qc-cert-score-title">
                    {certAllDone || allQuizzesDone
                      ? "Quiz Centre — All 10 Quizzes Completed"
                      : "Quiz Centre — In Progress"}
                  </div>
                  <div className="qc-cert-score-sub">
                    {certAllDone || allQuizzesDone
                      ? `Completion · ${pct}% average score across ${totalQ} questions`
                      : `${done} of ${QUIZ_CENTRE.length} quizzes completed · ${pct}% average score`}
                  </div>
                  <div className="qc-cert-ft">
                    <div>
                      <div className="qc-cert-date-label">Date Issued</div>
                      <div className="qc-cert-date-val">
                        {new Date().toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="qc-cert-badge">
                      <span>🏅</span>
                      <div>
                        Verified Achievement
                        <br />
                        <span style={{ fontWeight: 400, color: "rgba(74,222,128,.7)" }}>
                          Rewardology Academy
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="qc-root">
      {view === "lobby" && renderLobby()}
      {view === "runner" && renderRunner()}
      {view === "results" && renderResults()}
      {view === "certificate" && renderCertificate()}

      {confetti.length > 0 && (
        <div className="qc-confetti-wrap">
          {confetti.map((style, i) => (
            <span key={i} className="qc-confetti-piece" style={style} />
          ))}
        </div>
      )}
    </div>
  );
}
