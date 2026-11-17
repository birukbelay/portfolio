"use client";

import { useEffect, useRef, useState } from "react";

export interface HandCard {
  rank: string;
  suit: string;
  content: React.ReactNode;
}

const isRed = (suit: string) => suit === "♥" || suit === "♦";
export const CARD_RATIO = 1.45; // height / width
const MAX_ANGLE = 45; // the first and last card lean 45°, the ones between step evenly
const PIVOT_GAP = 0.18; // pivot sits this far (× card width) below the bottom of the cards

/**
 * Playing cards held in one hand: every card turns around the same point just below the hand,
 * the outer cards at ±45°, so the tops form an arch. The cards start squared up and fan out when
 * the hand scrolls into view. One card is held raised on top; hover or tap another to pull it up.
 * On small screens the raised card's full text is also shown under the hand.
 */
export default function CardHand({
  cards,
  initialTop,
  trackId,
}: {
  cards: HandCard[];
  initialTop?: number;
  /** Element whose scroll progress raises the cards one by one, first to last. */
  trackId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<number | null>(null); // card raised by scrolling
  const [width, setWidth] = useState(0);
  const n = cards.length;

  // Scrolling through the track raises each card in turn: first → last.
  useEffect(() => {
    if (!trackId) return;
    const track = document.getElementById(trackId);
    if (!track) return;
    let frame = 0;
    let lastIdx = -1;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = track.getBoundingClientRect();
        const vh = window.innerHeight;
        // Pinned (desktop): progress through the extra scroll length of the tall track.
        // Not pinned (phones): progress as the section passes through the screen.
        const p =
          r.height > vh * 1.3
            ? -r.top / (r.height - vh)
            : (vh * 0.7 - r.top) / (r.height + vh * 0.2);
        const clamped = Math.min(1, Math.max(0, p));
        if (clamped > 0) setOpen(true);
        const idx = Math.min(n - 1, Math.floor(Math.min(0.999, Math.max(0, (clamped - 0.06) / 0.88)) * n));
        if (idx !== lastIdx) {
          if (lastIdx !== -1) setActive(null); // scrolling takes over from a card picked by hand
          lastIdx = idx;
          setScrolled(idx);
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
  }, [trackId, n]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOpen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const raised = active ?? scrolled ?? initialTop ?? 0;

  // Size the cards so the whole fan fits: the outermost top corner sits at
  // 0.707 × (w/2 + pivotDistance) from the centre, and pivotDistance = w × (ratio + gap).
  const avail = width || 520;
  const cardW = Math.round(Math.min(215, Math.max(96, (avail / 2 - 8) / (0.7071 * (0.5 + CARD_RATIO + PIVOT_GAP)))));
  const cardH = cardW * CARD_RATIO;
  const pivotDist = cardH + cardW * PIVOT_GAP; // from a card's top edge down to the shared pivot
  const lift = 0.26 * cardW; // how far the raised card is pulled up out of the hand
  const compact = cardW < 160; // too small to read the body text on the card itself
  const step = n > 1 ? (2 * MAX_ANGLE) / (n - 1) : 0;
  const height = pivotDist + lift + 24 + cardW * 0.35; // room above for the lift, below for the outer cards

  return (
    <div>
      <div
        ref={ref}
        className="relative mx-auto w-full"
        style={{ height }}
        onPointerLeave={() => setActive(null)}
      >
        {cards.map((card, i) => {
          const angle = open ? -MAX_ANGLE + i * step : (i - (n - 1) / 2) * 1.5;
          const isUp = open && raised === i;
          return (
            <div
              key={i}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onClick={() => setActive(i)}
              className="absolute left-1/2 cursor-pointer"
              style={{
                top: lift + 24,
                width: cardW,
                marginLeft: -cardW / 2,
                transformOrigin: `50% ${pivotDist}px`,
                transform: `rotate(${angle}deg) translateY(${isUp ? -lift : open ? 0 : -i * 2}px)`,
                zIndex: isUp ? 50 : i + 1,
                transition: `transform .75s cubic-bezier(.2,.85,.25,1.1) ${open && active === null ? Math.abs(i - (n - 1) / 2) * 90 : 0}ms`,
              }}
            >
              <PlayingCard card={card} width={cardW} raised={isUp} compact={compact} />
            </div>
          );
        })}
      </div>

      {/* Which card is up: dots, first → last (click to pick one) */}
      <div className="mt-1 flex items-center justify-center gap-2" aria-hidden>
        {cards.map((c, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === raised ? "w-6 bg-accent" : "w-1.5 bg-ink/20 hover:bg-ink/40"}`}
          />
        ))}
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted">
          {raised + 1} / {n}
        </span>
      </div>

      {/* Small screens: the raised card's full text, readable under the hand */}
      {compact && open && (
        <div key={raised} className="card mx-auto mt-2 max-w-sm animate-fade-up p-5 text-center">
          {cards[raised].content}
        </div>
      )}
    </div>
  );
}

export function PlayingCard({
  card,
  width,
  raised,
  compact,
  alignTop,
}: {
  card: HandCard;
  width: number;
  raised?: boolean;
  compact?: boolean;
  /** Put the content at the top of the card (for stacks where only the top strip shows). */
  alignTop?: boolean;
}) {
  const color = isRed(card.suit) ? "text-accent" : "text-ink";
  const index = (
    <>
      {card.rank}
      <span className="mt-0.5 text-[1.1em]">{card.suit}</span>
    </>
  );
  return (
    <div
      data-spotlight
      className={`relative flex flex-col ${alignTop ? "justify-start" : "justify-center"} overflow-hidden rounded-2xl border bg-surface shadow-xl transition-shadow duration-300 ${
        raised ? "border-accent/60 shadow-accent/20" : "border-line shadow-black/15"
      } ${compact ? "px-2 py-6 text-[10px]" : alignTop ? "px-4 pb-9 pt-7 text-sm" : "px-4 py-9 text-sm"}`}
      style={{ width, height: width * CARD_RATIO }}
    >
      {/* corner indices pinned to the edges so the middle gets the full height */}
      <span className={`absolute left-2.5 top-2.5 flex flex-col items-center font-mono font-bold leading-none ${color}`}>{index}</span>
      <div
        className={`flex flex-col ${
          compact
            ? "[&_h3]:mt-1.5 [&_h3]:text-[13px] [&_p]:hidden [&>span:first-child]:h-7 [&>span:first-child]:w-7"
            : width < 200
              ? "[&_p]:line-clamp-5"
              : ""
        }`}
      >
        {card.content}
      </div>
      <span className={`absolute bottom-2.5 right-2.5 flex rotate-180 flex-col items-center font-mono font-bold leading-none ${color}`}>{index}</span>
    </div>
  );
}
