import Image from "next/image";
import Link from "next/link";
import { LuArrowDown, LuArrowRight, LuArrowUpRight, LuDownload, LuGithub, LuLinkedin, LuMail, LuServer, LuLayoutTemplate, LuPalette } from "react-icons/lu";
import { FaMedium } from "react-icons/fa";
import ExperienceEntry, { type ExperienceData } from "./ExperienceEntry";

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

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

const cleanText = (t: string) => t.replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------- Hero
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
      <div aria-hidden className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[120px]" />

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
          <h1 className="mt-4 animate-fade-up font-display text-[2.9rem] leading-[1.02] tracking-tight text-ink [animation-delay:140ms] sm:text-6xl lg:text-7xl">
            I build reliable <em className="text-accent">backends</em> and interfaces people <em className="text-accent">enjoy</em> using.
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted [animation-delay:220ms]">
            Full-stack engineer shipping production systems end to end — real-time chat, subscription engines, and the web
            apps on top of them.
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:300ms]">
            <Link href="/#work" className="btn-primary">
              See my work <LuArrowDown size={16} />
            </Link>
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

      {/* Stats */}
      <dl className="relative mx-auto mt-20 grid max-w-6xl animate-fade-up grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface/60 backdrop-blur [animation-delay:450ms] md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-6 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""} border-line`}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-4xl tracking-tight text-ink sm:text-5xl">{s.value}</dd>
            <dd className="mt-1 text-sm text-muted">{s.label}</dd>
          </div>
        ))}
      </dl>
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
            {c("// hi there 👋")}
            {"\n"}
            {k("export const")} engineer {c("=")} {"{"}
            {"\n  "}{p("name")}{c(":")} {s(name)}{c(",")}
            {"\n  "}{p("role")}{c(":")} {s(role)}{c(",")}
            {"\n  "}{p("stack")}{c(":")} [{stack.map((t, i) => (
              <span key={t}>{s(t)}{i < stack.length - 1 ? c(", ") : ""}</span>
            ))}]{c(",")}
            {"\n  "}{p("ships")}{c(":")} [{s("APIs")}{c(", ")}{s("real-time")}{c(", ")}{s("web apps")}]{c(",")}
            {"\n  "}{p("remote")}{c(":")} <span className="text-[#fdba74]">true</span>{c(",")}
            {"\n"}{"}"}{c(";")}
            <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
          </code>
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- About
const FOCUS = [
  {
    icon: LuServer,
    title: "Backend",
    body: "Extensible services in Node.js (NestJS), Go and Python (Flask) — clean APIs, solid data models, and integrations like Firebase.",
  },
  {
    icon: LuLayoutTemplate,
    title: "Frontend",
    body: "React and Next.js apps with predictable state using Redux Toolkit, React Query and Apollo GraphQL.",
  },
  {
    icon: LuPalette,
    title: "UI / UX",
    body: "Responsive, accessible interfaces with Tailwind CSS, MUI, Ant Design and styled-components.",
  },
];

