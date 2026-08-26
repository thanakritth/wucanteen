"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

export default function CategoryDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState(""); 
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);   
    setError(null);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description: description || null }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    setSaving(false);
    onCreated(); // tell /staff to refetch — no page navigation happens at all now
    onClose();
  }

  return (
    <Modal title="Add a category" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Name</label>
          <input required autoFocus value={name} onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Slug</label>
          <input required value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" />
          <p className="mt-1 text-xs text-gray-400">/menu/{slug || "…"}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2" rows={2} />
        </div>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full rounded bg-purple-600 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50">
          {saving ? "Saving…" : "Add category"}
        </button>
      </form>
    </Modal>
  );
}