import { notFound } from "next/navigation";
import { db } from "@/db";
import { references, notes } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import { NoteList, AddNoteForm } from "@/components/NoteEditor";
import DeleteButton from "@/components/DeleteButton";

const TYPE_LABELS: Record<string, string> = {
  webpage: "Web",
  tweet: "Tweet",
  youtube: "YouTube",
  podcast: "Podcast",
};

export default async function RefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ref = await db.select().from(references).where(eq(references.id, id)).limit(1);
  if (!ref.length) notFound();

  const r = ref[0];
  const noteRows = await db.select().from(notes).where(eq(notes.referenceId, id)).orderBy(asc(notes.createdAt));
  const domain = (() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return r.url; } })();

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/" className="text-sm text-zinc-400 hover:text-blue-600 transition-colors">← Back</Link>

      {/* Reference card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {r.thumbnailUrl && (
          <img src={r.thumbnailUrl} alt="" className="w-full h-48 object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {TYPE_LABELS[r.type] ?? r.type}
            </span>
            <span className="text-xs text-zinc-400">{domain}</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{r.title}</h1>
          {r.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{r.description}</p>
          )}
          <div className="flex items-center justify-between">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {r.url}
            </a>
            <DeleteButton id={r.id} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <section>
        <h2 className="text-base font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Notes {noteRows.length > 0 && <span className="text-zinc-400 font-normal">({noteRows.length})</span>}
        </h2>
        {noteRows.length > 0 && <div className="mb-4"><NoteList notes={noteRows} referenceId={id} /></div>}
        <AddNoteForm referenceId={id} />
      </section>
    </div>
  );
}
