import React from "react";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/admin/ui";
import { getProjectById } from "@/lib/db/queries";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div>
      <PageHeader backHref="/admin/projects" backLabel="Projects" title={project.name} description="Edit the details shown on your project card and page." />
      <ProjectForm initialData={project} />
    </div>
  );
}
