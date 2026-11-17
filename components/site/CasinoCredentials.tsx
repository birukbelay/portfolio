"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LuArrowUpRight, LuBadgeCheck, LuGraduationCap, LuTrophy } from "react-icons/lu";
import { AWARDS, CERTIFICATIONS, EDUCATION } from "@/data/credentials";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True once the element has scrolled into view (stays true). */
function useSeen<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

// Deterministic 0..1 noise (same on server and client), used for confetti and coin spreads.
const rnd = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x); // deterministic 0..1 (same on server and client)
};

// ================================================================ Slot machine
type SlotSymbol = { key: string; node: React.ReactNode };
const SYMBOLS: SlotSymbol[] = [
  { key: "grad", node: <LuGraduationCap size={30} /> },
  { key: "seven", node: <span className="font-display text-4xl leading-none">7</span> },
  { key: "check", node: <LuBadgeCheck size={30} /> },
  { key: "spade", node: <span className="text-3xl leading-none">♠</span> },
  { key: "trophy", node: <LuTrophy size={30} /> },
  { key: "heart", node: <span className="text-3xl leading-none text-[#e5484d]">♥</span> },
  { key: "diamond", node: <span className="text-3xl leading-none text-[#e5484d]">♦</span> },
];
const RESULT = ["grad", "check", "trophy"]; // matches Education · Certifications · Wins below
const CELL = 64;
const LOOPS = 4; // the strip repeats the symbols this many times so the reel can spin

