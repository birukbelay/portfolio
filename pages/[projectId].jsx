import React, { useState, useEffect } from "react";
import Image from "next/image";
import propertyImg from "../public/assets/projects/property.jpg";
import { RiRadioButtonFill } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
// import { useQuery } from "react-query";

const fetchProject = async (id) => {
  return axios
    .get("http://localhost:3000/api/project/" + id)
    .then((res) => res.data);
};

// Generates `/posts/1` and `/posts/2`
export async function getStaticPaths() {
  return {
    paths: [{ params: { projectId: "1" } }, { params: { projectId: "2" } }],
    fallback: false, // can also be true or 'blocking'
  };
}
export const getStaticProps = async ({ params: { projectId } }) => {
  const proj = await fetchProject(projectId);
  console.log("the post ==----", proj);

  return {
    props: {
      project: proj.project,
    },
  };
};

const Project = ({ project }) => {
  // const {
  //   query: { projectId },
  // } = useRouter()
  const router = useRouter();
  const query = router.query;
  // console.log("the query ==-----", query);

  // const postQuery = useQuery(
  //   ["post", query.project],
  //   () => fetchPost(query.project),
  //   {
  //     initialData: project,
  //     initialStale: true,
  //   }
  // );
  // console.log("post query-------", postQuery);

  // const project = {
  //   name: "Property Finderz",
  //   tech: "React JS / Tailwind / Firebase",
  //   technologies: ["React", "Redux", "Tailwind", "Google Api", "Zillow API"],
  //   desc: `This app was built using React JS and is hosted on Firebase. Users are able to search properties based on an Address, City, or ZIP code
  //   to retrieve a list of active properties currently for sale. You will
  //   be able to view property information as well as the specific
  //   location of the property integrated with the Google Maps API. User
  //   authentication is available so you can signup and signin to your
  //   account with an email address in order to save your favorite
  //   properties. This is made possible with Zillow API.`,
  //   code: "https://github.com/fireclint/property-finder",
  //   demo: "https://property-finder-development.web.app/",
  // };
  useEffect(() => {
    const handleShadow = () => {};
  }, []);

  return (
    <div className="w-full">
      <div className="w-screen h-[50vh] relative">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-black/40 z-10" />
        <Image
          className="absolute z-1"
          layout="fill"
          objectFit="cover"
          src={propertyImg}
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
          <a href={project.code} target="_blank" rel="noreferrer">
            <button className="px-8 py-2 mt-4 mr-8">Code</button>
          </a>
          <a href={project.demo} target="_blank" rel="noreferrer">
            <button className="px-8 py-2 mt-4">Demo</button>
          </a>
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
