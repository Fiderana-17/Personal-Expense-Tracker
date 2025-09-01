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