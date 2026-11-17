"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Page-wide effects, mounted once in the root layout:
 * - a thin accent progress bar showing how far down the page you are
 * - the cursor "spotlight" glow on any element with `data-spotlight`
 */
export function MotionEffects() {
  const bar = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.current?.style.setProperty("transform", `scaleX(${max > 0 ? window.scrollY / max : 0})`);
      });
    };
    const onPointer = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-spotlight]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onPointer);
    };
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** Counts up to a value like "9+" or "16" when it scrolls into view. */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const numeric = match !== null;
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(target); // server render shows the final value

  useEffect(() => {
    const el = ref.current;
    if (!el || !numeric || prefersReducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(target * (1 - Math.pow(1 - t, 3)))); // ease-out cubic
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration, numeric]);

  if (!numeric) return <>{value}</>;
  return (
    <span ref={ref} className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

/** A timeline rail that fills with the accent color as you scroll through its parent. */
export function TimelineRail({ className = "" }: { className?: string }) {
  const fill = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      fill.current?.style.setProperty("transform", "scaleY(1)");
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = rail.current?.getBoundingClientRect();
        if (!r || !fill.current) return;
        const anchor = window.innerHeight * 0.65; // fill reaches the point 65% down the screen
        const progress = Math.min(1, Math.max(0, (anchor - r.top) / r.height));
        fill.current.style.transform = `scaleY(${progress})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={rail} aria-hidden className={`absolute w-px bg-line ${className}`}>
      <div ref={fill} className="h-full w-full origin-top bg-gradient-to-b from-accent to-accent/40" style={{ transform: "scaleY(0)" }} />
    </div>
  );
}
