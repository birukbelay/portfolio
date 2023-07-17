import React from "react";
import Image from "next/image";
import AboutImg from "../public/assets/about.jpg";
import Link from "../node_modules/next/link";

export const About = () => {
  return (
    <div id="about" className="w-full md:h-screen p-2 flex items-center py-2">
      <div className="max-w-[1240px] m-auto md:grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <p className="uppercase text-xl tracking-widest text-[#5651e5]">
            About
          </p>
          <h2 className="py-4">Who I Am</h2>
          <p className="py-2 text-gray-600">Full stack developer, web and mobile</p>
          <p className="py-2 text-gray-600">
            I am a full-stack web & mobile developer with a deep understanding of making quality web & mobile apps using different frameworks and platforms.

          </p>
          <p  className="py-2 text-gray-600">
            <b className='text-l text-[#5651e5] pr-2'>
            - Backend
            </b>
             I have built extensible backend apps using Golang, Nodejs, and flask. I&apos;m also experianced in integrating apps with d/t services like firebase
          </p>
          <p  className="py-2 text-gray-600">
            <b className='text-l text-[#5651e5] pr-2'>
            - Frontend
              </b>
            In the front end I am an expert in react, Next js and very familiar with state management tools like Redux, Redux toolkit, React query, and apollo graphql.

          </p>
          <p  className="py-2 text-gray-600">
            <b className='text-l text-[#5651e5] pr-2'>
               - Ui/Ux :
            </b>
            I can make beautiful and clean user interfaces for websites and am also Experienced in working with UI libraries like material U, ANT design, tailwind CSS & styled-components and can make high-quality and responsive web applications.

          </p>
          <p className="py-2 text-gray-600">
            <b className='text-l text-[#5651e5] pr-2'>
            - Mobile
            </b>
            I can build quality mobile apps using Flutter with amazing UI and I am familiar with state management tools like provider, bloc and Getx.

          </p>
          <p>
            I have created & improved many successful apps for clients in e-commerce, entertainment, ERP, and tourism.

          </p>
          <p className="py-2 text-gray-600 underline cursor-pointer">
           <Link href={'#projects'}>Check out some of my latest projects </Link>
             
          </p>
        </div>
        <div className="w-full h-auto m-auto shadow-xl shadow-gray-400 rounded-xl flex items-center justify-center p-1 hover:scale-105 ease-in duration-300">
          <Image className="rounded-xl" src={AboutImg} alt="/" />
        </div>
      </div>
    </div>
  );
};
export default About;
