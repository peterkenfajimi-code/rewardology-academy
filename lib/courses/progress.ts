import {
  COURSES,
  allLessons,
  type Course,
  type CourseLesson,
  type CourseModule,
} from "@/lib/courses/courseData";

// Earned XP per lesson, keyed `${courseId}-${lessonId}` (matches the API map).
export type LessonXpMap = Record<string, number>;

// v2: key bumped to clear old-curriculum progress data (pre-June 2026 rebuild)
export const COURSE_XP_STORAGE_KEY = "ra_course_lxp_v2";

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

/** First lesson with no earned XP, or first lesson if the course is complete. */
export function nextLessonForCourse(
  map: LessonXpMap,
  course: Course
): { lesson: CourseLesson; mod: CourseModule } | null {
  const lessons = allLessons(course);
  for (const item of lessons) {
    if ((map[lessonKey(course.id, item.lesson.id)] || 0) === 0) return item;
  }
  return lessons[0] ?? null;
}

export function courseResumeHref(courseId: number, map: LessonXpMap): string {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return "/courses";
  if (courseXp(map, courseId) === 0) return `/courses?course=${courseId}`;
  const next = nextLessonForCourse(map, course);
  if (!next) return `/courses?course=${courseId}`;
  const params = new URLSearchParams({ course: String(courseId), lesson: next.lesson.id });
  if (next.lesson.type === "quiz") params.set("view", "mod-quiz");
  return `/courses?${params.toString()}`;
}
