import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, FolderOpen, Tag } from "lucide-react";
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

  // gestion du formulaire
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Pick<Category, "id" | "name" | "userId"> | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

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

    // Ouvrir formulaire d'ajout
  const openCreateForm = () => {
    setMode("create");
    setEditing(null);
    setShowForm((prev) => !prev); // toggle Add ⇄ Close
  };

  // Ouvrir formulaire d'édition
  const openEditForm = (category: Category) => {
    setMode("edit");
    setEditing({ id: category.id, name: category.name, userId: category.userId });
    setShowForm(true);
    // on peut faire défiler vers le formulaire si besoin
    // document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Soumission du formulaire (create ou edit)
  const handleSubmit = async (values: { id?: number; name: string; userId: number }) => {
    if (mode === "create") {
      await createCategory({ name: values.name, userId: values.userId });
    } else if (mode === "edit" && values.id != null) {
      // backend demande aussi userId dans update
      await updateCategory(values.id, { name: values.name, userId: values.userId });
    }
    await fetchCategories();
    setShowForm(false);
    setEditing(null);
  };

  // Supprimer
  const handleDeleteCategory = async (id: number) => {
    if (confirm("Supprimer cette catégorie ?")) {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <p>Chargement des catégories...</p>;

  
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

      {/* Formulaire inline (pas centré plein écran) */}
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
                  onClick={() => handleDeleteCategory(category.id)}
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