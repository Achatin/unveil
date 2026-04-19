import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/project
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const project = await prisma.project.create({
      data
    });

    return NextResponse.json(project);
  } catch (err) {
    console.error("PROJECT CREATE ERROR:", err);

    return NextResponse.json(
        {
        error: "Server error",
        details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
    );
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(projects);
}