export function About() {
  return (
    <Section id="about">
      <SectionHeader index="01" label="About" title={<>An engineer who cares about the <em>whole</em> product.</>} />
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div data-reveal className="space-y-5 text-lg leading-relaxed text-muted">
          <p>
            I&apos;m a full-stack engineer for web and mobile. I&apos;ve built and improved apps for clients in{" "}
            <span className="text-ink">e-commerce, entertainment, ERP and tourism</span>, and worked with distributed teams on
            large products used by real people every day.
          </p>
          <p>
            I like owning a feature from the database schema to the last pixel, and I care about the details that make
            software feel fast and dependable.
          </p>
          <Link href="/#work" className="group inline-flex items-center gap-2 text-base font-medium text-ink">
            Check out my latest projects
            <LuArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {FOCUS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="card p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
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
      <div className="relative mx-auto max-w-4xl space-y-12 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line">
        {items.map((exp) => (
          <div key={exp.id} data-reveal>
            <ExperienceEntry data={exp} maxTasks={3} />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- Work
export function Work({ projects }: { projects: ProjectCard[] }) {
  if (!projects.length) return null;
  const [featured, ...rest] = projects;
  return (
    <Section id="work">
      <SectionHeader index="03" label="Selected work" title="Things I've designed, built and shipped." />
      <FeaturedProject project={featured} />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {rest.map((p, i) => (
          <ProjectTile key={p.id} project={p} delay={(i % 2) * 80} />
        ))}
      </div>
    </Section>
  );
}

function ProjectLinks({ project }: { project: ProjectCard }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/${project.id}`} className="btn-primary px-4 py-2 text-xs">
        Case study <LuArrowRight size={14} />
      </Link>
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noreferrer" className="btn-ghost px-4 py-2 text-xs">
          Live <LuArrowUpRight size={14} />
        </a>
      )}
      {project.code && (
        <a href={project.code} target="_blank" rel="noreferrer" className="btn-ghost px-4 py-2 text-xs">
          <LuGithub size={14} /> Code
        </a>
      )}
    </div>
  );
}

function Chips({ items, max = 4 }: { items: string[]; max?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, max).map((t) => (
        <span key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
          {t}
        </span>
      ))}
      {items.length > max && <span className="px-1 font-mono text-[11px] text-muted">+{items.length - max}</span>}
    </div>
  );
}

function FeaturedProject({ project }: { project: ProjectCard }) {
  return (
    <article data-reveal className="card group grid overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <Link href={`/${project.id}`} className="relative block aspect-[16/10] overflow-hidden bg-line/40 lg:aspect-auto lg:min-h-[420px]">
        <Image src={project.image} alt={project.name} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
        <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent-ink">Featured</span>
      </Link>
      <div className="flex flex-col justify-between gap-8 p-8 lg:p-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">{project.tech}</p>
          <h3 className="mt-3 font-display text-4xl tracking-tight text-ink">{project.name}</h3>
          <p className="mt-4 line-clamp-5 leading-relaxed text-muted">{cleanText(project.desc)}</p>
        </div>
        <div className="space-y-5">
          <Chips items={project.technologies} max={6} />
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

function ProjectTile({ project, delay }: { project: ProjectCard; delay: number }) {
  return (
    <article data-reveal style={{ transitionDelay: `${delay}ms` }} className="card group flex flex-col overflow-hidden transition hover:shadow-2xl hover:shadow-ink/5">
      <Link href={`/${project.id}`} className="relative block aspect-[16/10] overflow-hidden bg-line/40">
        <Image src={project.image} alt={project.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-ink">
              <Link href={`/${project.id}`} className="hover:underline">{project.name}</Link>
            </h3>
            <Link href={`/${project.id}`} aria-label={`${project.name} case study`} className="rounded-full border border-line p-2 text-muted transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              <LuArrowUpRight size={16} />
            </Link>
          </div>
          <p className="mt-1 font-mono text-xs text-muted">{project.tech}</p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{cleanText(project.desc)}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <Chips items={project.technologies} />
          <div className="flex gap-1">
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink hover:bg-ink/5">
                Live <LuArrowUpRight size={13} />
              </a>
            )}
            {project.code && (
              <a href={project.code} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink hover:bg-ink/5">
                Code <LuArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
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
  const groups = groupSkills(skills);
  return (
    <Section id="skills" className="bg-surface/50">
      <SectionHeader index="04" label="Toolkit" title="The tools I reach for to ship." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map(([cat, items], i) => (
          <div key={cat} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="card p-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{cat}</h3>
            <ul className="mt-5 space-y-3">
              {items.map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm font-medium text-ink">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-line">
                    {s.image ? (
                      <Image src={s.image} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted">{s.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="capitalize">{s.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/40 blur-[100px]" />
        <div aria-hidden className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
            <span className="text-accent">05</span> — Contact
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
