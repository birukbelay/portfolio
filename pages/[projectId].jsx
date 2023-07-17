import React, { useState, useEffect } from "react";
import Image from "next/image";
import propertyImg from "../public/assets/projects/property.jpg";
import { RiRadioButtonFill } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
// import { useQuery } from "react-query";
import {projectsData} from "../data/projectsData";
// const fetchProject = async (id) => {
//   return axios
//     .get("/api/project/" + id)
//     .then((res) => res.data);
// };

// // Generates `/posts/1` and `/posts/2`
// export async function getStaticPaths() {
//   return {
//     paths: [{ params: { projectId: "1" } }, { params: { projectId: "2" } }],
//     fallback: false, // can also be true or 'blocking'
//   };
// }
export const getServerSideProps = async ({ params: { projectId } }) => {
  // const proj = await fetchProject(projectId);
  // console.log("the post ==----", proj);

  return {
    props: {
      project: projectsData[projectId],
    },
  };
};

const Project = ({ project }) => {
  // const {
  //   query: { projectId },
  // } = useRouter()
  const router = useRouter();
  const query = router.query;

  useEffect(() => {
    const handleShadow = () => {};
  }, []);

  return (
    <div className="pt-20 w-full">
      <div className="w-screen h-[50vh] relative">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-black/40 z-10" />
        <Image
          className="absolute z-1"
          layout="fill"
          objectFit="cover"
          src={project.image}
          alt="/"
        />
        <div className="absolute top-[70%] max-w-[1240px] w-full left-[50%] right-[50%] translate-x-[-50%] translate-y-[-50%] text-white py-4 z-10 p-2">
          <h2 className="py-2">{project.name}</h2>
          <h3>{project.tech}</h3>
        </div>
      </div>
      <div className="max-w-[1240px] mx-auto p-4 grid md:grid-cols-5 gap-8 py-8">
        <div className="col-span-4">
          <p>Project</p>
          <h2>Overview</h2>
          <p className="p-2">{project.desc}</p>
          {project.code ? <a href={project.code} target="_blank" rel="noreferrer">
            <button className="px-8 py-2 mt-4 mr-8">Code</button>
          </a> :""}
          <a href={project.demo} target="_blank" rel="noreferrer">
            <button className="px-8 py-2 mt-4">Demo</button>
          </a>

          {project.video ?
              <video className=' pt-8 shadow-xl shadow-gray-400 rounded-xl py-4 ' autoPlay={true} loop muted id='video'>
            <source src={project.video} type='video/mp4'/>
          </video> :""}
        </div>
        <div className="col-span-4 md:col-span-1 shadow-xl shadow-gray-400 rounded-xl py-4">
          <div className="p-2">
            <p className="text-center font-bold pb-2">Technologies</p>
            <div className="grid grid-cols-3 md:grid-cols-1">
              {project.technologies.map((item, key) => (
                <p key={key} className="text-gray-600 py-2 flex items-center">
                  <RiRadioButtonFill className="pr-1" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>
        <Link href="/#projects">
          <p className="underline cursor-pointer">Back</p>
        </Link>
      </div>
    </div>
  );
};

export default Project;
