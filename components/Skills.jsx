import React from "react";
import Image from "next/image";

const skillsArr = [
  { name: "Html", image: "/assets/skills/html.png" },
  { name: "Css", image: "/assets/skills/css.png" },
  { name: "Javascipt", image: "/assets/skills/javascript.png" },
  { name: "React", image: "/assets/skills/react.png" },
  { name: "Tailwind Css", image: "/assets/skills/tailwind.png" },
  { name: "Next js", image: "/assets/skills/nextjs.png" },
  { name: "Nodejs", image: "/assets/skills/node.png" },
  { name: "mongo", image: "/assets/skills/mongo.png" },
  { name: "firebase", image: "/assets/skills/firebase.png" },
];

const Skills = () => {
  return (
    <div id="skills" className="w-full lg:h-screen p-2">
      <div className="max-w-[1240px] mx-auto flex flex-col justify-center h-full">
        <p className="text-xl tracking-widest uppercase text-[#5651e5]">
          Skills
        </p>
        <h2>What I Can Do</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-8">
          {/* {skillsArr.map((itm) => {
            <SkillsItmes name={itm.name} image={itm.image} />;
          })} */}
          <SkillsItmes name={skillsArr[0].name} image={skillsArr[0].image} />
          <SkillsItmes name={skillsArr[1].name} image={skillsArr[1].image} />
          <SkillsItmes name={skillsArr[2].name} image={skillsArr[2].image} />
          <SkillsItmes name={skillsArr[3].name} image={skillsArr[3].image} />
          <SkillsItmes name={skillsArr[4].name} image={skillsArr[4].image} />
          <SkillsItmes name={skillsArr[5].name} image={skillsArr[5].image} />
          <SkillsItmes name={skillsArr[6].name} image={skillsArr[6].image} />
          <SkillsItmes name={skillsArr[7].name} image={skillsArr[7].image} />
          <SkillsItmes name={skillsArr[8].name} image={skillsArr[8].image} />
        </div>
      </div>
    </div>
  );
};

export default Skills;

export const SkillsItmes = ({ name, image }) => {
  return (
    <div className="p-6 shadow-xl rounded-xl hover:scale-105 ease-in duration-300">
      <div className="grid grid-cols-2 gap-4 justify-center items-center">
        <div className="m-auto">
          <Image src={image} width="64px" height="64px" alt="/" />
        </div>
        <div className="flex flex-col items-center justify-center">
          <h3> {name}</h3>
        </div>
      </div>
    </div>
  );
};
