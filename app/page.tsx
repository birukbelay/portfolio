import React from "react";
import { getExperiences, getProjects, getResumeInfo, getSkills } from "@/lib/db/queries";
import { About, Contact, Experience, Hero, Skills, Work, groupSkills } from "@/components/site/HomeSections";
import { parseTimeFrame, splitTitle } from "@/lib/experience";
import { LINKS } from "@/data/myLinks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, skills, experiences, resume] = await Promise.all([
    getProjects(),
    getSkills(),
    getExperiences(),
    getResumeInfo(),
  ]);

  const profile = {
    fullName: resume?.fullName || "Biruk B Kassa",
    titles: resume?.titles?.length ? resume.titles : ["Software Engineer"],
    resumeLink: resume?.resumeLink || LINKS.RESUME_LINK,
    linkedinUrl: resume?.linkedinUrl || LINKS.LINKEDIN_URL,
    githubUrl: resume?.githubUrl || LINKS.GITHUB_URL,
    mediumUrl: resume?.mediumUrl || LINKS.MediumUrl,
    email: LINKS.EMAIL,
  };

  // Earliest start year of a real role (not studies) → "building since"
  const startYears = experiences
    .filter((e) => !/student|intern/i.test(splitTitle(e.title).role))
    .map((e) => Number(parseTimeFrame(e.timeFrame)?.start.year))
    .filter((y) => y > 1990);
  const years = startYears.length ? new Date().getFullYear() - Math.min(...startYears) : null;

  // Top two skills from back-end and front-end for the hero card
  const grouped = Object.fromEntries(groupSkills(skills));
  const stack = [...(grouped["Back-End"] ?? []).slice(0, 2), ...(grouped["Front-End"] ?? []).slice(0, 2)].map((s) => s.name);

  const stats = [
    years ? { value: `${years}+`, label: "years building software" } : null,
    { value: String(projects.length), label: "projects shipped" },
    { value: String(experiences.filter((e) => !/student/i.test(e.title)).length), label: "teams & companies" },
    { value: String(skills.length), label: "technologies in my toolkit" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <main>
      <Hero profile={profile} stack={stack.length ? stack : ["NestJS", "Go", "React", "Next.js"]} stats={stats} />
      <About />
      <Experience items={experiences} />
      <Work projects={projects} />
      <Skills skills={skills} />
      <Contact profile={profile} />
    </main>
  );
}
