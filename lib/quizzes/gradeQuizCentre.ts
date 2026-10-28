import type { QuizCentreQuiz } from "@/lib/quizzes/quizCentre";

export type GradedQuizCentreAttempt = {
  score: number;
  total: number;
  xp: number;
};

/** Grade from option indexes. Rejects a client-supplied score. */
export function gradeQuizCentreAttempt(
  quiz: QuizCentreQuiz,
  answers: unknown
): GradedQuizCentreAttempt | null {
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) return null;

  let score = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    const pick = answers[i];
    const opts = quiz.questions[i].opts;
    if (!Number.isInteger(pick) || Number(pick) < 0 || Number(pick) >= opts.length) {
      return null;
    }
    if (pick === quiz.questions[i].ans) score += 1;
  }

  const total = quiz.questions.length;
  return {
    score,
    total,
    xp: Math.round((score / total) * quiz.xp),
  };
}
