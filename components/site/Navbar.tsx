"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LuArrowUpRight, LuMenu, LuX } from "react-icons/lu";
import ThemeToggle from "./ThemeToggle";
import HashLink from "./HashLink";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view (home page only)
  useEffect(() => {
    if (!onHome) return;
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        // Frosted glass, a little more opaque once the page has scrolled under it
        className={`glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-2 py-2 pl-5 transition-all duration-300 ${
          scrolled || open ? "glass-strong shadow-lg shadow-black/10" : ""
        }`}
      >
        <Link href="/" className="group font-display text-2xl leading-none tracking-tight text-ink">
          Biruk<span className="inline-block text-accent transition group-hover:-translate-y-0.5">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <HashLink
                href={`/#${l.id}`}
                className={`relative rounded-full px-3.5 py-2 text-sm transition ${
                  onHome && active === l.id ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {onHome && active === l.id && <span className="absolute inset-0 -z-10 rounded-full bg-ink/[.06]" />}
                {l.label}
              </HashLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/resume" className="btn-primary hidden px-4 py-2 sm:inline-flex">
            Résumé <LuArrowUpRight size={15} />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2.5 text-ink transition hover:bg-ink/5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <LuX size={20} /> : <LuMenu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass glass-strong mx-auto mt-2 max-w-5xl animate-scale-in rounded-3xl p-3 shadow-xl md:hidden">
          <ul>
            {LINKS.map((l) => (
              <li key={l.id}>
                <HashLink href={`/#${l.id}`} onNavigate={() => setOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-lg text-ink hover:bg-ink/5">
                  {l.label}
                </HashLink>
              </li>
            ))}
          </ul>
          <Link href="/resume" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">
            View résumé <LuArrowUpRight size={15} />
          </Link>
        </div>
      )}
    </header>
  );
}
