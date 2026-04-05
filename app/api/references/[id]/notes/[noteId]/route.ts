import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  const { noteId } = await params;
  const body = await req.json();
  const content: string = body?.content?.trim();

  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  await db.update(notes).set({ content, updatedAt: Date.now() }).where(eq(notes.id, noteId));
  const updated = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  const { noteId } = await params;
  await db.delete(notes).where(eq(notes.id, noteId));
  return new NextResponse(null, { status: 204 });
}
