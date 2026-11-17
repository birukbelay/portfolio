import React from "react";
import ProjectForm from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader backHref="/admin/projects" backLabel="Projects" title="New project" description="Add a project to your portfolio." />
      <ProjectForm />
    </div>
  );
}
