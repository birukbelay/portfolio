"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LuArrowRight, LuArrowUpRight, LuGithub, LuRotateCcw, LuShuffle } from "react-icons/lu";

export interface DeckProject {
  id: string;
  name: string;
  tech: string;
  image: string;
  technologies: string[];
  desc: string;
  code?: string | null;
  demo?: string | null;
}

const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["♠", "♥", "♦", "♣"];
const isRed = (suit: string) => suit === "♥" || suit === "♦";
const clean = (t: string) => t.replace(/\s+/g, " ").trim();
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const GAP = 22;
const FELT_PAD = 22;

const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Table layout for a given width: 4 / 3 / 2 / 1 columns of 3:4 cards. */
function layout(width: number, n: number) {
  const cols = width >= 1200 ? 4 : width >= 860 ? 3 : width >= 540 ? 2 : 1;
  const cardW = width ? (width - GAP * (cols - 1)) / cols : 0;
  const cardH = cardW * (4 / 3);
  const rows = Math.ceil(n / cols);
  return { cols, cardW, cardH, rows, height: rows * cardH + (rows - 1) * GAP };
}

// A row is dealt once its top has come up past this point of the screen.
const DEAL_LINE = 0.88;
const STOCK_SCALE = 0.55;

/**
 * Projects as a Solitaire tableau on a casino table.
 * - The board starts empty: every card waits face-down in the stock (a small deck at the top).
 * - When the table scrolls into view the deck is riffle-shuffled, then the top row is dealt;
 *   each further row slides out from under the row above as you scroll down.
 * - Scrolling back up pulls the rows below the screen back up under the lowest row still in view
 *   — however many rows there are — and when the top row leaves the screen too, everything goes
 *   back into the stock, leaving the board empty for the next shuffle.
 */
