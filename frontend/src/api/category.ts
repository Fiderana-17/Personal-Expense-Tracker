// frontend/services/category.ts
const API_BASE = import.meta.env.VITE_API_URL;

export interface Category {
  id: number;
  name: string;
  userId: number;
}

// 🔑 Auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET all categories
export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des catégories");
  return res.json();
}

// GET categories by user
export async function getCategoriesByUser(userId: number): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories/user/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des catégories de l'utilisateur");
  return res.json();
}

//CREATE category
export async function createCategory(data: Partial<Category>): Promise<{ message: string; data: Category }> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    } as HeadersInit,
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur lors de la création de la catégorie");
  return res.json();
}

// UPDATE category
export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur lors de la mise à jour de la catégorie");
  return res.json();
}

// DELETE category
export async function deleteCategory(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error("Erreur lors de la suppression de la catégorie");
  return res.json();
}
