import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface Project {
  id: string;
  name: string;
  tech: string;
  image: string;
  technologies: string[];
  desc: string;
  code?: string;
  demo?: string;
  video?: string;
}

interface PageProps {
  projects: Project[];
}

const Projects = ({ projects }: PageProps) => {
  const hasProjects = projects !== undefined && projects.length > 0;

  const nodes = hasProjects ? (
    projects.map((proj, idx) => (
      <ProjectItem
        key={idx}
        image={proj.image}
        projectUrl={proj.id}
        tech={proj.tech}
        title={proj.name}
      />
    ))
  ) : (
    <div>
      <em>No projects available.</em>
    </div>
  );

  return (
    <div id="projects" className="w-full">
      <div className="max-w-[1240px] mx-auto px-2 py-16">
        <p className="text-xl tracking-widest uppercase text-[#5651e5]">
          Projects
        </p>
        <h2 className="py-4">Some of My Projects</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {nodes}
        </div>
      </div>
    </div>
  );
};

export default Projects;

interface ProjectItemProps {
  title: string;
  image: string;
  tech: string;
  projectUrl: string;
}

export const ProjectItem = ({ title, image, tech, projectUrl }: ProjectItemProps) => {
  return (
    <div className="relative flex items-center justify-center h-80 w-full shadow-xl shadow-gray-400 rounded-xl p-4 group hover:bg-gradient-to-r from-[#5651e5] to-[#709dff] overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="rounded-xl object-cover group-hover:opacity-20 transition-opacity duration-300"
          src={image}
          alt={title}
        />
      </div>
      <div className="hidden group-hover:flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 text-center">
        <h3 className="text-2xl text-white tracking-wider text-center font-bold">
          {title}
        </h3>
        <p className="pb-4 pt-2 text-white text-center text-sm">{tech}</p>
        <Link
          href={`/${projectUrl}`}
          className="block w-36 text-center py-2.5 rounded-lg cursor-pointer bg-white text-gray-700 font-bold hover:bg-gray-100 transition shadow-md"
        >
          More Info
        </Link>
      </div>
    </div>
  );
};
