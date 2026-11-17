"use client";

import { useEffect, useRef, useState } from "react";
import ExperienceEntry, { type ExperienceData } from "./ExperienceEntry";
import ChessMoves from "./ChessMoves";
import { PIECE_GLYPH, pieceFor, type Piece } from "@/lib/chess";

const NAME: Record<Piece, string> = { pawn: "Pawn", knight: "Knight", bishop: "Bishop", rook: "Rook", queen: "Queen", king: "King" };
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The experience timeline as a chess promotion: every role has a piece (current role = king,
 * earliest = pawn) and its own board. A piece rides the tip of the timeline as you scroll and
 * transforms into the next role's piece as it passes each one, so you can see the transition.
 */
export default function ChessTimeline({ items }: { items: (ExperienceData & { id: string })[] }) {
  const n = items.length;
  const pieces = items.map((_, i) => pieceFor(i, n));
  const wrap = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const rider = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    let frame = 0;
    let current = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = rail.current?.getBoundingClientRect();
        if (!r) return;
        const anchor = window.innerHeight * 0.6;
        const progress = reduced() ? 1 : Math.min(1, Math.max(0, (anchor - r.top) / r.height));
        if (fill.current) fill.current.style.transform = `scaleY(${progress})`;
        if (rider.current) {
          rider.current.style.top = `${progress * 100}%`;
          rider.current.style.opacity = progress > 0.005 ? "1" : "0";
        }
        // The role whose marker has passed the anchor line most recently is the active one.
        let idx = 0;
        rows.current.forEach((row, i) => {
          if (row && row.getBoundingClientRect().top < anchor) idx = i;
        });
        if (idx !== current) {
          setPrev(current);
          current = idx;
          setActive(idx);
        }
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

  const piece = pieces[active];

  return (
    <div ref={wrap} className="relative mx-auto max-w-5xl space-y-14">
      {items.map((exp, i) => {
        const p = pieces[i];
        const isActive = i === active;
        const passed = i < active;
        return (
          <div
            key={exp.id}
            ref={(el) => {
              rows.current[i] = el;
            }}
            data-reveal
            className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10"
          >
            <ExperienceEntry
              data={exp}
              maxTasks={3}
              marker={
                <span
                  aria-hidden
                  title={NAME[p]}
                  className={`absolute -left-[8px] -top-0.5 flex h-[27px] w-[27px] items-center justify-center rounded-full text-[17px] leading-none ring-4 ring-paper transition-all duration-500 ${
                    isActive
                      ? "scale-110 bg-accent text-accent-ink shadow-lg shadow-accent/40"
                      : passed
                        ? "border border-accent/50 bg-surface text-accent"
                        : "border border-line bg-surface text-ink"
                  }`}
                >
                  {PIECE_GLYPH[p]}
                </span>
              }
            />
            <div className={`hidden pt-1 transition-opacity duration-500 sm:block md:pt-0 ${isActive ? "opacity-100" : "opacity-60"}`}>
              <ChessMoves piece={p} />
            </div>
          </div>
        );
      })}

      {/* rail + the promoting rider */}
      <div ref={rail} aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line">
        <div ref={fill} className="h-full w-full origin-top bg-gradient-to-b from-accent to-accent/40" style={{ transform: "scaleY(0)" }} />
        <div ref={rider} className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300" style={{ top: 0, opacity: 0 }}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xl leading-none text-accent-ink shadow-xl shadow-accent/40 ring-4 ring-paper">
            {/* burst ring on every transformation */}
            <span key={`burst-${active}`} className="absolute inset-0 animate-land-pulse rounded-full border-2 border-accent" />
            {prev !== null && (
              <span key={`out-${active}`} className="absolute animate-piece-out">
                {PIECE_GLYPH[pieces[prev]]}
              </span>
            )}
            <span key={`in-${active}`} className={prev !== null ? "animate-promote" : ""}>
              {PIECE_GLYPH[piece]}
            </span>
          </div>
          {/* label showing the transition */}
          <div
            key={`label-${active}`}
            className="absolute left-12 top-1/2 hidden -translate-y-1/2 animate-fade-in whitespace-nowrap rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted shadow-sm lg:block"
          >
            {prev !== null ? (
              <>
                {PIECE_GLYPH[pieces[prev]]} {NAME[pieces[prev]]} <span className="text-accent">→</span> {PIECE_GLYPH[piece]} {NAME[piece]}
              </>
            ) : (
              <>
                {PIECE_GLYPH[piece]} {NAME[piece]}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
