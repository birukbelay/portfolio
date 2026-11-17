import { localDb as db, localClient, d1Config, d1Available, markD1Down, ensureDbInitialized } from "./index";
import { bootstrapRemoteFromLocal } from "./sync-core.mjs";
import { projects, skills, experiences, resumeInfo } from "./schema";
import { projectsData } from "@/data/projectsData";
import { ResumeData, Experiances } from "@/data/resumeData";
import { LINKS } from "@/data/myLinks";
import { eq } from "drizzle-orm";

const initialSkills = [
  { name: "Nodejs", image: "/assets/skills/node.png", category: "Back-End" },
  { name: "Nest js", image: "/assets/skills/nestjs.png", category: "Back-End" },
  { name: "Golang", image: "/assets/skills/golang.png", category: "Back-End" },
  { name: "flask", image: "/assets/skills/flask.png", category: "Back-End" },
  { name: "Postgresql", image: "/assets/skills/Postgresql.png", category: "Databases" },
  { name: "mysql", image: "/assets/skills/sql.png", category: "Databases" },
  { name: "mongo", image: "/assets/skills/mongo.png", category: "Databases" },
  { name: "firebase", image: "/assets/skills/firebase.png", category: "Databases" },
  { name: "React", image: "/assets/skills/react.png", category: "Front-End" },
  { name: "Next js", image: "/assets/skills/nextjs.png", category: "Front-End" },
  { name: "Aws", image: "/assets/skills/aws.png", category: "Tools / Cloud" },
  { name: "Kubernetes", image: "/assets/skills/kubernetes.png", category: "Tools / Cloud" },
  { name: "Redux Toolkit", image: "/assets/skills/redux.webp", category: "Front-End" },
  { name: "Tailwind Css", image: "/assets/skills/tailwind.png", category: "Front-End" },
  { name: "Html", image: "/assets/skills/html.png", category: "Front-End" },
  { name: "Css", image: "/assets/skills/css.png", category: "Front-End" },
  { name: "Javascript", image: "/assets/skills/javascript.png", category: "Front-End" },
];

let seedPromise: Promise<void> | null = null;

/**
 * Fills empty local tables with the data in /data, then copies the local data into
 * any D1 table that is still empty. Runs once per server process.
 */
export function seedDatabase(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeed() {
  await ensureDbInitialized();

  // 1. Seed Projects
  const existingProjects = await db.select().from(projects).limit(1);
  if (existingProjects.length === 0) {
    console.log("Seeding initial projects...");
    let order = 0;
    for (const [id, proj] of Object.entries(projectsData)) {
      await db.insert(projects).values({
        id: String(proj.id || id),
        name: proj.name,
        tech: proj.tech,
        image: proj.image,
        technologies: JSON.stringify(proj.technologies || []),
        desc: proj.desc.trim(),
        code: (proj as any).code || null,
        demo: (proj as any).demo || null,
        video: (proj as any).video || null,
        order: order++,
      });
    }
  }

  // 2. Seed Skills
  const existingSkills = await db.select().from(skills).limit(1);
  if (existingSkills.length === 0) {
    console.log("Seeding initial skills...");
    let order = 0;
    for (const s of initialSkills) {
      await db.insert(skills).values({
        id: s.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        name: s.name,
        category: s.category,
        image: s.image,
        order: order++,
      });
    }
  }

  // 3. Seed Experiences
  const existingExp = await db.select().from(experiences).limit(1);
  if (existingExp.length === 0) {
    console.log("Seeding initial experiences...");
    let order = 0;
    for (const exp of Experiances) {
      await db.insert(experiences).values({
        id: `exp-${order}`,
        title: exp.title,
        location: exp.location,
        timeFrame: exp.timeFrame,
        keyTasks: JSON.stringify(exp.keyTasks || []),
        order: order++,
      });
    }
  }

  // 4. Seed Resume Info
  const existingResume = await db.select().from(resumeInfo).where(eq(resumeInfo.id, "main")).limit(1);
  if (existingResume.length === 0) {
    console.log("Seeding initial resume info...");
    await db.insert(resumeInfo).values({
      id: "main",
      fullName: "Biruk B Kassa",
      about: ResumeData.about,
      titles: JSON.stringify(ResumeData.titles),
      resumeLink: LINKS.RESUME_LINK,
      linkedinUrl: LINKS.LINKEDIN_URL,
      githubUrl: LINKS.GITHUB_URL,
      mediumUrl: LINKS.MediumUrl,
    });
  }

  // 5. A fresh D1 database gets the local content
  if (d1Config && d1Available()) {
    try {
      const copied = await bootstrapRemoteFromLocal(localClient, d1Config);
      if (copied.length) console.log(`[db] Copied local data into empty D1 tables: ${copied.join(", ")}`);
    } catch (err) {
      markD1Down(err);
    }
  }
}
