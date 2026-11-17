"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LuCheck, LuMonitor, LuMoon, LuSun, LuWaves } from "react-icons/lu";

type Theme = "system" | "light" | "dark" | "ocean";

const THEMES: { value: Theme; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; swatch: string }[] = [
  { value: "light", label: "Light", icon: LuSun, swatch: "linear-gradient(135deg,#f7f6f1 50%,#f05a28 50%)" },
  { value: "dark", label: "Dark", icon: LuMoon, swatch: "linear-gradient(135deg,#0e0e0c 50%,#ff7a45 50%)" },
  { value: "ocean", label: "Ocean", icon: LuWaves, swatch: "linear-gradient(135deg,#051120 50%,#48cae4 50%)" },
  { value: "system", label: "System", icon: LuMonitor, swatch: "linear-gradient(135deg,#f7f6f1 50%,#0e0e0c 50%)" },
];

// The current theme lives on <html data-theme>; this store lets React follow it.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getTheme = (): Theme => (document.documentElement.dataset.theme as Theme) || "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode: theme just won't persist */
  }
  listeners.forEach((l) => l());
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system" as Theme);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const Current = (THEMES.find((t) => t.value === theme) ?? THEMES[3]).icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2.5 text-ink transition hover:bg-ink/5"
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Current size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-44 animate-scale-in rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-black/10">
          {THEMES.map(({ value, label, icon: Icon, swatch }) => (
            <button
              key={value}
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => {
                applyTheme(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                theme === value ? "bg-ink/[.06] text-ink" : "text-muted hover:bg-ink/[.04] hover:text-ink"
              }`}
            >
              <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-line" style={{ background: swatch }} />
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {theme === value && <LuCheck size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