function Reel({ target, spin, index, onStop }: { target: string; spin: number; index: number; onStop: () => void }) {
  const strip = useRef<HTMLDivElement>(null);
  const finalIndex = (LOOPS - 1) * SYMBOLS.length + SYMBOLS.findIndex((s) => s.key === target);
  const final = `translateY(${-finalIndex * CELL}px)`;

  useEffect(() => {
    const el = strip.current;
    if (!el || spin === 0) return;
    const anim = el.animate([{ transform: "translateY(0)" }, { transform: final }], {
      duration: 1300 + index * 450,
      easing: "cubic-bezier(.15,.85,.25,1.06)", // fast spin, then settles with a little bounce
    });
    anim.onfinish = onStop;
    return () => anim.cancel();
    // onStop is stable enough for a one-shot animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin, final, index]);

  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-b from-zinc-200 via-white to-zinc-200 text-zinc-900 shadow-inner ring-2 ring-black/40">
      <div ref={strip} style={{ transform: final }}>
        {Array.from({ length: LOOPS }).flatMap((_, l) =>
          SYMBOLS.map((s) => (
            <div key={`${l}-${s.key}`} className="flex h-16 w-16 items-center justify-center">
              {s.node}
            </div>
          ))
        )}
      </div>
      {/* glass shine */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25" />
    </div>
  );
}

/** A three-reel slot machine that spins when it scrolls into view and lands on 🎓 ✓ 🏆. */
export function SlotMachine() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.5);
  const [spin, setSpin] = useState(0);
  const [stopped, setStopped] = useState(0);
  const [pull, setPull] = useState(false);

  useEffect(() => {
    if (seen) setTimeout(() => setSpin(1), 0);
  }, [seen]);

  const spinAgain = () => {
    if (stopped < 3 && spin > 0) return; // still spinning
    setStopped(0);
    setPull(true);
    setTimeout(() => setPull(false), 350);
    setSpin((s) => s + 1);
    pullLever(); // the credential lists below roll with the reels
  };

  const jackpot = spin > 0 && stopped >= 3;

  return (
    <div ref={ref} className="flex items-center gap-2 self-start md:self-auto" aria-label="Slot machine showing education, certification and trophy symbols">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#f2c94c] via-[#c8962c] to-[#8a5a12] p-[3px] shadow-xl shadow-black/30">
        {/* jackpot: coins pour out of the machine */}
        {jackpot && (
          <span key={`rain-${spin}`} aria-hidden className="pointer-events-none absolute inset-x-2 top-full z-20 h-0">
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                className="absolute top-0 h-3.5 w-3.5 animate-coin-fall rounded-full border border-[#8a5a12] bg-[radial-gradient(circle_at_35%_30%,#fff3b0,#f2c94c_50%,#b07d1a)] shadow"
                style={{ left: `${rnd(i, spin) * 92}%`, animationDelay: `${Math.round(rnd(i, spin + 9) * 900)}ms` }}
              />
            ))}
          </span>
        )}
        <div className="rounded-[14px] bg-[#1a0f0a] px-3 pb-2 pt-1.5">
          {/* marquee bulbs */}
          <div className="mb-1.5 flex justify-between px-1" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${jackpot ? "animate-bulb" : ""} ${i % 2 ? "bg-[#ffd76a]" : "bg-[#ff6a3d]"}`}
                style={{ animationDelay: `${(i % 3) * 120}ms` }}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {RESULT.map((t, i) => (
              <Reel key={i} index={i} target={t} spin={spin} onStop={() => setStopped((s) => s + 1)} />
            ))}
          </div>
          <p
            className={`mt-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.35em] transition-colors duration-300 ${
              jackpot ? "animate-bulb text-[#ffd76a]" : "text-[#ffd76a]/30"
            }`}
          >
            Jackpot
          </p>
        </div>
      </div>
      {/* lever: pull to spin again */}
      <button type="button" onClick={spinAgain} aria-label="Pull the lever to spin the reels and the credential lists" className="group flex h-28 flex-col items-center">
        <span
          className={`h-4 w-4 rounded-full bg-gradient-to-br from-[#ff6a5a] to-[#b3261e] shadow-md transition-transform duration-300 ${
            pull ? "translate-y-14" : "group-hover:-translate-y-0.5"
          }`}
        />
        <span className={`w-1.5 origin-top rounded-full bg-zinc-400 transition-all duration-300 ${pull ? "h-1" : "h-14"}`} />
        <span className="h-5 w-3 rounded-sm bg-zinc-600" />
      </button>
    </div>
  );
}

// ================================================================ Celebration
const CONFETTI = ["#f2c94c", "#e5484d", "#48cae4", "#22c55e", "#f05a28", "#a78bfa"];

/** A burst of confetti and little gold coins from the centre of its parent. */
function Burst({ count = 24, delay = 0, seed = 1 }: { count?: number; delay?: number; seed?: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + rnd(i, seed) * 0.6;
        const dist = 38 + rnd(i, seed + 1) * 52;
        const coin = i % 4 === 0;
        return (
          <span
            key={i}
            className={`absolute left-0 top-0 animate-burst ${coin ? "h-2.5 w-2.5 rounded-full border border-[#8a5a12] bg-[#f2c94c]" : "h-2 w-1 rounded-[1px]"}`}
            style={
              {
                background: coin ? undefined : CONFETTI[i % CONFETTI.length],
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist - 18}px`,
                "--rot": `${Math.round(rnd(i, seed + 2) * 720 - 360)}deg`,
                animationDelay: `${delay + rnd(i, seed + 3) * 120}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

// ================================================================ Rolling lists
// The lever on the slot machine rolls every credential list too. A tiny store shared by both.
let leverPulls = 0;
const leverSubs = new Set<() => void>();
const pullLever = () => {
  leverPulls += 1;
  leverSubs.forEach((f) => f());
};
const subscribeLever = (cb: () => void) => {
  leverSubs.add(cb);
  return () => {
    leverSubs.delete(cb);
  };
};
const useLeverPulls = () => useSyncExternalStore(subscribeLever, () => leverPulls, () => 0);

const rotate = <T,>(list: readonly T[], k: number) => list.map((_, i) => list[(i + k) % list.length]);
const COPIES = 3; // copies of the list stacked above the real one, so the reel has something to spin through

/**
 * A list on a slot reel: when it rolls, copies of the list (in shuffled order) whiz past and the
 * real list lands with a bounce, like the jackpot reels. It rolls when it first scrolls into view
 * and every time the slot machine's lever is pulled. `render(live, shift)` draws the list: `live`
 * is true right after a landing (play the landing celebration), `shift` rotates the order for the
 * copies.
 */
function ListReel({ index, render }: { index: number; render: (live: boolean, shift: number) => React.ReactNode }) {
  const [ref, seen] = useSeen<HTMLDivElement>(0.3);
  const pulls = useLeverPulls();
  const roll = seen ? pulls + 1 : 0;
  const [landed, setLanded] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const spinning = roll > 0 && roll !== landed;

  useEffect(() => {
    const el = strip.current;
    if (!el || roll === 0) return;
    const anim = el.animate(
      [
        { transform: "translateY(280%)", filter: "blur(0)" },
        { transform: "translateY(200%)", filter: "blur(2px)", offset: 0.25 },
        { transform: "translateY(8%)", filter: "blur(1px)", offset: 0.8 },
        { transform: "translateY(0)", filter: "blur(0)" },
      ],
      { duration: 1500 + index * 450, easing: "cubic-bezier(.2,.75,.3,1.08)" } // stops one after another, like the reels
    );
    anim.onfinish = () => setLanded(roll);
    return () => anim.cancel();
  }, [roll, index]);

  return (
    // clip only while spinning, so landing confetti can fly past the edges afterwards
    <div ref={ref} className={`relative ${spinning ? "overflow-hidden" : ""}`}>
      <div ref={strip}>
        {spinning && (
          <div aria-hidden inert className="absolute inset-x-0 bottom-full flex flex-col gap-6 pb-6 opacity-70">
            {Array.from({ length: COPIES }, (_, k) => (
              <div key={k}>{render(false, k + 1)}</div>
            ))}
          </div>
        )}
        <div key={landed}>{render(!spinning && landed > 0, 0)}</div>
      </div>
      {/* reel-window shading while it spins */}
      {spinning && (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface opacity-80" />
      )}
    </div>
  );
}

// ================================================================ Columns
function Column({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    // not overflow-hidden: confetti may fly past the card's edges
    <div data-spotlight className="card" style={{ transitionDelay: `${delay}ms` }}>
      {/* felt header band */}
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-black/20 bg-[radial-gradient(ellipse_at_30%_0%,#1d7a4f,#0f5a37_70%)] px-6 py-3 font-mono text-xs uppercase tracking-wider text-[#f3e6bf]">
        {icon} {title}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const EDU_RANKS = [
  ["A", "♠"],
  ["K", "♥"],
  ["Q", "♦"],
];

/** Education: the list rolls; when it lands each entry's playing card turns face-up and the cap is tossed. */
function EducationColumn() {
  return (
    <Column icon={<LuGraduationCap size={15} />} title="Education">
      <ListReel
        index={0}
        render={(live, shift) => (
          <ul className="relative space-y-6">
            {/* gold thread linking the entries */}
            <span
              aria-hidden
              className={`absolute bottom-8 left-[17px] top-8 w-0 origin-top border-l-2 border-dotted border-[#c8962c]/60 ${live ? "animate-draw-down" : ""}`}
              style={{ animationDelay: "500ms" }}
            />
            {rotate(EDUCATION, shift).map((e) => {
              const i = EDUCATION.indexOf(e);
              const [rank, suit] = EDU_RANKS[i % EDU_RANKS.length];
              const red = suit === "♥" || suit === "♦";
              return (
                <li key={e.title} className="relative flex gap-4">
                  {/* the card: lands face-down, then turns over */}
                  <span aria-hidden className="mt-0.5 shrink-0 [perspective:300px]">
                    <span
                      className={`relative block h-12 w-9 [transform-style:preserve-3d] ${live ? "animate-card-turn" : ""}`}
                      style={{ animationDelay: `${i * 220}ms` }}
                    >
                      <span
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-md border border-line bg-surface font-mono text-xs font-bold leading-none shadow-md [backface-visibility:hidden] ${red ? "text-[#e5484d]" : "text-ink"}`}
                      >
                        {rank}
                        <span className="mt-0.5 text-sm">{suit}</span>
                      </span>
                      <span
                        className="absolute inset-0 rounded-md border border-white/20 bg-[#7a1020] shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]"
                        style={{ backgroundImage: "repeating-linear-gradient(45deg, rgb(255 255 255 / .18) 0 2px, transparent 2px 6px)" }}
                      />
                    </span>
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold leading-snug text-ink">
                      {e.title}
                      {live && i === 0 && (
                        <span aria-hidden className="inline-block animate-cap-toss text-[#c8962c]" style={{ animationDelay: "300ms" }}>
                          <LuGraduationCap size={14} />
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{e.place}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{e.period}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      />
    </Column>
  );
}

const CHIP: Record<string, { color: string; label: string }> = {
  "Amazon Web Services": { color: "#f59e0b", label: "AWS" },
  "The Linux Foundation": { color: "#2563eb", label: "LF" },
  NVIDIA: { color: "#65a30d", label: "NV" },
  MongoDB: { color: "#047857", label: "MDB" },
};

/** A casino chip that hops and spins when its reel lands; spins again on hover. */
function Chip({ issuer, live, delay }: { issuer: string; live: boolean; delay: number }) {
  const chip = CHIP[issuer] ?? { color: "#7c3aed", label: issuer.slice(0, 3).toUpperCase() };
  return (
    // outer layer spins on landing; inner layer spins on hover
    <span aria-hidden className={`shrink-0 ${live ? "animate-chip-spin" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      <span
        className="relative flex h-10 w-10 items-center justify-center rounded-full shadow-[0_3px_0_rgb(0_0_0/.35)] transition-transform duration-700 group-hover:rotate-[360deg]"
        style={{ background: `repeating-conic-gradient(${chip.color} 0 22.5deg, #fff 22.5deg 30deg, ${chip.color} 30deg 45deg)` }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-white/70 font-mono text-[9px] font-bold text-white" style={{ background: chip.color }}>
          {chip.label}
        </span>
      </span>
    </span>
  );
}

/** Certifications: the list rolls; when it lands every chip hops and spins, one after another. */
function CertificationsColumn() {
  return (
    <Column icon={<LuBadgeCheck size={15} />} title="Certifications" delay={80}>
      <ListReel
        index={1}
        render={(live, shift) => (
          <ul className="space-y-3.5">
            {rotate(CERTIFICATIONS, shift).map((c, i) => {
              const body = (
                <>
                  <Chip issuer={c.issuer} live={live} delay={i * 120} />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-medium leading-snug text-ink ${c.url ? "group-hover:underline" : ""}`}>{c.name}</span>
                    <span className="text-sm text-muted">{c.issuer}</span>
                  </span>
                  {c.url && <LuArrowUpRight size={15} className="mt-1 shrink-0 text-muted transition group-hover:text-accent" />}
                </>
              );
              return (
                <li key={c.name}>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className="group flex items-start gap-3">
                      {body}
                    </a>
                  ) : (
                    <span className="group flex items-start gap-3">{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      />
    </Column>
  );
}

/** Wins: the list rolls; when it lands each gold "1st" coin flips and celebrates. Click a coin to celebrate again. */
function AwardsColumn() {
  const [replays, setReplays] = useState<number[]>(() => AWARDS.map(() => 0));
  return (
    <Column icon={<LuTrophy size={15} />} title="Wins" delay={160}>
      <ListReel
        index={2}
        render={(live, shift) => (
          <ul className="space-y-6">
            {rotate(AWARDS, shift).map((a) => {
              const i = AWARDS.indexOf(a);
              const replay = live ? replays[i] : 0;
              const party = live || replay > 0;
              const wait = replay ? 0 : i * 250; // replays start right away
              return (
                <li key={a.title} className="flex gap-4">
                  <button
                    type="button"
                    aria-label={`Celebrate: ${a.title}`}
                    onClick={() => setReplays((r) => r.map((v, j) => (j === i ? v + 1 : v)))}
                    className="relative mt-0.5 h-12 w-12 shrink-0 [perspective:400px]"
                  >
                    <span
                      key={`coin-${replay}`}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8a5a12] bg-[radial-gradient(circle_at_35%_30%,#fff3b0,#f2c94c_45%,#b07d1a)] font-display text-lg text-[#5a3a08] shadow-[0_3px_0_#7a4f10] ${party ? "animate-coin-flip" : ""}`}
                      style={{ animationDelay: `${wait}ms` }}
                    >
                      1<sup className="text-[9px]">st</sup>
                    </span>
                    {party && (
                      <span key={`party-${replay}`}>
                        <span className="absolute inset-0 animate-sparkle rounded-full" style={{ animationDelay: `${wait + 1100}ms` }} />
                        <Burst delay={wait + 1100} seed={i * 7 + replay * 3 + 1} />
                      </span>
                    )}
                  </button>
                  <div>
                    <p className="font-semibold leading-snug text-ink">{a.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{a.detail}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{a.year}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      />
    </Column>
  );
}

/** The three credential cards, casino style. */
export function CredentialCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <EducationColumn />
      <CertificationsColumn />
      <AwardsColumn />
    </div>
  );
}
