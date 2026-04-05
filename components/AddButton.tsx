"use client";

import { useState } from "react";
import AddReferenceModal from "./AddReferenceModal";

export default function AddButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        + Add
      </button>
      {open && <AddReferenceModal onClose={() => setOpen(false)} />}
    </>
  );
}
