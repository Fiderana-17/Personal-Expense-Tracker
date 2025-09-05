import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, FolderOpen, Tag, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  type Category,
} from "../../api/category";
import CategoryForm from "./CategoryForm";


const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Pick<Category, "id" | "name" | "userId"> | null>(null);
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
    } catch (err: ApiError) {
      console.error(err);
      setNotification(err.response?.data?.message || "Failed to fetch categories");
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
    setEditing({ id: category.id, name: category.name, userId: category.userId });
    setShowForm(true);
  };

  const handleSubmit = async (values: { id?: number; name: string; userId: number }) => {
    try {
      if (mode === "create") {
        await createCategory({ name: values.name, userId: values.userId });
        setNotification("Category created successfully");
        setNotificationType("success");
      } else if (mode === "edit" && values.id != null) {
        await updateCategory(values.id, { name: values.name, userId: values.userId });
        setNotification("Category updated successfully");
        setNotificationType("success");
      }
      await fetchCategories();
      setShowForm(false);
      setEditing(null);
    } catch (err: ApiError) {
      console.error(err);
      const errorMessage =
        err.response?.data?.error === "category_name_exists"
          ? "A category with this name already exists"
          : err.response?.data?.error === "category_in_use"
          ? "Cannot delete category because it is used by one or more expenses"
          : err.response?.data?.message || "Failed to save category";
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
      } catch (err: ApiError) {
        console.error(err);
        const errorMessage =
          err.response?.data?.error === "category_in_use"
            ? "Cannot delete category because it is used by one or more expenses"
            : err.response?.data?.message || "Failed to delete category";
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
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
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
            className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
              notificationType === "success" ? "bg-green-500 text-white" : "border-red-300 text-red-800 bg-red-100"
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditForm(category)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category ID</span>
                    <span className="font-medium text-gray-900">{category.id}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Tag className="h-3 w-3" />
                    <span>User ID: {category.userId}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;