import React from "react";
import Head from "next/head";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import {ResumeData, Experiances} from "../data/resumeData";
import { MainCircleIcon} from "../components/Main";
import {BsLink45Deg} from "react-icons/bs";
import {LINKS} from "../data/myLinks";

function Experience({data}) {
  return <div className="py-6">
    <p className="italic">
            <span className="font-bold italic">
              {data.title}
            </span>
      <span className="px-2">|</span>{data.location}
    </p>
    <p className="py-1 italic">{data.timeFrame}</p>
    <ul className="list-disc list-outside px-7 py-1 leading-relaxed">
      {
        data.keyTasks.map((lst, idx)=>(
            <li key={idx}>
              {lst}
            </li>
        ))
      }

    </ul>
  </div>;
}

const resume = () => {

  const hasExp = Experiances !== undefined && Experiances.length>0;
  const expNodes = hasExp ? (
      Experiances.map((exp, idx)=>(
          <Experience
              key={idx}
              data={exp}
          />
      ))
  ):(
      <div> could not load the Experiences</div>
  );
  return (
    <>
      <Head>
        <title>Biruk | Resume</title>
        <meta
            name="description"
            content="I’m a Full-Stack web developer specializing in building (and occasionally designing) exceptional digital experiences."
        />
        <link rel="icon" href="/fav.png"/>
      </Head>

      <div className="max-w-[940px] mx-auto p-2 pt-[120px]">
        <h2 className="text-center">Resume</h2>
        <div className="bg-[#d0d4d6] my-4 p-4 w-full flex justify-between items-center">
          <h2 className="text-center">Biruk B Kassa</h2>
          <div className="flex items-center">

            <a
                href="https://www.linkedin.com/in/biruk-belay/"
                target="_blank"
                rel="noreferrer">
              <FaLinkedinIn size={20} style={{marginRight: "1rem"}}/>
            </a>
            <a
                href="https://github.com/birukbelay"
                target="_blank"
                rel="noreferrer">
              <FaGithub size={20} style={{marginRight: "1rem"}}/>
            </a>
            <MainCircleIcon
                link={LINKS.RESUME_LINK}
                icon={<BsLink45Deg/>}
                small={true}
            />
          </div>
        </div>

        <div className="text-center py-4 text-xl font-bold uppercase tracking-wider">
          <div className="hidden sm:block">
            <p>
              {ResumeData.titles[0]}<span className="px-1">|</span> {ResumeData.titles[1]}{" "}
              <span className="px-1">|</span> {ResumeData.titles[2]}
            </p>
          </div>
          <div className="block sm:hidden">
            <p>  {ResumeData.titles[0]}</p>
            <p className="py-2"> {ResumeData.titles[1]}</p>
            <p> {ResumeData.titles[2]}</p>
          </div>
        </div>
        <p>
          {ResumeData.about}
        </p>

        {/* Skills */}
        <div className="text-center py-4">
          <h5 className="text-center underline text-[18px] py-2">Skills</h5>
          <p className="py-2">
            <span className="font-bold">Front-End Skills</span>
            <span className="px-2">|</span> HTML
            <span className="px-2">|</span>CSS
            <span className="px-2">|</span>React
            <span className="px-2">|</span>Next js
            <span className="px-2">|</span>Tailwind
            <span className="px-2">|</span> Firebase
          </p>
          <p className="py-2">
            <span className="font-bold">Back-End Skills</span>
            <span className="px-2">|</span>Node js
            <span className="px-2">|</span>Nest js
            <span className="px-2">|</span>Golang
            <span className="px-2">|</span>Python(Flask)
          </p>
        </div>

        <h5 className="text-center underline text-[18px] py-4">
          Experiences
        </h5>
        {/* Experience */}
        {expNodes}


      </div>
    </>
  );
};

export default resume;
