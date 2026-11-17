import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);
  return NextResponse.json({ project });
}
