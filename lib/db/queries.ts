import { read } from "./index";
import { projects, skills, experiences, resumeInfo } from "./schema";
import { asc, desc, eq } from "drizzle-orm";
import { seedDatabase } from "./seed";
import { resolveAssetUrl } from "@/lib/storage";

export async function getProjects() {
  await seedDatabase();
  const result = await read((db) =>
    db.select().from(projects).orderBy(asc(projects.order), desc(projects.createdAt))
  );

  return result.map((p) => ({
    ...p,
    image: resolveAssetUrl(p.image),
    video: resolveAssetUrl(p.video),
    technologies: JSON.parse(p.technologies || "[]") as string[],
  }));
}

export async function getProjectById(id: string) {
  await seedDatabase();
  const result = await read((db) => db.select().from(projects).where(eq(projects.id, id)).limit(1));

  if (result.length === 0) return null;
  const p = result[0];
  return {
    ...p,
    image: resolveAssetUrl(p.image),
    video: resolveAssetUrl(p.video),
    technologies: JSON.parse(p.technologies || "[]") as string[],
  };
}

export async function getSkills() {
  await seedDatabase();
  const result = await read((db) => db.select().from(skills).orderBy(asc(skills.order), asc(skills.name)));
  return result.map((s) => ({ ...s, image: resolveAssetUrl(s.image) }));
}

export async function getExperiences() {
  await seedDatabase();
  const result = await read((db) =>
    db.select().from(experiences).orderBy(asc(experiences.order), desc(experiences.createdAt))
  );

  return result.map((e) => ({
    ...e,
    keyTasks: JSON.parse(e.keyTasks || "[]") as string[],
  }));
}

export async function getResumeInfo() {
  await seedDatabase();
  const result = await read((db) =>
    db.select().from(resumeInfo).where(eq(resumeInfo.id, "main")).limit(1)
  );

  if (result.length === 0) return null;
  const r = result[0];
  return {
    ...r,
    titles: JSON.parse(r.titles || "[]") as string[],
  };
}
