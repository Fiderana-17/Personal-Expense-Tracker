import React, { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategoryFormProps } from "@/types";

const CategoryForm: React.FC<CategoryFormProps> = ({ mode, initial, onCancel, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notification, setNotification] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setName(initial.name);
      setDescription(initial.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [mode, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNotification("The category name is required.");
      setTimeout(() => setNotification(""), 5000);
      return;
    }
    if (!userId || userId <= 0) {
      setNotification("The user ID is required and must be a positive number.");
      setTimeout(() => setNotification(""), 5000);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        id: initial?.id,
        name: name.trim(),
        description: description.trim() || undefined
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed w-full inset-0 bg-black/20 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: -30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -30 }}
        transition={{ duration: 0.3 }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md pointer-events-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{mode === "create" ? "Add a category" : "Change category"}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 border-red-300 text-red-800 bg-red-100"
              >
                <AlertCircle className="h-5 w-5" />
                <span>{notification}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500"
                placeholder="Enter the name of the category"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
              >
                {saving ? "Recording...." : mode === "create" ? "Save category" : " Update category"} 
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default CategoryForm;