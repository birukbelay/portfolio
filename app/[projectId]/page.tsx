import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LuArrowLeft, LuArrowRight, LuArrowUpRight, LuGithub } from "react-icons/lu";
import { getProjectById, getProjects } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} — Biruk Kassa`,
    description: project.desc.replace(/\s+/g, " ").slice(0, 160),
    openGraph: { images: project.image ? [project.image] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const [project, all] = await Promise.all([getProjectById(projectId), getProjects()]);
  if (!project) notFound();

  const index = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const paragraphs = project.desc.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);

  return (
    <main className="px-6 pb-24 pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl">
        <Link href="/#work" className="inline-flex animate-fade-up items-center gap-1.5 text-sm text-muted hover:text-ink">
          <LuArrowLeft size={15} /> All projects
        </Link>

        <header className="mt-8 grid animate-fade-up gap-8 [animation-delay:80ms] lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="section-label">Case study</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-7xl">{project.name}</h1>
            <p className="mt-4 font-mono text-sm text-muted">{project.tech}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" className="btn-accent">
                Visit live site <LuArrowUpRight size={16} />
              </a>
            )}
            {project.code && (
              <a href={project.code} target="_blank" rel="noreferrer" className="btn-ghost">
                <LuGithub size={16} /> Source code
              </a>
            )}
          </div>
        </header>

        <div className="card relative mt-12 aspect-[16/9] animate-fade-up overflow-hidden shadow-2xl shadow-ink/10 [animation-delay:160ms]">
          <Image src={project.image} alt={project.name} fill priority sizes="(max-width: 1200px) 100vw, 1150px" className="object-cover" />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_300px]">
          <div data-reveal>
            <h2 className="section-label">Overview</h2>
            <div className="mt-5 space-y-5 text-lg leading-relaxed text-ink/80">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {project.video && (
              <div className="mt-12">
                <h2 className="section-label">Walkthrough</h2>
                <video className="card mt-5 w-full shadow-xl" autoPlay loop muted playsInline controls>
                  <source src={project.video} type="video/mp4" />
                </video>
              </div>
            )}
          </div>

          <aside data-reveal className="h-fit lg:sticky lg:top-28">
            <div className="card p-6">
              <h2 className="section-label">Built with</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <li key={t} className="chip">{t}</li>
                ))}
              </ul>
              {(project.demo || project.code) && (
                <>
                  <h2 className="section-label mt-8">Links</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {project.demo && (
                      <li><a href={project.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:text-accent">Live site <LuArrowUpRight size={14} /></a></li>
                    )}
                    {project.code && (
                      <li><a href={project.code} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:text-accent">Repository <LuArrowUpRight size={14} /></a></li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </aside>
        </div>

        {next && (
          <Link href={`/${next.id}`} data-reveal className="card group mt-24 flex items-center justify-between gap-6 p-6 transition hover:border-ink/30 sm:p-8">
            <div className="flex items-center gap-5">
              <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                <Image src={next.image} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div>
                <p className="section-label">Next project</p>
                <p className="mt-1 font-display text-3xl tracking-tight text-ink">{next.name}</p>
              </div>
            </div>
            <span className="rounded-full border border-line p-3 text-ink transition group-hover:bg-ink group-hover:text-paper">
              <LuArrowRight size={20} />
            </span>
          </Link>
        )}
      </div>
    </main>
  );
}
