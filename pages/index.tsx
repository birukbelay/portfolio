// import axios from "axios";
// import fetch from 'node-fetch';
// @ts-ignore
import Head from "next/head";
import React from "react";
import About from "../components/About";
import Contact from "../components/Contact";
import Main from "../components/Main";

import Projects, { Project } from "../components/Projects";
import Skills from "../components/Skills";
import { projectsData } from "../data/projectsData";

// import {
//     useQuery,
//     useMutation,
//     // useQueryClient,
//     QueryClient,
//     // QueryClientProvider,
// } from 'react-query'
// const queryClient = new QueryClient()
// const fetchProjects = async () => {
//   return axios
//     .get("http://localhost:3000/api/projects/")
//     .then((res) => res.data);
// };
// const fetchSkills = async () => {
//   return axios
//     .get("http://localhost:3000/api/projects/")
//     .then((res) => res.data);
// };
// export async function getStaticProps() {
//
//   const pro = await fetchProjects()
//
//   // console.log("api data==", pro)
//   const projects=pro.projects
//   // const skills = await fetchSkills()
//
//   // By returning { props: { posts } }, the Blog component
//   // will receive `posts` as a prop at build time
//   return {
//     props: {
//       projects, skills
//     },
//   }
// }

export async function getServerSideProps() {
    const projects = Object.keys(projectsData).map(function(k){return projectsData[k]});
    // const apiUrl = '/api/projects'; // Use /api/projects
    // const response = await fetch(apiUrl);
    // const projects = await response.json();

    return {
        props: {
            projects
        }
    };
}
interface pageProps{
  projects:Project[]
}

export default function Home({projects}:pageProps) {
  return (
    <div className='mx-4 px-4'>
        {/*<QueryClientProvider client={queryClient}>*/}
      <Head>
        <title>Biruk | Software Engineer</title>
        <meta name="description" content="Full-Stack Developer, Web and Mobile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main />
      <About />
      <Skills />
      <Projects projects={projects}/>
      <Contact />
        {/*</QueryClientProvider>*/}
    </div>
  );
}
