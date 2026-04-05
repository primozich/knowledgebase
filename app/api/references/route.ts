import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { references, notes } from "@/db/schema";
import { fetchMetadata } from "@/lib/metadata";
import { v4 as uuidv4 } from "uuid";
import { eq, like, or, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");

  let query = db.select().from(references);

  const conditions = [];
  if (q) {
    conditions.push(or(like(references.title, `%${q}%`), like(references.description, `%${q}%`)));
  }
  if (type && ["webpage", "tweet", "podcast", "youtube"].includes(type)) {
    conditions.push(eq(references.type, type as "webpage" | "tweet" | "podcast" | "youtube"));
  }

  const rows =
    conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => or(a, b)!)).orderBy(desc(references.createdAt))
      : await query.orderBy(desc(references.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url: string = body?.url?.trim();

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  // Check for duplicate
  const existing = await db.select().from(references).where(eq(references.url, url)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Reference already exists", id: existing[0].id }, { status: 409 });
  }

  let meta;
  try {
    meta = await fetchMetadata(url);
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch metadata: ${(err as Error).message}` }, { status: 502 });
  }

  const now = Date.now();
  const ref = {
    id: uuidv4(),
    url,
    type: meta.type,
    title: meta.title,
    description: meta.description ?? null,
    thumbnailUrl: meta.thumbnailUrl ?? null,
    metadata: meta.metadata ? JSON.stringify(meta.metadata) : null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(references).values(ref);
  return NextResponse.json(ref, { status: 201 });
}
