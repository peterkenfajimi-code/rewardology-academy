"use client";

import { useEffect, useRef } from "react";
import { DAILY_QUIZ_SECTION_ID } from "@/lib/site";

function scrollToDailyQuiz(behavior: ScrollBehavior = "smooth") {
  document.getElementById(DAILY_QUIZ_SECTION_ID)?.scrollIntoView({ behavior, block: "start" });
}

export function HomeEffects() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector(".home-root") as HTMLElement | null;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // Scroll reveal
    const reveals = Array.from(document.querySelectorAll(".home-root .reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    // Nav scroll background
    const nav = document.querySelector(".home-nav");
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const scrollIfHash = () => {
      if (window.location.hash === `#${DAILY_QUIZ_SECTION_ID}`) {
        requestAnimationFrame(() => scrollToDailyQuiz());
      }
    };
    scrollIfHash();
    window.addEventListener("hashchange", scrollIfHash);

    // Custom cursor (fine pointers only)
    let raf = 0;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    const cursor = cursorRef.current;
    const ring = ringRef.current;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursor) {
        cursor.style.left = `${mx}px`;
        cursor.style.top = `${my}px`;
        cursor.style.opacity = "1";
      }
      if (ring) ring.style.opacity = "1";
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (cursor) cursor.classList.toggle("lg", !!t.closest("a, button"));
    };
    const tick = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
      }
      raf = requestAnimationFrame(tick);
    };

    if (finePointer && root) {
      root.classList.add("cursor-active");
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseover", onOver);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", scrollIfHash);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (raf) cancelAnimationFrame(raf);
      root?.classList.remove("cursor-active");
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="home-cursor" style={{ opacity: 0 }} aria-hidden />
      <div ref={ringRef} className="home-cursor-ring" style={{ opacity: 0 }} aria-hidden />
    </>
  );
}
