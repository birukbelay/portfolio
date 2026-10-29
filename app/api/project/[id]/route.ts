import { NextResponse } from "next/server";
import { projectsData } from "@/data/projectsData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = (projectsData as Record<string, any>)[id] || null;
  return NextResponse.json({ project });
}
