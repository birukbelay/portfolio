"use server";

import { auth } from "@/auth";
import { write, WriteError } from "@/lib/db";
import { canonicalAssetUrl } from "@/lib/storage";
import { projects, skills, experiences, resumeInfo } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

class ActionError extends Error {}

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new ActionError("Your session has expired. Please sign in again.");
  }
  return session;
}

type Failure = { success: false; error: string };

/**
 * Runs an action and turns failures into `{ success: false, error }`.
 * (Errors thrown from server actions are hidden in production, so the UI couldn't explain them.)
 */
async function guard<T>(fn: () => Promise<T>): Promise<T | Failure> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof WriteError || err instanceof ActionError) return { success: false, error: err.message };
    console.error("[admin action]", err);
    return { success: false, error: "Something went wrong while saving. Please try again." };
  }
}

// ----------------- PROJECTS -----------------
async function saveProjectImpl(data: {
  id?: string;
  name: string;
  tech: string;
  image: string;
  technologies: string[];
  desc: string;
  code?: string;
  demo?: string;
  video?: string;
  order?: number;
}) {
  await checkAdminAuth();

  const id = data.id || Date.now().toString();
  const fields = {
    name: data.name,
    tech: data.tech,
    image: canonicalAssetUrl(data.image),
    technologies: JSON.stringify(data.technologies),
    desc: data.desc,
    code: data.code || null,
    demo: data.demo || null,
    video: canonicalAssetUrl(data.video) || null,
    order: data.order ?? 0,
  };

  const { synced } = await write((db) =>
    db.insert(projects).values({ id, ...fields }).onConflictDoUpdate({ target: projects.id, set: { ...fields, updatedAt: new Date() } })
  );

  revalidatePath("/");
  revalidatePath(`/${id}`);
  revalidatePath("/admin/projects");
  return { success: true, id, synced };
}

async function deleteProjectImpl(id: string) {
  await checkAdminAuth();

  const { synced } = await write((db) => db.delete(projects).where(eq(projects.id, id)));

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { success: true, synced };
}

// ----------------- SKILLS -----------------
async function saveSkillImpl(data: {
  id?: string;
  name: string;
  category: string;
  image: string;
  order?: number;
}) {
  await checkAdminAuth();

  const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const fields = {
    name: data.name,
    category: data.category,
    image: canonicalAssetUrl(data.image),
    order: data.order ?? 0,
  };

  const { synced } = await write((db) =>
    db.insert(skills).values({ id, ...fields }).onConflictDoUpdate({ target: skills.id, set: fields })
  );

  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin/skills");
  return { success: true, id, synced };
}

async function deleteSkillImpl(id: string) {
  await checkAdminAuth();

  const { synced } = await write((db) => db.delete(skills).where(eq(skills.id, id)));

  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin/skills");
  return { success: true, synced };
}

// ----------------- EXPERIENCES -----------------
async function saveExperienceImpl(data: {
  id?: string;
  title: string;
  location: string;
  timeFrame: string;
  keyTasks: string[];
  order?: number;
}) {
  await checkAdminAuth();

  const id = data.id || `exp-${Date.now()}`;
  const fields = {
    title: data.title,
    location: data.location,
    timeFrame: data.timeFrame,
    keyTasks: JSON.stringify(data.keyTasks),
    order: data.order ?? 0,
  };

  const { synced } = await write((db) =>
    db.insert(experiences).values({ id, ...fields }).onConflictDoUpdate({ target: experiences.id, set: fields })
  );

  revalidatePath("/resume");
  revalidatePath("/admin/experiences");
  return { success: true, id, synced };
}

async function deleteExperienceImpl(id: string) {
  await checkAdminAuth();

  const { synced } = await write((db) => db.delete(experiences).where(eq(experiences.id, id)));

  revalidatePath("/resume");
  revalidatePath("/admin/experiences");
  return { success: true, synced };
}

// ----------------- RESUME INFO -----------------
async function saveResumeInfoImpl(data: {
  fullName: string;
  about: string;
  titles: string[];
  resumeLink?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  mediumUrl?: string;
}) {
  await checkAdminAuth();

  const fields = {
    fullName: data.fullName,
    about: data.about,
    titles: JSON.stringify(data.titles),
    resumeLink: data.resumeLink || null,
    linkedinUrl: data.linkedinUrl || null,
    githubUrl: data.githubUrl || null,
    mediumUrl: data.mediumUrl || null,
  };

  const { synced } = await write((db) =>
    db.insert(resumeInfo).values({ id: "main", ...fields }).onConflictDoUpdate({ target: resumeInfo.id, set: { ...fields, updatedAt: new Date() } })
  );

  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin/resume");
  return { success: true, synced };
}

/** Saves a new display order: `ids` is the full list of experience ids, top to bottom. */
async function reorderExperiencesImpl(ids: string[]) {
  await checkAdminAuth();

  let synced = true;
  for (const [index, id] of ids.entries()) {
    const res = await write((db) => db.update(experiences).set({ order: index }).where(eq(experiences.id, id)));
    synced &&= res.synced;
  }

  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin/experiences");
  return { success: true, synced };
}

// ----------------- Exported actions -----------------
export async function saveProject(...args: Parameters<typeof saveProjectImpl>) {
  return guard(() => saveProjectImpl(...args));
}
export async function deleteProject(...args: Parameters<typeof deleteProjectImpl>) {
  return guard(() => deleteProjectImpl(...args));
}
export async function saveSkill(...args: Parameters<typeof saveSkillImpl>) {
  return guard(() => saveSkillImpl(...args));
}
export async function deleteSkill(...args: Parameters<typeof deleteSkillImpl>) {
  return guard(() => deleteSkillImpl(...args));
}
export async function saveExperience(...args: Parameters<typeof saveExperienceImpl>) {
  return guard(() => saveExperienceImpl(...args));
}
export async function deleteExperience(...args: Parameters<typeof deleteExperienceImpl>) {
  return guard(() => deleteExperienceImpl(...args));
}
export async function saveResumeInfo(...args: Parameters<typeof saveResumeInfoImpl>) {
  return guard(() => saveResumeInfoImpl(...args));
}
export async function reorderExperiences(...args: Parameters<typeof reorderExperiencesImpl>) {
  return guard(() => reorderExperiencesImpl(...args));
}
