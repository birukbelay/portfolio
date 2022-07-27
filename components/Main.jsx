import React from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import Link from "next/link";
export const Main = () => {
  return (
    <div id="home" className="w-full h-screen text-center">
      <div className="max-w-[1240px] w-full h-full mx-auto p-2 flex justify-center items-center">
        <div>
          <p className="uppercase text-sm tracking-widest text-gray-600">
            Let's Build something Together
          </p>
          <h1 className="py-4 text-gray-700">
            {" "}
            Hi, I'm <span className="text-[#5651e5]"> Bk</span>{" "}
          </h1>
          <h1 className="py-2 text-gray-700"> A Software Engineer</h1>
          <p className="py-4 text-gray-600 max-w-[70%] m-auto">
            {" "}
            I’m focused on building responsive front-end web applications while
            learning back-end technologies.
          </p>
          <div className="flex items-center justify-between max-w-[330px] m-auto py-4">
            <MainCircleIcon link={""} icon={<FaLinkedinIn />} />
            <MainCircleIcon link={""} icon={<FaGithub />} />
            <MainCircleLink
              link={""}
              icon={<AiOutlineMail link={"/#contact"} />}
            />
            <MainCircleLink
              link={""}
              icon={<BsFillPersonLinesFill link={"/resume"} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;

export const MainCircleIcon = ({ icon, link }) => {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <div className="rounded-full shadow-lg shadow-gray-400 p-6 cursor-pointer hover:scale-105 ease-in duration-300">
        {icon}
      </div>
    </a>
  );
};

export const MainCircleLink = ({ icon, link }) => {
  return (
    <Link href={link}>
      <a href="">
        <div className="rounded-full shadow-lg shadow-gray-400 p-6 cursor-pointer hover:scale-105 ease-in duration-300">
          {icon}
        </div>
      </a>
    </Link>
  );
};
