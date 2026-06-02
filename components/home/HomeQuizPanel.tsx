"use client";

import { useState } from "react";

const OPTIONS = [
  { key: "A", label: "The employee is paid 15% above midpoint", correct: false },
  { key: "B", label: "The employee is paid 15% below midpoint", correct: true },
  { key: "C", label: "The employee is paid exactly at midpoint", correct: false },
  { key: "D", label: "The employee's pay cannot be determined", correct: false },
];

export function HomeQuizPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(420);

  const choose = (key: string) => {
    if (submitted) return;
    setSelected(key);
  };

  const submit = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    const picked = OPTIONS.find((o) => o.key === selected);
    if (picked?.correct) setScore((s) => s + 15);
  };

  return (
    <div className="quiz-panel reveal reveal-d2">
      <div className="qp-header">
        <div className="qp-label">Today&apos;s Quiz · Compensation Basics</div>
        <div className="qp-title">Compensation Basics Quiz</div>
        <div className="qp-xp">Complete for up to 60 XP</div>
      </div>
      <div className="qp-body">
        <div className="qp-question">
          What does a compa-ratio of 0.85 indicate about an employee&apos;s pay relative to the
          salary range midpoint?
        </div>
        <div className="qp-options">
          {OPTIONS.map((o) => {
            const isSelected = selected === o.key;
            let cls = "qp-opt";
            if (submitted) {
              if (o.correct) cls += " correct";
              else if (isSelected) cls += " wrong";
            } else if (isSelected) {
              cls += " correct";
            }
            return (
              <button key={o.key} type="button" className={cls} onClick={() => choose(o.key)}>
                <span className="qp-opt-bullet">{o.key}</span>
                {o.label}
              </button>
            );
          })}
        </div>
        <button className="qp-btn" type="button" onClick={submit}>
          {submitted ? "+15 XP earned — sign up to save progress" : "Submit Answer"}
        </button>
      </div>
      <div className="qp-footer">
        <div className="qp-streak">🔥 3-day streak</div>
        <div className="qp-score">{score} XP</div>
      </div>
    </div>
  );
}
