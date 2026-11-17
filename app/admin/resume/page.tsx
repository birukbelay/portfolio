import React from "react";
import ResumeForm from "@/components/admin/ResumeForm";
import { PageHeader } from "@/components/admin/ui";
import { getResumeInfo } from "@/lib/db/queries";

export default async function AdminResumePage() {
  const resume = await getResumeInfo();

  return (
    <div>
      <PageHeader title="Profile & resume" description="Your name, headline, summary and links, used across the home page and resume." />
      <ResumeForm initialData={resume} />
    </div>
  );
}
