import React from "react";
import SkillsManager from "@/components/admin/SkillsManager";
import { getSkills } from "@/lib/db/queries";

export default async function AdminSkillsPage() {
  const skillsList = await getSkills();

  return <SkillsManager initialSkills={skillsList} />;
}
