"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PIECE_GLYPH, type Piece } from "@/lib/chess";

const PIECE_LABEL: Record<Piece, string> = {
  pawn: "Pawn · first steps",
  knight: "Knight · leaps",
  bishop: "Bishop · diagonals",
  rook: "Rook · straight lines",
  queen: "Queen · any direction",
  king: "King · current role",
};

type Sq = [number, number]; // [col, row] on a 5×5 board, row 0 at the top
const SIZE = 5;
const C: Sq = [2, 2];
const inside = ([c, r]: Sq) => c >= 0 && r >= 0 && c < SIZE && r < SIZE;
const same = (a: Sq, b: Sq) => a[0] === b[0] && a[1] === b[1];
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function legalMoves(piece: Piece, from: Sq): Sq[] {
  const [c, r] = from;
  const rays = (dirs: Sq[]) =>
    dirs.flatMap(([dc, dr]) => Array.from({ length: SIZE }, (_, k) => [c + dc * (k + 1), r + dr * (k + 1)] as Sq).filter(inside));
  const steps = (dirs: Sq[]) => dirs.map(([dc, dr]) => [c + dc, r + dr] as Sq).filter(inside);
  switch (piece) {
    case "pawn":
      return steps([[0, -1]]);
    case "knight":
      return steps([[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]);
    case "bishop":
      return rays([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    case "rook":
      return rays([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    case "queen":
      return rays([[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    case "king":
      return steps([[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]);
  }
}

/** The loop each piece plays: squares it visits and an opponent piece it captures on the way. */
function scenario(piece: Piece): { start: Sq; path: Sq[]; enemy: Sq } {
  switch (piece) {
    case "pawn":
      return { start: [2, 4], path: [[2, 3], [2, 2], [2, 1], [2, 0]], enemy: [1, 1] };
    case "knight":
      return { start: C, path: [[3, 0], [1, 1], [3, 2], [4, 4], [2, 3], C], enemy: [1, 1] };
    case "bishop":
      return { start: C, path: [[4, 0], [1, 3], [0, 2], C], enemy: [1, 3] };
    case "rook":
      return { start: C, path: [[2, 0], [4, 0], [4, 3], [0, 3], C], enemy: [4, 3] };
    case "queen":
      return { start: C, path: [[4, 4], [4, 0], [0, 4], [0, 0], C], enemy: [4, 0] };
    case "king":
      return { start: C, path: [[3, 1], [3, 2], [2, 3], [1, 2], C], enemy: [3, 2] };
  }
}

/** Squares the piece passes through: knights go round the corner of their L. */
function route(piece: Piece, from: Sq, to: Sq): Sq[] {
  if (piece !== "knight") return [from, to];
  const dc = to[0] - from[0];
  const dr = to[1] - from[1];
  const corner: Sq = Math.abs(dc) === 2 ? [to[0], from[1]] : [from[0], to[1]];
  return Math.abs(dc) + Math.abs(dr) === 3 ? [from, corner, to] : [from, to];
}

const squareTransform = ([c, r]: Sq, square: number) => `translate(${c * square + 1}px, ${r * square + 1}px)`;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A 5×5 mini board that shows how a piece moves, looping while it's on screen. */
export default function ChessMoves({ piece, square = 22 }: { piece: Piece; square?: number }) {
  const { start, path, enemy } = useMemo(() => scenario(piece), [piece]);
  // step -1 = on the start square; `from` = the square the piece just left
  const [move, setMove] = useState<{ step: number; from: Sq }>({ step: -1, from: start });
  const ref = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced()) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        clearInterval(timer);
        if (e.isIntersecting)
          timer = setInterval(
            () =>
              setMove((m) => ({
                step: m.step + 1 >= path.length ? -1 : m.step + 1,
                from: m.step < 0 ? start : path[m.step],
              })),
            1150
          );
      },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [path.length, start, path]);

  const { step, from } = move;
  const pos = step < 0 ? start : path[step];
  const way = step < 0 ? [pos] : route(piece, from, pos);
  const px = (sq: Sq) => squareTransform(sq, square);
  const center = ([c, r]: Sq) => `${c * square + square / 2 + 1},${r * square + square / 2 + 1}`;

  // Glide the piece along its route (with a hop at the knight's corner).
  useIsoLayoutEffect(() => {
    const el = pieceRef.current;
    if (!el) return;
    const target = move.step < 0 ? start : path[move.step];
    const points = move.step < 0 ? [target] : route(piece, move.from, target);
    if (points.length > 1 && !reduced()) {
      const frames = points.map((sq, k) => ({
        transform: `${squareTransform(sq, square)} scale(${points.length === 3 && k === 1 ? 1.35 : 1})`,
        offset: points.length === 3 ? [0, 0.45, 1][k] : k,
      }));
      el.animate(frames, { duration: points.length === 3 ? 700 : 560, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    } else {
      el.getAnimations().forEach((a) => a.cancel());
      el.style.transform = squareTransform(target, square);
    }
  }, [move, piece, square, start, path]);

  const capturedNow = step >= 0 && same(pos, enemy);
  const captured = path.slice(0, step + 1).some((s) => same(s, enemy));
  const promoted = piece === "pawn" && pos[1] === 0;
  const dots = legalMoves(promoted ? "queen" : piece, pos);

  return (
    <figure ref={ref} aria-hidden className="flex flex-col items-center">
      <div className="relative overflow-hidden rounded-lg border border-line shadow-md" style={{ width: square * SIZE + 2, height: square * SIZE + 2 }}>
        {/* squares */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, ${square}px)` }}>
          {Array.from({ length: SIZE * SIZE }, (_, i) => {
            const sq: Sq = [i % SIZE, Math.floor(i / SIZE)];
            const dark = (sq[0] + sq[1]) % 2 === 1;
            const isFrom = step >= 0 && same(sq, from) && !same(from, pos);
            const isTo = step >= 0 && same(sq, pos);
            return (
              <span
                key={i}
                className={`relative transition-colors duration-500 ${dark ? "bg-ink/[.16]" : "bg-surface"} ${isFrom ? "!bg-accent/20" : ""} ${isTo ? "!bg-accent/30" : ""}`}
                style={{ width: square, height: square }}
              >
                {dots.some((d) => same(d, sq)) && <span className="absolute inset-0 m-auto h-[26%] w-[26%] animate-fade-in rounded-full bg-accent/50" />}
              </span>
            );
          })}
        </div>

        {/* trail of the last move, drawn along the route then fading */}
        {way.length > 1 && (
          <svg key={`trail-${step}`} className="pointer-events-none absolute inset-0 animate-trail-fade" width="100%" height="100%">
            <polyline
              points={way.map(center).join(" ")}
              fill="none"
              stroke="rgb(var(--c-accent))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="200"
              className="animate-trail-draw"
            />
          </svg>
        )}

        {/* landing pulse */}
        {step >= 0 && (
          <span
            key={`pulse-${step}`}
            className="pointer-events-none absolute left-0 top-0 animate-land-pulse rounded-full border-2 border-accent"
            style={{ width: square, height: square, transform: px(pos), animationDelay: way.length === 3 ? "650ms" : "500ms" }}
          />
        )}

        {/* opponent piece: knocked off the board when captured */}
        <span
          className="absolute left-0 top-0 flex items-center justify-center leading-none text-muted"
          style={{
            width: square,
            height: square,
            fontSize: square * 0.78,
            transform: `${px(enemy)} ${captured ? "translate(30px,-40px) rotate(220deg) scale(.4)" : ""}`,
            opacity: captured ? 0 : 0.85,
            transition: `transform .6s cubic-bezier(.3,.6,.4,1) ${capturedNow ? 450 : 0}ms, opacity .5s ${capturedNow ? 550 : 0}ms`,
          }}
        >
          ♟
        </span>

        {/* the moving piece */}
        <span
          ref={pieceRef}
          className="absolute left-0 top-0 flex items-center justify-center leading-none text-accent [filter:drop-shadow(0_2px_3px_rgb(0_0_0/.35))]"
          style={{ width: square, height: square, fontSize: square * 0.88, transform: px(start) }}
        >
          <span key={promoted ? "q" : "p"} className={promoted ? "animate-promote" : ""}>
            {promoted ? PIECE_GLYPH.queen : PIECE_GLYPH[piece]}
          </span>
        </span>
      </div>
      <figcaption className="mt-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-muted">
        {promoted ? "Pawn · promoted!" : PIECE_LABEL[piece]}
      </figcaption>
    </figure>
  );
}
