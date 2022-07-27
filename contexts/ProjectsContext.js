import { createContext, useState } from "react";

const ProjectsContext = createContext();

const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const refreshProjects = async () => {
    try {
      const res = await fetch("/api/getProjects");
      const latestProjects = await res.json();
      setProjects(latestProjects);
    } catch (err) {
      console.error(err);
    }
  };

  const addProject = async (project) => {
    try {
      const res = await fetch("/api/createProject", {
        method: "POST",
        body: JSON.stringify({ description: project }),
        headers: { "Content-Type": "application/json" },
      });
      const newProject = await res.json();
      setProjects((prevProjects) => {
        const updatedProjects = [newProject, ...prevProjects];
        return updatedProjects;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateProject = async (updatedProject) => {
    try {
      await fetch("/api/updateProject", {
        method: "PUT",
        body: JSON.stringify(updatedProject),
        headers: {
          "content-type": "application/json",
        },
      });

      setProjects((prevProjects) => {
        const existingProjects = [...prevProjects];
        const existingProject = existingProjects.find(
          (project) => project.id === updatedProject.id
        );
        existingProject.fields = updatedProject.fields;
        return existingProjects;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (id) => {
    try {
      await fetch("/api/deleteProject", {
        method: "Delete",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      setProjects((prevProjects) => {
        return prevProjects.filter((project) => project.id !== id);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        setProjects,
        refreshProjects,
        updateProject,
        deleteProject,
        addProject,
      }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export { ProjectsProvider, ProjectsContext };
