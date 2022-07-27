import React from "react";
import Image from "next/image";
import Link from "next/link";
import propertyImg from "../public/assets/projects/property.jpg";
import CryptoImg from "../public/assets/projects/crypto.jpg";
import NetflixImg from "../public/assets/projects/netflix.jpg";
import TwitchImg from "../public/assets/projects/twitch.jpg";
const projectImages = [{ image: "/../public/assets/projects/property.jpg" }];

export interface Project{
  id:string
  name:string
  tech:string
  image:string
  technologies:string[]
  desc:string
  code?:string
  demo?:string
}
interface pageProps{
  projects:Project[]
}

const Projects = ({ projects }:pageProps) => {
  console.log("pojecCOMP----- ", projects);

  const hasProjects = projects !== undefined && projects.length > 0;

  const nodes = hasProjects ? (
    projects.map((proj) => (
      <ProjectItem
        key={proj.id}
        image={proj.image}
        projectUrl={proj.id}
        tech={proj.tech}
        title={proj.name}
      />
    ))
  ) : (
    <div>
      <em>no Projects in this page. Go back To main Page</em>
    </div>
  );

  return (
    <div id="projects" className="w-full">
      <div className="max-w-[1240px] mx-auto px-2 py-16">
        <p className="text-xl tracking-widest uppercase text-[#5651e5]">
          Projects
        </p>
        <h2 className="py-4">What I've Built</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {nodes}

          <ProjectItem
            image={propertyImg}
            projectUrl="/projects"
            tech="React Js"
            title={"Property"}
          />
          <ProjectItem
            image={CryptoImg}
            projectUrl="/projects"
            tech="Solidity"
            title={"Crypto project"}
          />
          <ProjectItem
            image={NetflixImg}
            projectUrl="/projects"
            tech="React js, React-Redux"
            title={"Netflix"}
          />
          <ProjectItem
            image={TwitchImg}
            projectUrl="/projects"
            tech="Vue js"
            title={"Twitch Image"}
          />
        </div>
      </div>
    </div>
  );
};

export default Projects;


export const ProjectItem = ({ title, image, tech, projectUrl }) => {
  return (
    <div className="relative flex items-center justify-center h-80 w-full shadow-xl shadow-gray-400 rounded-xl p-4 group hover:bg-gradient-to-r from-[#5651e5] to-[#709dff]">
      <div style={{width: '100%', height: '100%'}}>
      <Image
         layout='fill'
        className="rounded-xl group-hover:opacity-30"
        src={image}
        alt="/"
      />
      </div>
      <div className="hidden group-hover:block absolute top-[50%] left-[50%] translate-x-[-50%] translate-y[-50%]">
        <h3 className="text-2xl text-white tracking-wider text-center">
          {title}
        </h3>
        <p className="pb-4 pt-2 text-white text-center">{tech}</p>
        <Link href={projectUrl}>
          <p className="text-center py-3 rounded-lg cursor-pointer bg-white text-gray-700">
            More Info
          </p>
        </Link>
      </div>
    </div>
  );
};
