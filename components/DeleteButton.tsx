"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this reference and all its notes?")) return;
    await fetch(`/api/references/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-zinc-400 hover:text-red-600 transition-colors ml-4 flex-shrink-0"
    >
      Delete
    </button>
  );
}
