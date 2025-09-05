import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, FolderOpen, X, AlertCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCategories, createCategory, deleteCategory, updateCategory } from "@/api/category";
import CategoryForm from "./CategoryForm";
import { formatDate } from "../ui/FormatDate";
import type { ApiError, Category } from "@/types";


const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Pick<Category, "id" | "name" | "description"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      const error = err as ApiError;
      console.error(error);
      setNotification(error.message || "Failed to fetch categories");
      setNotificationType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      ),
    [categories, searchTerm]
  );

  const openCreateForm = () => {
    setMode("create");
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (category: Category) => {
    setMode("edit");
    setEditing({ id: category.id, name: category.name, description: category.description });
    setShowForm(true);
  };

  const handleSubmit = async (values: { id?: number; name: string; description?: string }) => {
    try {
      if (mode === "create") {
        await createCategory({ name: values.name, description: values.description });
        setNotification("Category created successfully");
        setNotificationType("success");
      } else if (mode === "edit" && values.id != null) {
        await updateCategory(values.id, { name: values.name, description: values.description });
        setNotification("Category updated successfully");
        setNotificationType("success");
      }
      await fetchCategories();
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      const error = err as ApiError;
      console.error(error);
      let errorMessage = "Failed to save category";
      if (error.error === "category_name_exists") {
        errorMessage = "A category with this name already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setNotification(errorMessage);
      setNotificationType("error");
    } finally {
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const openDeleteModal = (id: number) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete != null) {
      try {
        await deleteCategory(categoryToDelete);
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete));
        setNotification("Category deleted successfully");
        setNotificationType("success");
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } catch (err) {
        const error = err as ApiError;
        console.error(error);
        let errorMessage = "Failed to delete category";
        if (error.error === "category_in_use") {
          errorMessage = "Cannot delete category because it is used by one or more expenses";
        } else if (error.message) {
          errorMessage = error.message;
        }
        setNotification(errorMessage);
        setNotificationType("error");
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } finally {
        setTimeout(() => setNotification(""), 5000);
      }
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  if (loading) return <p className="text-center text-gray-600">Loading categories...</p>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-title">Categories</h1>
        <button
          onClick={openCreateForm}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm && mode === "create" ? "Close Form" : "Add Category"}</span>
        </button>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${notificationType === "success" ? "bg-green-500 text-white" : "border-red-300 text-red-800 bg-red-100"
              }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-page rounded-xl shadow-md border duration-500 border-border p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-title pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            mode={mode}
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              className="absolute w-full inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-md space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600">Are you sure you want to delete this category?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  No
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Category List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6">
            Create your first category to get started organizing your expenses.
          </p>
          <button
            onClick={openCreateForm}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-page rounded-xl shadow-md border border-border p-6 hover:shadow-lg duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-title duration-500">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(category.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(category)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;