import React from "react";
import Main from "@/components/Main";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects, { Project } from "@/components/Projects";
import Contact from "@/components/Contact";
import { projectsData } from "@/data/projectsData";

export default function Home() {
  const projects: Project[] = Object.keys(projectsData).map(
    (k) => (projectsData as Record<string, Project>)[k]
  );

  return (
    <main className="mx-4 px-4">
      <Main />
      <About />
      <Skills />
      <Projects projects={projects} />
      <Contact />
    </main>
  );
}
