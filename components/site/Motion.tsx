"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";


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
