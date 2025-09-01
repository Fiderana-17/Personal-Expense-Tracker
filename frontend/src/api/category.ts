const API_BASE = import.meta.env.VITE_API_URL;

export interface Category {
  id: number;
  name: string;
  userId: number;
  createdAt?: string;
}

// petit helper pour normaliser la réponse {data: ...} ou l'objet direct
async function normalize<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erreur API");
  }
  const body = await res.json();
  return (body && typeof body === "object" && "data" in body) ? (body.data as T) : (body as T);
}

// GET all categories
export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  return normalize<Category[]>(res);
}

// GET category by ID
export async function getCategoryById(id: number): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`);
  return normalize<Category>(res);
}

// CREATE new category
export async function createCategory(data: Pick<Category, "name" | "userId">): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return normalize<Category>(res);
}

// UPDATE category
export async function updateCategory(
  id: number,
  data: Pick<Category, "name" | "userId">
): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return normalize<Category>(res);
}

// DELETE category
export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erreur lors de la suppression de la catégorie");
  }
}
