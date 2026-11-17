"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuLayoutDashboard,
  LuFolderKanban,
  LuSparkles,
  LuBriefcaseBusiness,
  LuIdCard,
  LuExternalLink,
  LuLogOut,
  LuMenu,
  LuX,
} from "react-icons/lu";

const NAV = [
  { href: "/admin", label: "Overview", icon: LuLayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: LuFolderKanban },
  { href: "/admin/experiences", label: "Experience", icon: LuBriefcaseBusiness },
  { href: "/admin/skills", label: "Skills", icon: LuSparkles },
  { href: "/admin/resume", label: "Profile & Resume", icon: LuIdCard },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
            }`}
          >
            <Icon size={17} className={active ? "text-brand-500" : "text-zinc-400 group-hover:text-zinc-600"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 font-mono text-xs font-bold text-white">BK</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-zinc-900">Portfolio</span>
        <span className="block text-[11px] text-zinc-500">Content studio</span>
      </span>
    </Link>
  );
}

export default function AdminNav({ email, signOutAction }: { email: string; signOutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const footer = (
    <div className="space-y-1 border-t border-zinc-200 pt-4">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-200/50 hover:text-zinc-900"
      >
        <LuExternalLink size={16} className="text-zinc-400" />
        View live site
      </a>
      <form action={signOutAction}>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-red-50 hover:text-red-600">
          <LuLogOut size={16} className="text-zinc-400" />
          Sign out
        </button>
      </form>
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold uppercase text-brand-700">
          {email.slice(0, 1)}
        </span>
        <span className="truncate text-xs text-zinc-500">{email}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-zinc-200 bg-zinc-100/60 p-4 md:flex">
        <div className="space-y-6">
          <div className="px-1 pt-1"><Brand /></div>
          <NavLinks />
        </div>
        {footer}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <button onClick={() => setOpen(true)} className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100" aria-label="Open menu">
          <LuMenu size={20} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-zinc-950/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 animate-slide-in-right flex-col justify-between bg-zinc-50 p-4 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Brand />
                <button onClick={() => setOpen(false)} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-200/60" aria-label="Close menu">
                  <LuX size={18} />
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
