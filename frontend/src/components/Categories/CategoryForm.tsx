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