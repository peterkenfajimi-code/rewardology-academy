import { Suspense } from "react";
import { CourseCentre } from "@/components/courses/CourseCentre";

export const metadata = {
  title: "Courses — Rewardology Academy",
  description:
    "Structured beginner courses in Total Rewards, compensation, benefits, salary structures, and market pricing — earn XP and certificates as you learn.",
};

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="cc-loading">Loading courses…</div>}>
      <CourseCentre />
    </Suspense>
  );
}
