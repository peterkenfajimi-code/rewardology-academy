import { COURSES, allLessons } from "@/lib/courses/courseData";
import { questionForDate } from "@/lib/daily-quiz/dailyQuizData";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import { courseCompletionIssuedAt } from "@/lib/certificates/courseCompletion";
import type { CertificateType } from "@/lib/certificates/types";

export type CourseProgressRow = {
  lesson_id: string;
  xp: number;
  updated_at: string;
};

export type QuizCentreProgressRow = {
  best_score: number;
  best_total: number;
  best_xp: number;
  updated_at: string;
};

export type DailyQuizCompletionRow = {
  correct: boolean;
  xp_earned: number;
  created_at: string;
};

export type VerifiedCertificate = {
  certType: CertificateType;
  sourceId: string;
  recipientName: string;
  credentialName: string;
  credentialDetail: string | null;
  scorePct: number | null;
  xpEarned: number | null;
  issuedAt: string | null;
};

export function sanitizeRecipientName(name: string | undefined): string | null {
  const cleaned = String(name ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned.length >= 2 ? cleaned : null;
}

export function verifiedCourseCertificate(
  sourceId: string,
  rows: CourseProgressRow[] | null,
  recipientName: string
): VerifiedCertificate | null {
  const courseId = Number(sourceId);
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;

  const issuedAt = courseCompletionIssuedAt(courseId, rows);
  if (!issuedAt) return null;

  const byLesson = new Map((rows ?? []).map((r) => [r.lesson_id, r]));
  let xp = 0;
  for (const { lesson } of allLessons(course)) {
    const row = byLesson.get(lesson.id);
    if (!row) return null;
    xp += Math.max(0, Math.min(row.xp, lesson.xp));
  }

  return {
    certType: "course",
    sourceId: String(course.id),
    recipientName,
    credentialName: course.title,
    credentialDetail: course.subtitle,
    scorePct: null,
    xpEarned: xp,
    issuedAt,
  };
}

export function verifiedQuizCentreCertificate(
  sourceId: string,
  row: QuizCentreProgressRow | null,
  recipientName: string
): VerifiedCertificate | null {
  const quizId = Number(sourceId);
  const quiz = QUIZ_CENTRE.find((q) => q.id === quizId);
  if (!quiz || !row) return null;

  const total = quiz.questions.length;
  if (total <= 0 || row.best_total <= 0) return null;
  const score = Math.max(0, Math.min(row.best_score, total));
  const scorePct = Math.round((score / total) * 100);
  const xp = Math.max(0, Math.min(row.best_xp, quiz.xp));

  return {
    certType: "quiz_centre",
    sourceId: String(quiz.id),
    recipientName,
    credentialName: quiz.title,
    credentialDetail: quiz.desc,
    scorePct,
    xpEarned: xp,
    issuedAt: row.updated_at,
  };
}

export function verifiedDailyQuizCertificate(
  sourceId: string,
  row: DailyQuizCompletionRow | null,
  recipientName: string
): VerifiedCertificate | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sourceId) || !row) return null;
  const question = questionForDate(sourceId);

  return {
    certType: "quiz",
    sourceId,
    recipientName,
    credentialName: "Daily Quiz",
    credentialDetail: question.title,
    scorePct: row.correct ? 100 : 0,
    xpEarned: Math.max(0, row.xp_earned),
    issuedAt: row.created_at,
  };
}
