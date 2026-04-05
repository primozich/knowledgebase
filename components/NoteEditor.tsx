"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/db/schema";

function NoteItem({ note, referenceId }: { note: Note; referenceId: string }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch(`/api/references/${referenceId}/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/references/${referenceId}/notes/${note.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            autoFocus
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setContent(note.content); }} className="px-3 py-1.5 text-xs rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{note.content}</p>
          <div className="flex gap-3 mt-3">
            <button onClick={() => setEditing(true)} className="text-xs text-zinc-400 hover:text-blue-600 transition-colors">Edit</button>
            <button onClick={remove} className="text-xs text-zinc-400 hover:text-red-600 transition-colors">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NoteList({ notes, referenceId }: { notes: Note[]; referenceId: string }) {
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} referenceId={referenceId} />
      ))}
    </div>
  );
}

export function AddNoteForm({ referenceId }: { referenceId: string }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    await fetch(`/api/references/${referenceId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    setContent("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Add a note…"
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        type="submit"
        disabled={saving || !content.trim()}
        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : "Add Note"}
      </button>
    </form>
  );
}
