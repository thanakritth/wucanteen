"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
export default function DeleteConfirmDialog({
  dishName,
  onClose,
  onConfirm,
}: {
  dishName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
  }
  return (
    <Modal title="Remove from menu" onClose={onClose}>
      <p className="mb-5 text-sm text-gray-600">
        Remove{" "}
        <span className="font-medium text-gray-900">
          &quot;{dishName}&quot;
        </span>{" "}
        from the menu? Customers won&apos;t see it anymore, but nothing is
        deleted — you can bring it back later.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={deleting}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50

disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {" "}
          {deleting ? "Removing..." : "Remove"}{" "}
        </button>
      </div>
    </Modal>
  );
}
