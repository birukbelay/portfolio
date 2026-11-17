import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tech: text("tech").notNull(),
  image: text("image").notNull(),
  technologies: text("technologies").notNull(), // JSON array string
  desc: text("desc").notNull(),
  code: text("code"),
  demo: text("demo"),
  video: text("video"),
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Other"), // "Back-End", "Front-End", "Databases", "Other"
  image: text("image").notNull(),
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  timeFrame: text("time_frame").notNull(),
  keyTasks: text("key_tasks").notNull(), // JSON array string
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const resumeInfo = sqliteTable("resume_info", {
  id: text("id").primaryKey().default("main"),
  fullName: text("full_name").notNull().default("Biruk B Kassa"),
  about: text("about").notNull(),
  titles: text("titles").notNull(), // JSON array string e.g. ["Software Engineer", ...]
  resumeLink: text("resume_link"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  mediumUrl: text("medium_url"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password"), // hashed password
  role: text("role").notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
