"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ArticleKeyboardNav({
  prevSlug,
  nextSlug,
}: {
  prevSlug?: string;
  nextSlug?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" && nextSlug) router.push(`/articles/${nextSlug}`);
      if (e.key === "ArrowLeft" && prevSlug) router.push(`/articles/${prevSlug}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextSlug, prevSlug, router]);

  return null;
}
