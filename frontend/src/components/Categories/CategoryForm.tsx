import React, { useEffect, useState } from "react";
import { X, Tag, User } from "lucide-react"; // Ajout d'icônes pour les champs
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
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-900/60 to-blue-900/60  overflow-auto absolute w-full inset-0 bg-black/20 backdrop-blur-[2px] z-40 ">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4 transform transition-all duration-500 scale-100 hover:scale-[1.02]"
        aria-labelledby="form-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="form-title" className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {mode === "create" ? "New Category" : "Edit Category"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-red-100 transition-all duration-300 hover:rotate-90"
            aria-label="Close form"
          >
            <X size={22} className="text-gray-600 hover:text-red-600" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200">
              <Tag size={18} className="ml-3 text-gray-400" />
              <input
                id="name"
                type="text"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0 placeholder-gray-400"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="userId" className="block text-sm font-semibold text-gray-700 mb-2">
              User ID
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200">
              <User size={18} className="ml-3 text-gray-400" />
              <input
                id="userId"
                type="number"
                min={1}
                value={userId}
                onChange={(e) => setUserId(parseInt(e.target.value || "1", 10))}
                className="w-full p-3 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0 placeholder-gray-400"
                required
                aria-required="true"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={saving}
            className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">
              {saving ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </span>
            <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </form>
    </div>
  );
};


export default CategoryForm;