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
      // ⚠️ backend demande aussi userId dans update
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