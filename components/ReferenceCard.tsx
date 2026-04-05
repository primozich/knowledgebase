import Link from "next/link";
import { Reference } from "@/db/schema";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  webpage: { label: "Web", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  tweet: { label: "Tweet", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  youtube: { label: "YouTube", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  podcast: { label: "Podcast", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

export default function ReferenceCard({ reference: r }: { reference: Reference }) {
  const badge = TYPE_LABELS[r.type] ?? TYPE_LABELS.webpage;
  const domain = (() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return r.url; } })();

  return (
    <Link href={`/ref/${r.id}`} className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-500 transition-colors overflow-hidden">
      <div className="flex gap-4 p-4">
        {r.thumbnailUrl && (
          <img src={r.thumbnailUrl} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
            <span className="text-xs text-zinc-400 truncate">{domain}</span>
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {r.title}
          </p>
          {r.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">{r.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
