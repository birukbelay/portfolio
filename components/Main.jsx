import React from "react";
import { AiOutlineMail , AiFillFilePdf} from "react-icons/ai";
import { FaLinkedinIn, FaGithub, FaMedium } from "react-icons/fa";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import Link from "next/link";
import {LINKS} from "../data/myLinks";
export const Main = () => {
  return (
    <div id="home" className="w-full pt-20 h-screen text-center">
      <div className="max-w-[1240px] w-full h-full mx-auto p-2 flex justify-center items-center">
        <div>
          <p className="uppercase text-sm tracking-widest text-gray-600">
            Let&apos;s Build something Together
          </p>
          <h1 className="py-4 text-gray-700">
            {" "}
            Hi, I&apos;m <span className="text-[#5651e5]"> Biruk</span>{" "}
          </h1>
          <h1 className="py-2 text-gray-700"> Software Engineer</h1>
          <p className="py-4 text-gray-600 max-w-[70%] m-auto">
            {" "}
            I’m a Software Engineer with Extensive experiance in developing high quality frontend and backend applications.
          </p>
          <div className="flex items-center justify-between max-w-[430px] m-auto py-4">
            <MainCircleIcon link={LINKS.LINKEDIN_URL} icon={<FaLinkedinIn />} />
            <MainCircleIcon link={LINKS.GITHUB_URL} icon={<FaGithub />} />
            <MainCircleIcon link={LINKS.MediumUrl} icon={<FaMedium />} />
            <MainCircleLink link={"/#contact"} icon={<AiOutlineMail  />} />
            <MainCircleLink link={"/resume"} icon={<BsReverseLayoutTextSidebarReverse />}/>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
const Styles ={
  small: "rounded-full shadow-lg shadow-gray-400  p-3 cursor-pointer hover:scale-155 ease-in duration-300",
  big:"rounded-full shadow-lg shadow-gray-400 p-6 cursor-pointer hover:scale-105 ease-in duration-300"
}
export const MainCircleIcon = ({ icon, link, small }) => {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <div className={small ? Styles.small: Styles.big}>
        {icon}
      </div>
    </a>
  );
};

export const MainCircleLink = ({ icon, link, small }) => {
  return (
    <Link href={link}>
      <a href="">
        <div className={small ? Styles.small: Styles.big}>
          {icon}
        </div>
      </a>
    </Link>
  );
};
