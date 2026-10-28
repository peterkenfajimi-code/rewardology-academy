import { describe, expect, it } from "vitest";
import { gradeQuizCentreAttempt } from "@/lib/quizzes/gradeQuizCentre";
import type { QuizCentreQuiz } from "@/lib/quizzes/quizCentre";

const quiz: QuizCentreQuiz = {
  id: 99,
  title: "Test",
  category: "Test",
  color: "#000",
  bg: "#000",
  icon: "◈",
  xp: 100,
  desc: "Test",
  questions: [
    { q: "a", opts: ["w", "x", "y", "z"], ans: 1, exp: "" },
    { q: "b", opts: ["w", "x", "y", "z"], ans: 3, exp: "" },
  ],
};

describe("gradeQuizCentreAttempt", () => {
  it("scores from option indexes and ignores a claimed score", () => {
    expect(gradeQuizCentreAttempt(quiz, [1, 3])).toEqual({ score: 2, total: 2, xp: 100 });
    expect(gradeQuizCentreAttempt(quiz, [0, 3])).toEqual({ score: 1, total: 2, xp: 50 });
    expect(gradeQuizCentreAttempt(quiz, [0, 0])).toEqual({ score: 0, total: 2, xp: 0 });
  });

  it("rejects incomplete or out-of-range answers", () => {
    expect(gradeQuizCentreAttempt(quiz, [1])).toBeNull();
    expect(gradeQuizCentreAttempt(quiz, [1, 9])).toBeNull();
    expect(gradeQuizCentreAttempt(quiz, [1.5, 3])).toBeNull();
  });
});
