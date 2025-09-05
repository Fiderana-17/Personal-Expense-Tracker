import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, FolderOpen, Tag, X, CheckCircle, AlertCircle } from "lucide-react";
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
  const [notification, setNotification] = useState<{ message: string; show: boolean; type: "success" | "error" }>({
    message: "",
    show: false,
    type: "success",
  });

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    setShowForm((prev) => !prev);
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
        setNotification({ message: "Category created successfully", show: true, type: "success" });
        setTimeout(() => setNotification({ message: "", show: false, type: "success" }), 3000);
      } else if (mode === "edit" && values.id != null) {
        await updateCategory(values.id, { name: values.name, userId: values.userId });
        setNotification({ message: "Category updated successfully", show: true, type: "success" });
        setTimeout(() => setNotification({ message: "", show: false, type: "success" }), 3000);
      }
      await fetchCategories();
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      setNotification({ message: "Failed to save category", show: true, type: "error" });
      setTimeout(() => setNotification({ message: "", show: false, type: "error" }), 3000);
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
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        setNotification({ message: "Category deleted successfully", show: true, type: "success" });
        setTimeout(() => setNotification({ message: "", show: false, type: "success" }), 3000);
      } catch (err: any) {
        console.error(err);
        const errorMessage = err.response?.data?.error === "category_in_use"
          ? "Cannot delete category because it is used by one or more expenses"
          : "Cannot delete category because it is used by one or more expenses";
        setNotification({ message: errorMessage, show: true, type: "error" });
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        setTimeout(() => setNotification({ message: "", show: false, type: "error" }), 3000);
      }
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Categories</h1>
        <button
          onClick={openCreateForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm && mode === "create" ? "Close Form" : "Add Category"}
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Formulaire inline */}
      {showForm && (
        <div id="category-form">
          <CategoryForm
            mode={mode}
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="flex items-center justify-center bg-gradient-to-br from-gray-900/60 to-blue-900/60 overflow-auto absolute w-full inset-0 bg-black/20 backdrop-blur-[2px] z-50">
          <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 max-w-sm w-full mx-4 transform transition-all duration-300">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-red-100 transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600 hover:text-red-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            } text-white rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-sm`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={20} className="text-white" />
            ) : (
              <AlertCircle size={20} className="text-white" />
            )}
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification({ message: "", show: false, type: "success" })}
              className="ml-auto p-1 rounded-full hover:bg-opacity-80 transition-colors duration-200"
              aria-label="Close notification"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Grille des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
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
          </div>
        ))}
      </div>

      {/* Cas vide */}
      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6">
            Create your first category to get started organizing your expenses.
          </p>
          <button
            onClick={() => {
              setMode("create");
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;