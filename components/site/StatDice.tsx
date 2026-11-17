"use client";

import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Pip layouts (3×3 grid cells) for the five faces that don't carry the stat.
const PIPS: number[][] = [
  [0, 8],
  [0, 4, 8],
  [0, 2, 6, 8],
  [0, 2, 4, 6, 8],
  [0, 2, 3, 5, 6, 8],
];
// The other five faces of the cube; the front face shows the stat.
const SIDE_FACES = ["rotateY(90deg)", "rotateX(90deg)", "rotateX(-90deg)", "rotateY(-90deg)", "rotateY(180deg)"];

// Each die starts its throw tumbled differently.
const START_TUMBLE: [number, number][] = [
  [-540, 450],
  [630, -360],
  [-450, -540],
  [720, 270],
];

/**
 * The stats row as dice: when it scrolls into view the dice are thrown across the table,
 * tumble, and land with the stat on the face. Click a die to roll it again.
 */
export default function StatDice({ stats }: { stats: { value: string; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [thrown, setThrown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      setTimeout(() => setThrown(true), 0);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setThrown(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    // If the browser isn't drawing frames (background tab, frozen preview), the throw can't play:
    // show the dice already landed instead of leaving them invisible.
    const fallback = setTimeout(() => {
      if (!document.documentElement.classList.contains("motion-ready")) setThrown(true);
    }, 800);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 px-4 pb-8 pt-10 backdrop-blur [--s:76px] sm:px-8 sm:[--s:104px]"
    >
      {/* felt-table texture */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(ellipse_at_center,rgb(var(--c-accent)/.06),transparent_70%)]" />
      <dl className="relative grid grid-cols-2 gap-y-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <StatDie key={s.label} stat={s} index={i} thrown={thrown} />
        ))}
      </dl>
    </div>
  );
}

function StatDie({ stat, index, thrown }: { stat: { value: string; label: string }; index: number; thrown: boolean }) {
  const [spins, setSpins] = useState(0);
  const rolling = useRef(false);
  // Roll on hover or click; ignore new rolls until the current one lands.
  const roll = () => {
    if (!thrown || rolling.current) return;
    rolling.current = true;
    setSpins((n) => n + 1);
  };
  const [x0, y0] = START_TUMBLE[index % START_TUMBLE.length];
  const delay = index * 160;

  // Landed = front face (the stat) toward the viewer. Re-rolls add whole turns, so it lands the same way.
  const rot = thrown ? `rotateX(${-12 + spins * 720}deg) rotateY(${14 + spins * 360}deg)` : `rotateX(${x0}deg) rotateY(${y0}deg)`;

  return (
    <div className="flex flex-col items-center">
      <dt className="sr-only">{stat.label}</dt>
      <dd className="contents">
        <button
          type="button"
          onClick={roll}
          onPointerEnter={roll}
          aria-label={`${stat.value} ${stat.label}. Roll the die`}
          className="group relative [perspective:700px]"
          style={{
            width: "var(--s)",
            height: "var(--s)",
            transform: thrown ? "none" : `translate(${-160 - index * 40}%, -70%)`,
            opacity: thrown ? 1 : 0,
            transition: `transform 1.05s cubic-bezier(.18,.9,.3,1.12) ${delay}ms, opacity .3s ${delay}ms`,
          }}
        >
          <span
            className="absolute inset-0 [transform-style:preserve-3d]"
            style={{
              transform: rot,
              transition: `transform ${spins ? 1.3 : 1.6}s cubic-bezier(.2,.85,.3,1.04) ${spins ? 0 : delay}ms`,
            }}
            onTransitionEnd={(e) => {
              if (e.propertyName === "transform") rolling.current = false;
            }}
          >
            {/* front: the stat */}
            <Face transform="rotateY(0deg)">
              <span className="font-display text-[calc(var(--s)*.42)] leading-none tracking-tight text-ink">{stat.value}</span>
              <span className="absolute left-[12%] top-[12%] h-[7%] w-[7%] rounded-full bg-accent" />
              <span className="absolute bottom-[12%] right-[12%] h-[7%] w-[7%] rounded-full bg-accent" />
            </Face>
            {SIDE_FACES.map((t, f) => (
              <Face key={t} transform={t}>
                <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-[18%]">
                  {Array.from({ length: 9 }, (_, c) => (
                    <span key={c} className="flex items-center justify-center">
                      {PIPS[f].includes(c) && <span className="h-[62%] w-[62%] rounded-full bg-ink shadow-[inset_0_1px_2px_rgb(0_0_0/.4)]" />}
                    </span>
                  ))}
                </span>
              </Face>
            ))}
          </span>
          {/* shadow on the table */}
          <span
            aria-hidden
            className="absolute -bottom-4 left-1/2 h-3 w-[80%] -translate-x-1/2 rounded-full bg-ink/20 blur-md transition-opacity duration-700"
            style={{ opacity: thrown ? 1 : 0, transitionDelay: `${delay + 700}ms` }}
          />
        </button>
        <span
          className="mt-7 max-w-[11rem] text-center text-sm text-muted transition-all duration-500"
          style={{ opacity: thrown ? 1 : 0, transform: thrown ? "none" : "translateY(6px)", transitionDelay: `${delay + 1100}ms` }}
        >
          {stat.label}
        </span>
      </dd>
    </div>
  );
}

function Face({ transform, children }: { transform: string; children: React.ReactNode }) {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center rounded-[20%] border border-line bg-surface shadow-[inset_0_0_14px_rgb(0_0_0/.07)]"
      style={{ transform: `${transform} translateZ(calc(var(--s) / 2))`, backfaceVisibility: "hidden" }}
    >
      {children}
    </span>
  );
}
