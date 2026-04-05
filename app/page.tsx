import { db } from "@/db";
import { references } from "@/db/schema";
import { like, or, eq, desc, and } from "drizzle-orm";
import ReferenceCard from "@/components/ReferenceCard";
import Link from "next/link";

const TYPES = ["webpage", "tweet", "youtube", "podcast"] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;

  const conditions = [];
  if (q?.trim()) {
    conditions.push(or(like(references.title, `%${q}%`), like(references.description, `%${q}%`))!);
  }
  if (type && TYPES.includes(type as (typeof TYPES)[number])) {
    conditions.push(eq(references.type, type as (typeof TYPES)[number]));
  }

  const rows =
    conditions.length > 0
      ? await db.select().from(references).where(conditions.length === 1 ? conditions[0] : and(...conditions)).orderBy(desc(references.createdAt))
      : await db.select().from(references).orderBy(desc(references.createdAt));

  return (
    <div>
      {/* Search + filter bar */}
      <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search…"
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 flex-wrap">
          <Link
            href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!type ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400"}`}
          >
            All
          </Link>
          {TYPES.map((t) => (
            <Link
              key={t}
              href={`/?type=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${type === t ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400"}`}
            >
              {t === "webpage" ? "Web" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Link>
          ))}
          <button type="submit" className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400 transition-colors">
            Search
          </button>
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          {q || type ? "No matches found." : "No references yet. Click + Add to get started."}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <ReferenceCard key={r.id} ref={r} />
          ))}
        </div>
      )}
    </div>
  );
}
