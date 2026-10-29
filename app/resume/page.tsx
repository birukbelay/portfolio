import React from "react";
import type { Metadata } from "next";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { BsLink45Deg } from "react-icons/bs";
import { ResumeData, Experiances } from "@/data/resumeData";
import { MainCircleIcon } from "@/components/Main";
import { LINKS } from "@/data/myLinks";

export const metadata: Metadata = {
  title: "Biruk | Resume",
  description:
    "I’m a Full-Stack web developer specializing in building (and occasionally designing) exceptional digital experiences.",
  icons: {
    icon: "/fav.png",
  },
};

interface ExperienceProps {
  data: {
    title: string;
    location: string;
    timeFrame: string;
    keyTasks: string[];
  };
}

function Experience({ data }: ExperienceProps) {
  return (
    <div className="py-6">
      <p className="italic">
        <span className="font-bold italic">{data.title}</span>
        <span className="px-2">|</span>
        {data.location}
      </p>
      <p className="py-1 italic">{data.timeFrame}</p>
      <ul className="list-disc list-outside px-7 py-1 leading-relaxed">
        {data.keyTasks.map((lst, idx) => (
          <li key={idx}>{lst}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumePage() {
  const hasExp = Experiances !== undefined && Experiances.length > 0;
  const expNodes = hasExp ? (
    Experiances.map((exp, idx) => <Experience key={idx} data={exp} />)
  ) : (
    <div>Could not load experiences</div>
  );

  return (
    <div className="max-w-[940px] mx-auto p-2 pt-[120px]">
      <h2 className="text-center">Resume</h2>
      <div className="bg-[#d0d4d6] my-4 p-4 w-full flex justify-between items-center rounded-lg">
        <h2 className="text-center text-xl sm:text-2xl">Biruk B Kassa</h2>
        <div className="flex items-center">
          <a
            href={LINKS.LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn size={20} className="mr-4 text-gray-700 hover:text-black" />
          </a>
          <a
            href={LINKS.GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub size={20} className="mr-4 text-gray-700 hover:text-black" />
          </a>
          <MainCircleIcon
            link={LINKS.RESUME_LINK}
            icon={<BsLink45Deg size={20} />}
            small={true}
          />
        </div>
      </div>

      <div className="text-center py-4 text-xl font-bold uppercase tracking-wider">
        <div className="hidden sm:block">
          <p>
            {ResumeData.titles[0]}
            <span className="px-1">|</span> {ResumeData.titles[1]}
            <span className="px-1">|</span> {ResumeData.titles[2]}
          </p>
        </div>
        <div className="block sm:hidden">
          <p>{ResumeData.titles[0]}</p>
          <p className="py-2">{ResumeData.titles[1]}</p>
          <p>{ResumeData.titles[2]}</p>
        </div>
      </div>
      <p className="leading-relaxed text-gray-700">{ResumeData.about}</p>

      {/* Skills */}
      <div className="text-center py-4">
        <h5 className="text-center underline text-[18px] py-2 font-bold">Skills</h5>
        <p className="py-2 text-gray-700">
          <span className="font-bold text-black">Back-End Skills</span>
          <span className="px-2">|</span>Node js
          <span className="px-2">|</span>Nest js
          <span className="px-2">|</span>Golang
          <span className="px-2">|</span>Python(Flask)
        </p>
        <p className="py-2 text-gray-700">
          <span className="font-bold text-black">Databases</span>
          <span className="px-2">|</span>Postgresql
          <span className="px-2">|</span>Mongodb
          <span className="px-2">|</span>MySql
          <span className="px-2">|</span>Firebase
        </p>
        <p className="py-2 text-gray-700">
          <span className="font-bold text-black">Front-End Skills</span>
          <span className="px-2">|</span>HTML
          <span className="px-2">|</span>CSS
          <span className="px-2">|</span>React
          <span className="px-2">|</span>Next js
          <span className="px-2">|</span>Tailwind
        </p>
      </div>

      <h5 className="text-center underline text-[18px] py-4 font-bold">
        Experiences
      </h5>
      {/* Experience list */}
      {expNodes}
    </div>
  );
}
