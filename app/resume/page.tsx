import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowLeft, LuBadgeCheck, LuCode, LuExternalLink, LuGithub, LuGlobe, LuLinkedin, LuMail } from "react-icons/lu";
import { AWARDS, CERTIFICATIONS, EDUCATION } from "@/data/credentials";
import { FaMedium } from "react-icons/fa";
import { getResumeInfo, getExperiences, getSkills } from "@/lib/db/queries";
import ExperienceEntry from "@/components/site/ExperienceEntry";
import PrintButton from "@/components/site/PrintButton";
import { groupSkills } from "@/components/site/HomeSections";
import { LINKS } from "@/data/myLinks";
import { htmlToText } from "@/lib/richtext";
import { sanitizeSummary } from "@/lib/richtext.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const resume = await getResumeInfo();
  return {
    title: `Résumé — ${resume?.fullName || "Biruk Kassa"}`,
    description: htmlToText(resume?.about || "").slice(0, 160) || "Full-stack software engineer résumé",
  };
}

const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default async function ResumePage() {
  const [resume, experiences, skills] = await Promise.all([getResumeInfo(), getExperiences(), getSkills()]);

  const fullName = resume?.fullName || "Biruk B Kassa";
  const titles = resume?.titles?.length ? resume.titles : ["Software Engineer"];
  const about = sanitizeSummary(resume?.about || "");
  const links = [
    LINKS.EMAIL && { href: `mailto:${LINKS.EMAIL}`, text: LINKS.EMAIL, icon: LuMail },
    (resume?.linkedinUrl || LINKS.LINKEDIN_URL) && { href: resume?.linkedinUrl || LINKS.LINKEDIN_URL, icon: LuLinkedin },
    (resume?.githubUrl || LINKS.GITHUB_URL) && { href: resume?.githubUrl || LINKS.GITHUB_URL, icon: LuGithub },
    (resume?.mediumUrl || LINKS.MediumUrl) && { href: resume?.mediumUrl || LINKS.MediumUrl, icon: FaMedium },
    LINKS.PORTFOLIO_URL && { href: LINKS.PORTFOLIO_URL, icon: LuGlobe },
    LINKS.LEETCODE_URL && { href: LINKS.LEETCODE_URL, text: "LeetCode", icon: LuCode },
    LINKS.CREDLY_URL && { href: LINKS.CREDLY_URL, text: "Credly", icon: LuBadgeCheck },
  ].filter(Boolean) as { href: string; text?: string; icon: React.ComponentType<{ size?: number }> }[];
  const docLink = resume?.resumeLink || LINKS.RESUME_LINK;

  return (
    <main className="px-4 pb-24 pt-28 sm:px-6 sm:pt-32 print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <LuArrowLeft size={15} /> Back to portfolio
        </Link>
        <div className="flex flex-wrap gap-2">
          {docLink && (
            <a href={docLink} target="_blank" rel="noreferrer" className="btn-ghost">
              <LuExternalLink size={15} /> Google Doc
            </a>
          )}
          <PrintButton />
        </div>
      </div>

      <article className="card mx-auto max-w-4xl animate-fade-up p-8 shadow-xl shadow-ink/[.03] sm:p-14 print:border-0 print:p-0 print:shadow-none">
        {/* Header */}
        <header className="border-b border-line pb-8">
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">{fullName}</h1>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-lg text-muted">
            {titles.map((t, i) => (
              <span key={t} className="flex items-center gap-3">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-accent" />}
                <span className={i === 0 ? "text-ink" : ""}>{t}</span>
              </span>
            ))}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {links.map(({ href, text, icon: Icon }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                  <Icon size={15} />
                  {text || prettyUrl(href)}
                </a>
              </li>
            ))}
          </ul>
        </header>

        {/* Summary */}
        {about && (
          <ResumeSection title="Summary">
            <div className="rich leading-relaxed text-ink/80" dangerouslySetInnerHTML={{ __html: about }} />
          </ResumeSection>
        )}

        {/* Experience */}
        <ResumeSection title="Experience">
          {experiences.length ? (
            <div className="relative space-y-10 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line">
              {experiences.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <ExperienceEntry data={exp} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No experience listed yet.</p>
          )}
        </ResumeSection>

        {/* Skills */}
        {skills.length > 0 && (
          <ResumeSection title="Skills">
            <dl className="grid gap-4 sm:grid-cols-[160px_1fr]">
              {groupSkills(skills).map(([cat, items]) => (
                <React.Fragment key={cat}>
                  <dt className="font-mono text-xs uppercase tracking-wider text-muted sm:pt-1.5">{cat}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {items.map((s) => (
                      <span key={s.id} className="chip capitalize">{s.name}</span>
                    ))}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </ResumeSection>
        )}

        <ResumeSection title="Education">
          <div className="space-y-4">
            {EDUCATION.map((e) => (
              <div key={e.title} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div>
                  <p className="font-semibold text-ink">{e.title}</p>
                  <p className="text-sm text-muted">{e.place} · {e.detail}</p>
                </div>
                <p className="shrink-0 font-mono text-xs uppercase tracking-wider text-muted">{e.period}</p>
              </div>
            ))}
          </div>
        </ResumeSection>

        <ResumeSection title="Certifications">
          <ul className="grid gap-2 sm:grid-cols-2">
            {CERTIFICATIONS.map((c) => (
              <li key={c.name} className="text-ink/85">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">{c.name}</a>
                ) : (
                  c.name
                )}
                <span className="text-sm text-muted"> · {c.issuer}</span>
              </li>
            ))}
          </ul>
        </ResumeSection>

        <ResumeSection title="Awards">
          <ul className="space-y-2">
            {AWARDS.map((a) => (
              <li key={a.title} className="text-ink/85">
                <span className="font-semibold text-ink">{a.title}</span> <span className="font-mono text-xs text-muted">({a.year})</span>
                <span className="block text-sm text-muted">{a.detail}</span>
              </li>
            ))}
          </ul>
        </ResumeSection>
      </article>
    </main>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-line py-8 last:border-b-0 last:pb-0 md:grid-cols-[160px_1fr] md:gap-8">
      <h2 className="section-label pt-1">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
