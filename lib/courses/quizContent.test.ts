import { describe, expect, it } from "vitest";
import { COURSES } from "@/lib/courses/courseData";
import { getLessonQuiz, getModuleQuizQuestions } from "@/lib/courses/quizContent";

describe("course quiz content", () => {
  it("provides a knowledge check for every lesson", () => {
    for (const course of COURSES) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons.filter((l) => l.type === "lesson")) {
          const q = getLessonQuiz(lesson);
          expect(q.q.length).toBeGreaterThan(10);
          expect(q.opts.length).toBe(4);
          expect(q.ans).toBeGreaterThanOrEqual(0);
          expect(q.ans).toBeLessThan(4);
          expect(q.exp.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("provides module quiz questions for every module quiz", () => {
    for (const course of COURSES) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons.filter((l) => l.type === "quiz")) {
          const qs = getModuleQuizQuestions(lesson, mod);
          expect(qs.length).toBeGreaterThanOrEqual(5);
          for (const q of qs) {
            expect(q.opts.length).toBe(4);
            expect(q.ans).toBeGreaterThanOrEqual(0);
            expect(q.ans).toBeLessThan(4);
          }
        }
      }
    }
  });
});
