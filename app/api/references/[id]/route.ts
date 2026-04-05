import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { references, notes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = await db.select().from(references).where(eq(references.id, id)).limit(1);
  if (!ref.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const refNotes = await db.select().from(notes).where(eq(notes.referenceId, id));
  return NextResponse.json({ ...ref[0], notes: refNotes });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(references).where(eq(references.id, id));
  return new NextResponse(null, { status: 204 });
}
