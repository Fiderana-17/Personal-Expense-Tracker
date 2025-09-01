import React, { useEffect, useState } from "react";
import type { Category } from "../../api/category";

type Mode = "create" | "edit";

interface CategoryFormProps {
  mode: Mode;
  initial?: Pick<Category, "id" | "name" | "userId"> | null;
  onCancel: () => void;
  onSubmit: (values: { id?: number; name: string; userId: number }) => Promise<void> | void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ mode, initial, onCancel, onSubmit }) => {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<number>(1); // par défaut 1 en attendant l’auth
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setName(initial.name);
      setUserId(initial.userId);
    } else {
      setName("");
      setUserId(1);
    }
  }, [mode, initial]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ id: initial?.id, name, userId });
    } finally {
      setSaving(false);
    }
  };

    return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 max-w-md"
    >
      <h2 className="text-lg font-semibold mb-3">
        {mode === "create" ? "Add Category" : "Edit Category"}
      </h2>

      <label className="block text-sm text-gray-600 mb-1">Name</label>
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <label className="block text-sm text-gray-600 mb-1">User ID</label>
      <input
        type="number"
        min={1}
        value={userId}
        onChange={(e) => setUserId(parseInt(e.target.value || "1", 10))}
        className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Add" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;