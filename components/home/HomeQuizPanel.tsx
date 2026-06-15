"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DAILY_QUIZ_XP } from "@/lib/daily-quiz/dailyQuizData";
import { readLocalDaily, writeLocalDaily } from "@/lib/daily-quiz/localProgress";
import { dispatchXpUpdated } from "@/lib/xp/dispatch";
import { computeStreak } from "@/lib/daily-quiz/streak";

type QuestionPayload = {
  id: string;
  label: string;
  title: string;
  question: string;
  options: { key: string; label: string }[];
  dateKey: string;
  xpReward: number;
};

type DailyState = {
  authenticated: boolean;
  question: QuestionPayload;
  today: {
    answered: boolean;
    correct: boolean;
    selectedKey: string | null;
    xpEarned: number;
    explanation?: string | null;
    correctKey?: string;
  };
  streak: number;
};

export function HomeQuizPanel() {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [correctKey, setCorrectKey] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [todayXpEarned, setTodayXpEarned] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const applyState = useCallback((data: DailyState) => {
    setQuestion(data.question);
    setAuthenticated(data.authenticated);
    setStreak(data.streak);
    setTodayXpEarned(data.today.xpEarned);
    setSubmitted(data.today.answered);
    setCorrect(data.today.correct);
    setSelected(data.today.selectedKey);
    setExplanation(data.today.explanation ?? null);
    if (data.today.correctKey) setCorrectKey(data.today.correctKey);
    else if (data.today.answered && data.today.correct) {
      setCorrectKey(data.today.selectedKey);
    }
  }, []);

  const mergeGuestLocal = useCallback((data: DailyState) => {
    const local = readLocalDaily();
    if (!local || local.dateKey !== data.question.dateKey) return;
    setSubmitted(true);
    setCorrect(local.correct);
    setSelected(local.selectedKey);
    setStreak(computeStreak(local.history, data.question.dateKey));
    setTodayXpEarned(local.xpEarned);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-quiz", { cache: "no-store" });
      const data = (await res.json()) as DailyState & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load daily quiz");
      applyState(data);
      if (!data.authenticated) mergeGuestLocal(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [applyState, mergeGuestLocal]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = (key: string) => {
    if (submitted) return;
    setSelected(key);
  };

  const submitGuest = async () => {
    if (!selected || !question) return;

    const res = await fetch("/api/daily-quiz/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedKey: selected,
        questionId: question.id,
        dateKey: question.dateKey,
      }),
    });
    const data = (await res.json()) as {
      correct?: boolean;
      correctKey?: string;
      explanation?: string | null;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || "Could not check answer");

    const wasCorrect = Boolean(data.correct);
    const xp = wasCorrect ? DAILY_QUIZ_XP : 0;
    const localPrev = readLocalDaily();
    const alreadyToday = localPrev?.dateKey === question.dateKey;
    const prevTodayXp = alreadyToday ? (localPrev?.xpEarned ?? 0) : 0;
    const history = localPrev?.history ?? [];
    const newHistory = history.includes(question.dateKey)
      ? history
      : [...history, question.dateKey];
    const totalXpEarned = (localPrev?.totalXpEarned ?? 0) - prevTodayXp + xp;

    writeLocalDaily({
      dateKey: question.dateKey,
      questionId: question.id,
      selectedKey: selected,
      correct: wasCorrect,
      xpEarned: xp,
      history: newHistory,
      totalXpEarned,
    });

    setSubmitted(true);
    setCorrect(wasCorrect);
    setCorrectKey(data.correctKey ?? null);
    setExplanation(data.explanation ?? null);
    setStreak(computeStreak(newHistory, question.dateKey));
    setTodayXpEarned(xp);
    dispatchXpUpdated();
  };

  const submit = async () => {
    if (!selected || submitted || !question) return;
    setSubmitting(true);
    setError(null);

    try {
      if (authenticated) {
        const res = await fetch("/api/daily-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedKey: selected,
            questionId: question.id,
            dateKey: question.dateKey,
          }),
        });
        const data = (await res.json()) as DailyState & { error?: string };
        if (!res.ok) throw new Error(data.error || "Could not save");
        applyState(data);
        dispatchXpUpdated();
        if (data.today.answered && !data.today.correct) {
          const v = await fetch("/api/daily-quiz/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              selectedKey: selected,
              questionId: question.id,
              dateKey: question.dateKey,
            }),
          });
          const vd = (await v.json()) as { correctKey?: string; explanation?: string | null };
          setCorrectKey(vd.correctKey ?? null);
          setExplanation(vd.explanation ?? null);
        }
      } else {
        await submitGuest();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const optionClass = (key: string) => {
    let cls = "qp-opt";
    if (!submitted) {
      if (selected === key) cls += " correct";
      return cls;
    }
    if (correctKey === key) cls += " correct";
    else if (selected === key && !correct) cls += " wrong";
    return cls;
  };

  if (loading) {
    return (
      <div className="quiz-panel reveal reveal-d2">
        <div className="qp-header">
          <div className="qp-label">Today&apos;s Quiz</div>
          <div className="qp-title">Loading…</div>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="quiz-panel reveal reveal-d2">
        <div className="qp-body">
          <div className="news-error-desc">{error}</div>
          <button type="button" className="qp-btn" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="quiz-panel reveal reveal-d2">
      <div className="qp-header">
        <div className="qp-label">Today&apos;s Quiz · {question.label}</div>
        <div className="qp-title">{question.title}</div>
        <div className="qp-xp">Complete for {DAILY_QUIZ_XP} XP</div>
      </div>
      <div className="qp-body">
        <div className="qp-question">{question.question}</div>
        <div className="qp-options">
          {question.options.map((o) => (
            <button
              key={o.key}
              type="button"
              className={optionClass(o.key)}
              onClick={() => choose(o.key)}
              disabled={submitted}
            >
              <span className="qp-opt-bullet">{o.key}</span>
              {o.label}
            </button>
          ))}
        </div>
        {error && <div className="news-error-desc">{error}</div>}
        <button
          className="qp-btn"
          type="button"
          onClick={submit}
          disabled={!selected || submitted || submitting}
        >
          {submitted
            ? correct
              ? `+${DAILY_QUIZ_XP} XP earned`
              : "Submitted — try again tomorrow"
            : submitting
            ? "Submitting…"
            : "Submit Answer"}
        </button>
        {submitted && explanation && (
          <p className="qp-explanation">{explanation}</p>
        )}
        {submitted && !authenticated && (
          <p className="ra-modal-sub" style={{ marginTop: 12, textAlign: "center" }}>
            <Link href="/signup">Sign up</Link> to save progress and sync XP to your dashboard.
          </p>
        )}
      </div>
      <div className="qp-footer">
        <div className="qp-streak">🔥 {streak}-day streak</div>
        <div className="qp-score">
          {submitted
            ? `${todayXpEarned > 0 ? "+" : ""}${todayXpEarned} XP today`
            : `Up to ${DAILY_QUIZ_XP} XP today`}
        </div>
      </div>
    </div>
  );
}
