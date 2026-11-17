"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_RATIO, PlayingCard, type HandCard } from "./CardHand";

const ARC = 45; // first card at -45° (top, beside the title), last at +45°, evenly in between
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Cards curving down the side of a section like a reversed C (Ↄ): the middle card bulges out
 * furthest, the first and last curve back in toward the text. The curve is sized to the height
 * of the column it sits in (the section's title + text), so all cards are visible at once.
 * As the section scrolls into view the cards slide onto the curve one by one, top to bottom
 * (and slide off again when you scroll back up). Hover a card to pull it forward.
 */
export default function ArcHand({ cards }: { cards: HandCard[] }) {
  const box = useRef<HTMLDivElement>(null);
  const n = cards.length;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState(n); // all cards until scripts run (and if frames never draw)
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);

    if (reduced()) return () => ro.disconnect();
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the column's top reaches 85% down the screen, 1 when it's 15% from the top
        const p = (vh * 0.85 - r.top) / Math.max(1, Math.min(r.height, vh) * 0.75);
        setShown(Math.max(0, Math.min(n, Math.ceil(p * n))));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [n]);

  // Geometry: a semicircle arc on the right. Card i sits at angle phi on the circle and leans by
  // the same angle, so the first card is tilted -45°, each next one more to the right, the last +45°.
  const H = size.h || 780;
  const W = size.w || 460;
  const cardW = Math.max(145, Math.min(168, W * 0.36));
  const cardH = cardW * CARD_RATIO;
  const reach = (cardW + cardH) * 0.7071; // how far a 45°-tilted card extends
  const radius = Math.max(cardH, (H - reach) / (2 * Math.sin((ARC * Math.PI) / 180)));
  // Centre of the circle sits to the left so the arc bulges right; the middle card hugs the right edge.
  const cx = W - cardW / 2 - 8 - radius;
  const cy = H / 2;

  return (
    <div ref={box} className="relative h-full min-h-[780px] w-full" onPointerLeave={() => setHover(null)}>
      {cards.map((card, i) => {
        const phi = n > 1 ? -ARC + (i * 2 * ARC) / (n - 1) : 0; // degrees around the arc
        const rad = (phi * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad) - cardW / 2;
        const y = cy + radius * Math.sin(rad) - cardH / 2;
        const tilt = phi;
        const isUp = hover === i;
        const visible = i < shown;
        const transform = visible
          ? `translate(${x - (isUp ? 28 : 0)}px, ${y}px) rotate(${isUp ? 0 : tilt}deg) scale(${isUp ? 1.08 : 1})`
          : `translate(${(size.w || 460) + 40}px, ${y + 40}px) rotate(${tilt + 25}deg) scale(.9)`; // off to the side

        return (
          <div
            key={i}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            onClick={() => setHover(isUp ? null : i)}
            className="absolute left-0 top-0 cursor-pointer"
            style={{
              transform,
              opacity: visible ? 1 : 0,
              zIndex: isUp ? 50 : 10 + i,
              transition: `transform .7s cubic-bezier(.2,.85,.25,1.08) ${visible && hover === null ? i * 70 : 0}ms, opacity .4s ${visible ? i * 70 : 0}ms`,
            }}
          >
            <PlayingCard card={card} width={cardW} raised={isUp} alignTop />
          </div>
        );
      })}
    </div>
  );
}
