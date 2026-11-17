import React from "react";
import Link from "next/link";
import { CREDLY_URL } from "@/data/credentials";
import { CredentialCards, SlotMachine } from "./CasinoCredentials";
import { LuArrowDown, LuArrowRight, LuArrowUpRight, LuDownload, LuGithub, LuLinkedin, LuMail, LuServer, LuLayoutTemplate, LuPalette, LuInfinity, LuNetwork } from "react-icons/lu";
import { FaMedium } from "react-icons/fa";
import { type ExperienceData } from "./ExperienceEntry";
import ChessTimeline from "./ChessTimeline";
import HashLink from "./HashLink";
import StatDice from "./StatDice";
import ProjectDeck from "./ProjectDeck";
import SkillWheel from "./SkillWheel";
import CardHand from "./CardHand";
import ArcHand from "./ArcHand";

// ---------------------------------------------------------------- types
export interface Profile {
  fullName: string;
  titles: string[];
  resumeLink?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  mediumUrl?: string | null;
  email?: string;
}
export interface ProjectCard {
  id: string;
  name: string;
  tech: string;
  image: string;
  technologies: string[];
  desc: string;
  code?: string | null;
  demo?: string | null;
}
export interface SkillItem {
  id: string;
  name: string;
  image: string;
  category: string;
}

