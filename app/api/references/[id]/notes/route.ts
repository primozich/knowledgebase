import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: referenceId } = await params;
  const body = await req.json();
  const content: string = body?.content?.trim();

  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  const now = Date.now();
  const note = { id: uuidv4(), referenceId, content, createdAt: now, updatedAt: now };
  await db.insert(notes).values(note);
  return NextResponse.json(note, { status: 201 });
}