export default function ProjectDeck({ projects }: { projects: DeckProject[] }) {
  const table = useRef<HTMLDivElement>(null);
  const n = projects.length;
  const [width, setWidth] = useState(0);
  const [dealtRows, setDealtRows] = useState(-1); // -1 = everything face-up (server render / no JS)
  const [instant, setInstant] = useState(true); // first placement happens without animating
  const [riffle, setRiffle] = useState<0 | 1 | 2>(0); // 1 = deck cut into two halves, 2 = halves riffling back
  const [order, setOrder] = useState(() => projects.map((_, i) => i));
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dealtRef = useRef(-1); // mirrors dealtRows for the scroll handler
  const targetRef = useRef(0); // rows the scroll position asks for
  const shuffling = useRef(false);

  const setDealt = (k: number) => {
    dealtRef.current = k;
    setDealtRows(k);
  };

  /** Riffle-shuffle the deck in the stock, then deal whatever the scroll position asks for. */
  const shuffleThenDeal = () => {
    shuffling.current = true;
    setOrder(shuffled(n));
    setRiffle(1);
    timers.current.push(
      setTimeout(() => setRiffle(2), 260),
      setTimeout(() => {
        setRiffle(0);
        shuffling.current = false;
        setDealt(targetRef.current);
      }, 620)
    );
  };

  useEffect(() => {
    const el = table.current;
    if (!el) return;
    const still = reduced();
    let frame = 0;
    let first = true;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { rows, cardH } = layout(el.clientWidth, n);
        let k = rows;
        if (!still) {
          const top = el.getBoundingClientRect().top;
          const line = window.innerHeight * DEAL_LINE;
          k = 0;
          for (let r = 0; r < rows; r++) if (top + r * (cardH + GAP) < line) k = r + 1;
        }
        targetRef.current = k;
        if (first) {
          // place the cards for the current scroll position without animating
          first = false;
          setDealt(k);
          requestAnimationFrame(() => setInstant(false));
          return;
        }
        if (shuffling.current) {
          // a shuffle is running: it deals the latest target when it finishes,
          // unless the table has been scrolled away again in the meantime
          if (k === 0) {
            timers.current.forEach(clearTimeout);
            timers.current = [];
            shuffling.current = false;
            setRiffle(0);
            setDealt(0);
          }
          return;
        }
        if (k === dealtRef.current) return;
        if (dealtRef.current === 0 && k > 0) shuffleThenDeal(); // empty board: shuffle first
        else setDealt(k);
      });
    };

    const ro = new ResizeObserver(([e]) => {
      setWidth(Math.max(0, e.contentRect.width));
      measure();
    });
    ro.observe(el);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const pending = timers.current;
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      pending.forEach(clearTimeout);
    };
    // shuffleThenDeal only uses refs and state setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const { cols, cardW, cardH, height } = layout(width, n);

  // How many rows are face-up on the table (-1 = all, before JS runs).
  const dealtCount = dealtRows < 0 ? Infinity : dealtRows;
  const stackRow = Math.max(0, dealtCount - 1); // the row the undealt cards wait under

  /** "Deal again": everything back into the stock, then shuffle and deal. */
  const redeal = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFlipped(new Set());
    if (reduced()) {
      setOrder(shuffled(n));
      return;
    }
    shuffling.current = true;
    setDealt(0);
    timers.current.push(setTimeout(shuffleThenDeal, 650));
  };

  if (!n) return null;

  return (
    <div>
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-4 px-[18px] sm:px-4 lg:px-3 xl:px-0">
        <p className="text-sm text-muted">Shuffled and dealt as you scroll · tap a card to turn it over, tap again to turn it back.</p>
        <button type="button" onClick={redeal} disabled={riffle > 0} className="btn-ghost px-4 py-2 text-xs disabled:opacity-50">
          <LuShuffle size={14} /> Deal again
        </button>
      </div>

      {/* The table: felt with a padded rail */}
      <div
        className="relative rounded-[24px] border-[6px] border-[#3b2414] sm:rounded-[28px] sm:border-[8px] shadow-[inset_0_0_80px_rgb(0_0_0/.55),0_20px_50px_-20px_rgb(0_0_0/.5)] ring-1 ring-black/40"
        style={{
          padding: `clamp(10px, 1.6vw, ${FELT_PAD}px)`,
          background:
            "radial-gradient(ellipse at 50% 35%, #1d7a4f 0%, #0f5a37 55%, #0a3f27 100%), repeating-linear-gradient(45deg, rgb(255 255 255 / .02) 0 2px, transparent 2px 4px)",
        }}
      >
        {/* table markings */}
        <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[22px] border border-[#e8d9a8]/15" />
        <p aria-hidden className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-[#e8d9a8]/35">
          ♠ ♥ &nbsp;Selected work&nbsp; ♦ ♣
        </p>

        <div ref={table} className="relative" style={{ height: width ? height : undefined }}>
          {/* Before the table is measured (or without JS) fall back to a normal grid */}
          <div className={width ? "contents" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
            {projects.map((p, i) => {
              const slot = order.indexOf(i);
              const col = slot % cols;
              const row = Math.floor(slot / cols);
              const dealt = row < dealtCount;
              const x = col * (cardW + GAP);
              let transform: string;
              let z: number;
              let delay: number;

              if (dealtCount === 0) {
                // Empty board: the stock, a small face-down deck at the top centre of the felt.
                // During the riffle the deck is cut into two halves that pull apart, then interleave.
                const half = slot < n / 2 ? -1 : 1;
                const sx = (width - cardW * STOCK_SCALE) / 2 + (riffle === 1 ? half * cardW * 0.42 : 0);
                const rot = riffle === 1 ? half * 9 : -2;
                transform = `translate(${sx - slot * 0.6}px, ${8 - slot * 0.8}px) rotate(${rot}deg) scale(${STOCK_SCALE})`;
                z = riffle === 2 ? n - (slot % Math.ceil(n / 2)) * 2 - (slot < n / 2 ? 0 : 1) : n - slot; // interleave
                delay = riffle === 2 ? (slot % Math.ceil(n / 2)) * 40 : riffle === 1 ? 0 : (n - 1 - slot) * 35;
              } else if (dealt) {
                transform = `translate(${x}px, ${row * (cardH + GAP)}px)`;
                z = 60;
                delay = col * 90; // dealt left to right
              } else {
                // Not dealt yet: waiting face-down under the lowest dealt row, in its own column,
                // each one peeking out a little lower than the one above it, like a Solitaire stack.
                const depth = row - stackRow;
                transform = `translate(${x}px, ${stackRow * (cardH + GAP) + depth * 10}px)`;
                z = 50 - depth;
                delay = (cols - 1 - col) * 55; // pulled back up right to left
              }

              const style: React.CSSProperties = width
                ? {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: cardW,
                    height: cardH,
                    zIndex: z,
                    transform,
                    transformOrigin: "top left",
                    transition: instant ? "none" : `transform ${riffle ? 0.28 : dealt ? 0.55 : 0.5}s cubic-bezier(.25,.8,.25,1) ${delay}ms`,
                  }
                : {};

              return (
                <div key={p.id} style={style} className={width ? "" : "aspect-[3/4]"}>
                  <TableCard
                    project={p}
                    rank={RANKS[i % RANKS.length]}
                    suit={SUITS[i % 4]}
                    faceUp={dealt}
                    instant={instant}
                    flipDelay={col * 90 + 200} // turns over as it lands
                    flipped={dealt && flipped.has(p.id)}
                    onToggle={() =>
                      dealt &&
                      setFlipped((prev) => {
                        const next = new Set(prev);
                        if (next.has(p.id)) next.delete(p.id);
                        else next.add(p.id);
                        return next;
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableCard({
  project,
  rank,
  suit,
  faceUp,
  instant,
  flipDelay,
  flipped,
  onToggle,
}: {
  project: DeckProject;
  rank: string;
  suit: string;
  faceUp: boolean;
  instant: boolean;
  flipDelay: number;
  flipped: boolean;
  onToggle: () => void;
}) {
  const showBack = !faceUp || flipped;
  const color = isRed(suit) ? "text-accent" : "text-ink";
  const transition = instant
    ? "none"
    : faceUp && !flipped
      ? `transform .7s cubic-bezier(.3,.75,.25,1.08) ${flipDelay}ms`
      : "transform .5s cubic-bezier(.3,.7,.25,1)";

  return (
    <div className="group relative h-full w-full [perspective:1400px]">
      <div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ transform: `rotateY(${showBack ? 180 : 0}deg)`, transition }}
      >
        {/* ---------- Face ---------- */}
        <div inert={showBack} className="absolute inset-0 [backface-visibility:hidden]">
          <button
            type="button"
            onClick={onToggle}
            aria-label={`${project.name}: show details`}
            className="flex h-full w-full flex-col rounded-2xl border border-black/10 bg-surface p-4 text-left shadow-[0_10px_25px_-8px_rgb(0_0_0/.6)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_40px_-10px_rgb(0_0_0/.7)]"
          >
            <div className="flex items-start justify-between">
              <CardIndex rank={rank} suit={suit} color={color} />
              <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted opacity-0 transition group-hover:opacity-100">
                Turn over
              </span>
            </div>
            <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl bg-line/40 ring-1 ring-line">
              <Image src={project.image} alt={project.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
            </div>
            <h3 className="mt-4 font-display text-[1.6rem] leading-tight tracking-tight text-ink">{project.name}</h3>
            <p className="mt-1 line-clamp-1 font-mono text-xs text-muted">{project.tech}</p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
                    {t}
                  </span>
                ))}
                {project.technologies.length > 3 && <span className="self-center font-mono text-[11px] text-muted">+{project.technologies.length - 3}</span>}
              </div>
              <span className="rotate-180">
                <CardIndex rank={rank} suit={suit} color={color} />
              </span>
            </div>
          </button>
        </div>

        {/* ---------- Back: card back while shuffling / dealing, details when turned over ---------- */}
        <div
          inert={!(flipped && faceUp)}
          onClick={(e) => {
            // tapping the turned-over card anywhere (except its links/buttons) turns it back
            if (!(e.target as HTMLElement).closest("a, button")) onToggle();
          }}
          className="absolute inset-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#7a1020] text-white shadow-[0_10px_25px_-8px_rgb(0_0_0/.6)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <div
            aria-hidden
            className="absolute inset-2.5 rounded-xl border border-white/40 transition-opacity duration-500"
            style={{
              opacity: flipped && faceUp ? 0.15 : 1,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgb(255 255 255 / .16) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, rgb(255 255 255 / .16) 0 2px, transparent 2px 9px)",
            }}
          />
          {flipped && faceUp ? (
            <div className="relative flex h-full animate-fade-in flex-col bg-[#4a0a14]/70 p-5">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-white/80">
                  {rank}
                  {suit}
                </span>
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label={`${project.name}: turn back over`}
                  className="flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1 text-[11px] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <LuRotateCcw size={12} /> Turn back
                </button>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight">{project.name}</h3>
              <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-white/80">{clean(project.desc)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 6).map((t) => (
                  <span key={t} className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] text-white/80">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Link href={`/${project.id}`} className="btn bg-white px-4 py-2 text-xs text-[#4a0a14] hover:bg-white/90">
                  Case study <LuArrowRight size={14} />
                </Link>
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noreferrer" className="btn border border-white/25 px-4 py-2 text-xs text-white hover:bg-white/10">
                    Live <LuArrowUpRight size={14} />
                  </a>
                )}
                {project.code && (
                  <a href={project.code} target="_blank" rel="noreferrer" className="btn border border-white/25 px-4 py-2 text-xs text-white hover:bg-white/10">
                    <LuGithub size={14} /> Code
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div aria-hidden className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-[#7a1020] font-display text-xl text-white">BK</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardIndex({ rank, suit, color }: { rank: string; suit: string; color: string }) {
  return (
    <span className={`flex flex-col items-center font-mono text-sm font-bold leading-none ${color}`}>
      {rank}
      <span className="mt-0.5 text-base">{suit}</span>
    </span>
  );
}
