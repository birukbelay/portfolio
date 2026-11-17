"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export interface WheelSkill {
  id: string;
  name: string;
  image: string;
  category: string;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const r2 = (n: number) => Math.round(n * 100) / 100; // identical numbers on server and client

/**
 * The toolkit as a bicycle wheel: every skill sits on the rim at the end of a spoke.
 * The wheel rolls as you scroll (and drifts slowly while visible); the skill passing the top
 * of the wheel is shown in the hub and highlighted in the list. Hover a logo or a list item
 * to bring it to the hub.
 */
export default function SkillWheel({ groups }: { groups: [string, WheelSkill[]][] }) {
  const skills = useMemo(() => groups.flatMap(([, items]) => items), [groups]);
  const n = skills.length;
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<SVGGElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    if (!n) return;
    const still = reduced();
    let raf = 0;
    let visible = false;
    let drift = 0;
    let last = performance.now();
    let lastTop = -1;

    const place = (rot: number) => {
      spinRef.current?.setAttribute("transform", `rotate(${rot} 200 200)`);
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < n; i++) {
        const angle = ((i / n) * 360 + rot) % 360; // 0° = top
        const rad = ((angle - 90) * Math.PI) / 180;
        const el = chipRefs.current[i];
        if (el) {
          el.style.left = `${50 + Math.cos(rad) * 41.5}%`;
          el.style.top = `${50 + Math.sin(rad) * 41.5}%`;
        }
        const dist = Math.min(Math.abs(angle), 360 - Math.abs(angle));
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      if (best !== lastTop) {
        lastTop = best;
        setTopIndex(best);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (hoveredRef.current === null) drift += dt * 0.006; // ~6°/s while idle
      // Rolling with the page: about one full turn per 1600px scrolled
      place((window.scrollY * 0.225 + drift) % 360);
      if (visible) raf = requestAnimationFrame(frame);
    };

    place(0);
    if (still) return;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    if (wheelRef.current) io.observe(wheelRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [n]);

  if (!n) return null;
  const focus = hovered ?? topIndex;
  // Logo size (% of the wheel) shrinks as more skills share the rim, so they never overlap.
  const chip = Math.min(11, 235 / n);
  const current = skills[focus];

  // Static geometry for the SVG (rounded to avoid hydration mismatches)
  const spokes = skills.map((_, i) => {
    const a = ((i / n) * 360 - 90) * (Math.PI / 180);
    return { x: r2(200 + Math.cos(a) * 166), y: r2(200 + Math.sin(a) * 166), hx: r2(200 + Math.cos(a + 0.5) * 22), hy: r2(200 + Math.sin(a + 0.5) * 22) };
  });

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* The wheel */}
      <div ref={wheelRef} className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden>
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible">
          <g ref={spinRef}>
            {/* tyre with tread */}
            <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(var(--c-ink))" strokeWidth="14" />
            <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(var(--c-paper) / .45)" strokeWidth="14" strokeDasharray="2 7" />
            {/* rim */}
            <circle cx="200" cy="200" r="176" fill="none" stroke="rgb(var(--c-muted))" strokeWidth="4" />
            <circle cx="200" cy="200" r="170" fill="none" stroke="rgb(var(--c-line))" strokeWidth="1.5" />
            {/* spokes: crossed lacing from hub flange to each skill */}
            {spokes.map((s, i) => (
              <line key={i} x1={s.hx} y1={s.hy} x2={s.x} y2={s.y} stroke="rgb(var(--c-muted) / .7)" strokeWidth="1.1" strokeLinecap="round" />
            ))}
            {/* valve */}
            <rect x="196" y="16" width="8" height="14" rx="2" fill="rgb(var(--c-accent))" />
          </g>
        </svg>

        {/* Hub: the skill at the top of the wheel */}
        <div className="absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-ink bg-surface text-center shadow-xl">
          <div key={current.id} className="flex animate-scale-in flex-col items-center px-2">
            {current.image && <Image src={current.image} alt="" width={36} height={36} className="mb-1.5 h-[22%] min-h-6 w-auto object-contain" />}
            <span className="text-sm font-semibold capitalize leading-tight text-ink sm:text-base">{current.name}</span>
            <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted sm:text-[10px]">{current.category}</span>
          </div>
        </div>
        {/* pointer marking the top */}
        <span className="absolute left-1/2 top-[-14px] h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[12px] border-x-transparent border-t-accent" />

        {/* Skill logos on the rim */}
        {skills.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
            className={`pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-2 transition-[width,height,box-shadow] duration-300 ${
              i === focus ? "z-10 ring-accent shadow-accent/30" : "ring-line"
            }`}
            style={{ width: `${i === focus ? chip * 1.4 : chip}%`, height: `${i === focus ? chip * 1.4 : chip}%`, left: `${r2(50 + Math.cos(((i / n) * 360 - 90) * (Math.PI / 180)) * 41.5)}%`, top: `${r2(50 + Math.sin(((i / n) * 360 - 90) * (Math.PI / 180)) * 41.5)}%` }}
          >
            {s.image ? (
              <Image src={s.image} alt="" width={40} height={40} className="h-[58%] w-[58%] object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-zinc-500">{s.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        ))}
      </div>

      {/* Readable list, grouped by category */}
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {groups.map(([cat, items]) => (
          <div key={cat}>
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{cat}</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {items.map((s) => {
                const i = skills.indexOf(s);
                const on = i === focus;
                return (
                  <li
                    key={s.id}
                    onPointerEnter={() => setHovered(i)}
                    onPointerLeave={() => setHovered(null)}
                    className={`chip cursor-default capitalize transition ${on ? "border-accent bg-accent text-accent-ink" : ""}`}
                  >
                    {s.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
