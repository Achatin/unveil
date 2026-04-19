import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";


export async function GET() {
  const data = await prisma.annotation.findMany();

  fs.writeFileSync(
    "export.json",
    JSON.stringify(data, null, 2)
  );

  return NextResponse.json({ ok: true });
}