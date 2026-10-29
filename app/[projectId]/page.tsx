import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiRadioButtonFill } from "react-icons/ri";
import { projectsData } from "@/data/projectsData";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateStaticParams() {
  return Object.keys(projectsData).map((projectId) => ({
    projectId,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = (projectsData as Record<string, any>)[projectId];

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.name} | Biruk Kassa`,
    description: project.desc,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const project = (projectsData as Record<string, any>)[projectId];

  if (!project) {
    notFound();
  }

  return (
    <div className="pt-20 w-full">
      <div className="w-screen h-[50vh] relative">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-black/40 z-10" />
        <Image
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={project.image}
          alt={project.name}
        />
        <div className="absolute top-[70%] max-w-[1240px] w-full left-[50%] translate-x-[-50%] text-white py-4 z-10 px-4">
          <h2 className="py-2">{project.name}</h2>
          <h3 className="text-xl font-normal">{project.tech}</h3>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto p-4 grid md:grid-cols-5 gap-8 py-8">
        <div className="col-span-4">
          <p className="uppercase text-sm tracking-widest text-[#5651e5] font-semibold">
            Project
          </p>
          <h2 className="py-2">Overview</h2>
          <p className="py-2 text-gray-700 leading-relaxed">{project.desc}</p>
          <div className="flex gap-4 mt-4">
            {project.code ? (
              <a href={project.code} target="_blank" rel="noreferrer">
                <button className="px-8 py-2">Code</button>
              </a>
            ) : null}
            {project.demo ? (
              <a href={project.demo} target="_blank" rel="noreferrer">
                <button className="px-8 py-2">Demo</button>
              </a>
            ) : null}
          </div>

          {project.video ? (
            <div className="mt-8">
              <video
                className="w-full shadow-xl shadow-gray-400 rounded-xl"
                autoPlay
                loop
                muted
                playsInline
                id="video"
              >
                <source src={project.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}
        </div>

        <div className="col-span-4 md:col-span-1 shadow-xl shadow-gray-400 rounded-xl py-4 h-fit">
          <div className="p-4">
            <p className="text-center font-bold pb-2">Technologies</p>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              {project.technologies.map((item: string, key: number) => (
                <p key={key} className="text-gray-600 py-2 flex items-center text-sm">
                  <RiRadioButtonFill className="pr-1 text-[#5651e5] shrink-0" size={18} />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <Link href="/#projects" className="underline cursor-pointer text-gray-700 hover:text-black">
            Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
