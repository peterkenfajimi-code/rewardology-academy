import { COURSES, allLessons, type Course } from "@/lib/courses/courseData";

// Earned XP per lesson, keyed `${courseId}-${lessonId}` (matches the API map).
export type LessonXpMap = Record<string, number>;

export const COURSE_XP_STORAGE_KEY = "ra_course_lxp";

export function lessonKey(courseId: number, lessonId: string): string {
  return `${courseId}-${lessonId}`;
}

export function courseXp(map: LessonXpMap, courseId: number): number {
  const prefix = `${courseId}-`;
  return Object.keys(map)
    .filter((k) => k.startsWith(prefix))
    .reduce((sum, k) => sum + (map[k] || 0), 0);
}

export function totalCourseXp(map: LessonXpMap): number {
  return Object.values(map).reduce((sum, v) => sum + (v || 0), 0);
}

export function isCourseComplete(map: LessonXpMap, course: Course): boolean {
  return allLessons(course).every(({ lesson }) => (map[lessonKey(course.id, lesson.id)] || 0) > 0);
}

export const MAX_COURSE_XP = COURSES.reduce((sum, c) => sum + c.total_xp, 0);

export function readLocalCourseXp(): LessonXpMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COURSE_XP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LessonXpMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeLocalCourseXp(map: LessonXpMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COURSE_XP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function mergeLessonXp(map: LessonXpMap, key: string, xp: number): LessonXpMap {
  const prev = map[key] || 0;
  if (xp <= prev) return map;
  return { ...map, [key]: xp };
}
