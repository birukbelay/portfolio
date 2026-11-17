import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getProjects, getSkills, getExperiences, getResumeInfo } from "@/lib/db/queries";
import { currentEngine, d1Config } from "@/lib/db";
import { auth } from "@/auth";
import {
  LuArrowRight,
  LuBriefcaseBusiness,
  LuCircleCheck,
  LuCircle,
  LuDatabase,
  LuFolderKanban,
  LuHardDrive,
  LuPlus,
  LuSparkles,
} from "react-icons/lu";
import { ButtonLink, Card, Badge } from "@/components/admin/ui";
import { splitTitle } from "@/lib/experience";
import { htmlToText } from "@/lib/richtext";

export default async function AdminDashboardPage() {
  const session = await auth();
  const [projects, skills, experiences, resume] = await Promise.all([getProjects(), getSkills(), getExperiences(), getResumeInfo()]);

  const engine = currentEngine();
  const hasStorage = !!(
    (process.env.STORAGE_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID) &&
    (process.env.STORAGE_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY)
  );

  // What a recruiter looks for when they land on the site.
  const checklist = [
    { done: htmlToText(resume?.about || "").length > 120, label: "Write a professional summary", href: "/admin/resume" },
    { done: !!resume?.resumeLink, label: "Link a downloadable resume", href: "/admin/resume" },
    { done: !!resume?.linkedinUrl && !!resume?.githubUrl, label: "Add LinkedIn and GitHub", href: "/admin/resume" },
    { done: projects.length >= 3, label: "Showcase at least 3 projects", href: "/admin/projects" },
    { done: projects.filter((p) => p.demo || p.code).length >= 3, label: "Add live demo or code links to 3 projects", href: "/admin/projects" },
    {
      done: experiences.length > 0 && experiences.every((e) => e.keyTasks.length >= 3),
      label: "Give every role a summary and 2+ highlights",
      href: "/admin/experiences",
    },
  ];
  const score = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const firstName = (resume?.fullName || session?.user?.name || "there").split(" ")[0];

  const stats = [
    { label: "Projects", value: projects.length, href: "/admin/projects", icon: LuFolderKanban },
    { label: "Roles", value: experiences.length, href: "/admin/experiences", icon: LuBriefcaseBusiness },
    { label: "Skills", value: skills.length, href: "/admin/skills", icon: LuSparkles },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Welcome back,</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{firstName} 👋</h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/admin/experiences" variant="secondary" icon={<LuPlus size={16} />}>Experience</ButtonLink>
          <ButtonLink href="/admin/projects/new" icon={<LuPlus size={16} />}>New project</ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href} className="group">
            <Card className="flex items-center justify-between p-5 transition group-hover:border-zinc-300 group-hover:shadow-md">
              <div>
                <p className="text-xs font-medium text-zinc-500">{label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">{value}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition group-hover:bg-brand-50 group-hover:text-brand-600">
                <Icon size={20} />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Recruiter readiness */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Recruiter readiness</h2>
              <p className="mt-1 text-xs text-zinc-500">What hiring managers check in the first 30 seconds.</p>
            </div>
            <div className="relative h-14 w-14 shrink-0">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f4f4f5" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke={score === 100 ? "#10b981" : "#f05a28"} strokeWidth="3.5"
                  strokeLinecap="round" strokeDasharray={`${(score / 100) * 97.4} 97.4`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-zinc-900">{score}%</span>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-zinc-100">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="group flex items-center gap-3 py-2.5 text-sm">
                  {item.done ? (
                    <LuCircleCheck size={18} className="shrink-0 text-emerald-500" />
                  ) : (
                    <LuCircle size={18} className="shrink-0 text-zinc-300" />
                  )}
                  <span className={item.done ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-700"}>{item.label}</span>
                  {!item.done && <LuArrowRight size={14} className="ml-auto text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-600" />}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* System */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-zinc-900">System status</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-zinc-500"><LuDatabase size={15} /> Database</dt>
                <dd>
                  {engine === "d1" ? (
                    <Badge tone="green">● Cloudflare D1</Badge>
                  ) : d1Config ? (
                    <Badge tone="amber">● D1 unreachable — local fallback</Badge>
                  ) : (
                    <Badge tone="blue">● Local SQLite</Badge>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-zinc-500"><LuHardDrive size={15} /> Image storage</dt>
                <dd>{hasStorage ? <Badge tone="green">● Cloudflare R2</Badge> : <Badge tone="blue">● Local uploads</Badge>}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Latest role</h2>
              <Link href="/admin/experiences" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">Manage →</Link>
            </div>
            {experiences[0] ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-zinc-900">{splitTitle(experiences[0].title).role}</p>
                <p className="text-xs text-zinc-500">{splitTitle(experiences[0].title).company}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">No roles yet.</p>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Projects</h2>
          <Link href="/admin/projects" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">View all →</Link>
        </div>
        <ul className="divide-y divide-zinc-100">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-6 py-3 transition hover:bg-zinc-50">
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-zinc-200">
                  {p.image && <Image src={p.image} alt="" fill className="object-cover" sizes="64px" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{p.name}</p>
                  <p className="truncate text-xs text-zinc-500">{p.tech}</p>
                </div>
                <div className="hidden gap-1.5 sm:flex">
                  {p.demo && <Badge tone="green">Demo</Badge>}
                  {p.code && <Badge>Code</Badge>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