// ---------------------------------------------------------------- shared
function SectionHeader({ index, label, title, children }: { index: string; label: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div data-reveal className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="section-label">
          <span className="text-accent">{index}</span> — {label}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Section({ id, children, className = "", wide }: { id: string; children: React.ReactNode; className?: string; wide?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-24 py-24 md:py-32 ${wide ? "px-1.5 sm:px-2 lg:px-3" : "px-6"} ${className}`}>
      <div className={`mx-auto ${wide ? "max-w-[1920px]" : "max-w-6xl"}`}>{children}</div>
    </section>
  );
}


// ---------------------------------------------------------------- Hero
const HEADLINE = "I build reliable *backends and interfaces people *enjoy using."
  .split(" ")
  .map((w) => ({ text: w.replace("*", ""), accent: w.startsWith("*") }));

export function Hero({ profile, stack, stats }: { profile: Profile; stack: string[]; stats: { value: string; label: string }[] }) {
  const role = profile.titles[0] || "Software Engineer";
  const socials = [
    profile.linkedinUrl && { href: profile.linkedinUrl, label: "LinkedIn", icon: LuLinkedin },
    profile.githubUrl && { href: profile.githubUrl, label: "GitHub", icon: LuGithub },
    profile.mediumUrl && { href: profile.mediumUrl, label: "Medium", icon: FaMedium },
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[];

  return (
    <section id="top" className="relative overflow-hidden px-6 pb-16 pt-36 md:pt-44">
      {/* Backdrop */}
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div aria-hidden className="absolute -top-40 right-[-10%] h-[520px] w-[520px] animate-float rounded-full bg-accent/20 blur-[120px]" />
      <div aria-hidden className="absolute left-[-15%] top-1/2 h-[380px] w-[380px] animate-float rounded-full bg-accent/10 blur-[110px] [animation-delay:-9s]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="animate-fade-up">
            <span className="chip">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-500" />
              Open to new opportunities
            </span>
          </div>

          <p className="mt-8 animate-fade-up font-mono text-sm text-muted [animation-delay:80ms]">
            {profile.fullName} — {role}
          </p>
          <h1 className="mt-4 font-display text-[2.9rem] leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl" aria-label={HEADLINE.map((w) => w.text).join(" ")}>
            {HEADLINE.map((w, i) => (
              <React.Fragment key={i}>
                <span aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="inline-block animate-word-rise" style={{ animationDelay: `${160 + i * 70}ms` }}>
                    {w.accent ? <em className="pr-[0.04em] text-accent">{w.text}</em> : w.text}
                  </span>
                </span>
                {i < HEADLINE.length - 1 && " "}
              </React.Fragment>
            ))}
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted [animation-delay:220ms]">
            Full-stack developer with 6+ years building scalable backends in Node.js, Python and Go — from an
            emergency-response platform to real-time chat and subscription engines.
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:300ms]">
            <HashLink href="/#work" className="btn-primary">
              See my work <LuArrowDown size={16} />
            </HashLink>
            <a href={profile.resumeLink || "/resume"} target={profile.resumeLink ? "_blank" : undefined} rel="noreferrer" className="btn-ghost">
              <LuDownload size={16} /> Résumé
            </a>
            <div className="ml-1 flex items-center">
              {socials.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full p-2.5 text-muted transition hover:bg-ink/5 hover:text-ink">
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <CodeCard name={profile.fullName} role={role} stack={stack} />
      </div>

      {/* Stats, rolled onto the table as dice */}
      <div className="relative mx-auto mt-20 max-w-6xl">
        <StatDice stats={stats} />
      </div>
    </section>
  );
}

function CodeCard({ name, role, stack }: { name: string; role: string; stack: string[] }) {
  const k = (t: string) => <span className="text-[#c4b5fd]">{t}</span>; // keyword
  const p = (t: string) => <span className="text-[#93c5fd]">{t}</span>; // property
  const s = (t: string) => <span className="text-[#86efac]">&quot;{t}&quot;</span>; // string
  const c = (t: string) => <span className="text-white/35">{t}</span>; // comment / punctuation

  return (
    <div className="relative min-w-0 animate-fade-up [animation-delay:260ms]">
      <div aria-hidden className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-accent/30 via-transparent to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-deep shadow-2xl shadow-black/20 ring-1 ring-black/5">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-white/40">profile.ts</span>
        </div>
        <pre className="whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-7 text-white/85 sm:text-sm">
          <code>
            {[
              <>{c("// hi there 👋")}</>,
              <>{k("export const")} engineer {c("=")} {"{"}</>,
              <>{"  "}{p("name")}{c(":")} {s(name)}{c(",")}</>,
              <>{"  "}{p("role")}{c(":")} {s(role)}{c(",")}</>,
              <>
                {"  "}{p("stack")}{c(":")} [{stack.map((t, i) => (
                  <span key={t}>{s(t)}{i < stack.length - 1 ? c(", ") : ""}</span>
                ))}]{c(",")}
              </>,
              <>{"  "}{p("ships")}{c(":")} [{s("APIs")}{c(", ")}{s("real-time")}{c(", ")}{s("web apps")}]{c(",")}</>,
              <>{"  "}{p("remote")}{c(":")} <span className="text-[#fdba74]">true</span>{c(",")}</>,
              <>
                {"}"}{c(";")}
                <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
              </>,
            ].map((line, i) => (
              <span key={i} className="block animate-type" style={{ animationDelay: `${700 + i * 260}ms` }}>
                {line}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- About
// Left-to-right order of the hand; scrolling raises them in this order (System Architecture first).
const FOCUS = [
  {
    icon: LuNetwork,
    rank: "A",
    suit: "♠",
    title: "System Architecture",
    body: "Scalable, maintainable systems: service boundaries, API gateways, real-time messaging, caching and subscription engines.",
  },
  {
    icon: LuServer,
    rank: "K",
    suit: "♥",
    title: "Backend",
    body: "Extensible services in Node.js (NestJS), Go and Python (Flask) — clean APIs, solid data models, and integrations like Firebase.",
  },
  {
    icon: LuInfinity,
    rank: "Q",
    suit: "♣",
    title: "DevOps",
    body: "Containerised services with Docker and Kubernetes, CI/CD pipelines, and cloud infrastructure on AWS.",
  },
  {
    icon: LuLayoutTemplate,
    rank: "J",
    suit: "♦",
    title: "Frontend",
    body: "React and Next.js apps with predictable state using Redux Toolkit, React Query and Apollo GraphQL.",
  },
  {
    icon: LuPalette,
    rank: "10",
    suit: "♥",
    title: "UI / UX",
    body: "Responsive, accessible interfaces with Tailwind CSS, MUI, Ant Design and styled-components.",
  },
];

export function About() {
  const hand = FOCUS.map(({ icon: Icon, title, body, rank, suit }) => ({
    rank,
    suit,
    content: (
      <>
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Icon size={20} />
        </span>
        <h3 className="mt-3 text-center font-display text-[1.35rem] leading-tight tracking-tight text-ink">{title}</h3>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-muted">{body}</p>
      </>
    ),
  }));
  return (
    <Section id="about">
      {/* Desktop: title + text on the left, the cards curving down the right side like a
          reversed C (Ↄ) the full height of the section. Smaller screens: a compact hand below. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:gap-6">
        <div>
          <SectionHeader index="01" label="About" title={<>An engineer who cares about the <em>whole</em> product.</>} />
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            <p>
              I&apos;m a full-stack developer with <span className="text-ink">6+ years of experience</span>, specializing in
              backends with <span className="text-ink">Node.js, Python and Go</span>. I build scalable, high-performance APIs
              — from an emergency-response platform with 99.9% uptime to real-time chat and subscription engines.
            </p>
            <p>
              I bring a strong ownership mindset, clear communication and a keen eye for detail, and I keep learning as the
              technology moves.
            </p>
            <HashLink href="/#work" className="group inline-flex items-center gap-2 text-base font-medium text-ink">
              Check out my latest projects
              <LuArrowRight size={16} className="transition group-hover:translate-x-1" />
            </HashLink>
          </div>
        </div>
        {/* starts up beside the section label so the arc has room without running far below the text */}
        <div className="hidden lg:-mt-36 lg:block">
          <ArcHand cards={hand} />
        </div>
        <div className="lg:hidden">
          <CardHand cards={hand} />
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- Experience
export function Experience({ items }: { items: (ExperienceData & { id: string })[] }) {
  if (!items.length) return null;
  return (
    <Section id="experience" className="bg-surface/50">
      <SectionHeader index="02" label="Experience" title="Where I've been building.">
        <Link href="/resume" className="btn-ghost self-start md:self-auto">
          Full résumé <LuArrowUpRight size={15} />
        </Link>
      </SectionHeader>
      <ChessTimeline items={items} />
    </Section>
  );
}

// ---------------------------------------------------------------- Work
export function Work({ projects }: { projects: ProjectCard[] }) {
  if (!projects.length) return null;
  return (
    <Section id="work" wide>
      {/* heading stays aligned with the other sections; the table uses the extra width */}
      <div className="mx-auto max-w-6xl px-[18px] sm:px-4 lg:px-3 xl:px-0">
        <SectionHeader index="03" label="Selected work" title="Things I've designed, built and shipped." />
      </div>
      <ProjectDeck projects={projects} />
    </Section>
  );
}

// ---------------------------------------------------------------- Skills
const CATEGORY_ORDER = ["Back-End", "Front-End", "Databases", "Tools / Cloud", "Other"];

export function groupSkills<T extends { category: string }>(skills: T[]) {
  const groups = new Map<string, T[]>();
  for (const s of skills) {
    const cat = s.category || "Other";
    groups.set(cat, [...(groups.get(cat) ?? []), s]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
}

export function Skills({ skills }: { skills: SkillItem[] }) {
  if (!skills.length) return null;
  return (
    <Section id="skills" className="bg-surface/50">
      <SectionHeader index="04" label="Toolkit" title="The tools I reach for to ship." />
      <SkillWheel groups={groupSkills(skills)} />
    </Section>
  );
}

// ---------------------------------------------------------------- Credentials
export function Credentials() {
  return (
    <Section id="credentials">
      <SectionHeader index="05" label="Credentials" title="Education, certifications and wins.">
        <div className="flex flex-col items-start gap-3 md:items-end">
          <SlotMachine />
          <a href={CREDLY_URL} target="_blank" rel="noreferrer" className="btn-ghost px-4 py-2 text-xs">
            Verify on Credly <LuArrowUpRight size={14} />
          </a>
        </div>
      </SectionHeader>
      <CredentialCards />
    </Section>
  );
}

// ---------------------------------------------------------------- Contact
export function Contact({ profile }: { profile: Profile }) {
  const actions = [
    profile.email && { href: `mailto:${profile.email}`, label: "Email me", icon: LuMail, primary: true },
    profile.linkedinUrl && { href: profile.linkedinUrl, label: "Message on LinkedIn", icon: LuLinkedin, primary: !profile.email },
    profile.githubUrl && { href: profile.githubUrl, label: "GitHub", icon: LuGithub },
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ size?: number }>; primary?: boolean }[];

  return (
    <section id="contact" className="scroll-mt-24 px-6 py-24 md:py-32">
      <div data-reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-deep px-8 py-16 text-white sm:px-14 sm:py-20">
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 animate-float rounded-full bg-accent/40 blur-[100px]" />
        <div aria-hidden className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
            <span className="text-accent">06</span> — Contact
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Have a role or project in mind? <em className="text-accent">Let&apos;s talk.</em>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            I&apos;m open to full-time and freelance work. I usually reply within a day.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {actions.map(({ href, label, icon: Icon, primary }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className={`btn ${primary ? "bg-white text-deep hover:bg-white/90" : "border border-white/15 text-white hover:bg-white/10"}`}
              >
                <Icon size={16} /> {label}
              </a>
            ))}
            <Link href="/resume" className="btn border border-white/15 text-white hover:bg-white/10">
              View résumé <LuArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
