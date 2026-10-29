import { NextResponse } from "next/server";
import { projectsData } from "@/data/projectsData";

export async function GET() {
  const projects = Object.values(projectsData);
  return NextResponse.json({ projects });
}
