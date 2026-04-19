import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders()
  });
}

// POST /api/annotations
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const annotation = await prisma.annotation.create({
      data
    });

    return NextResponse.json(annotation, {
      headers: corsHeaders()
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET() {
  const annotations = await prisma.annotation.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(annotations);
}