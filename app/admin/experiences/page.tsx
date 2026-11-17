import React from "react";
import ExperiencesManager from "@/components/admin/ExperiencesManager";
import { getExperiences } from "@/lib/db/queries";

export default async function AdminExperiencesPage() {
  const expList = await getExperiences();

  return <ExperiencesManager initialExperiences={expList} />;
}
