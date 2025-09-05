const API_BASE = import.meta.env.VITE_API_URL;

import type { Category } from "@/types";

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
  const responseData = await res.json();
  if (!res.ok) {
    throw {
      status: res.status,
      ...responseData,
      message: responseData.message || "Failed to fetch categories. Please try again."
    };
  }
  return responseData;
}

// GET categories by user
export async function getCategoriesByUser(userId: number): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories/user/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  const responseData = await res.json();
  if (!res.ok) {
    throw {
      status: res.status,
      ...responseData,
      message: responseData.message || "Failed to fetch user categories. Please try again."
    };
  }
  return responseData;
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

  const responseData = await res.json();
  if (!res.ok) {
    throw {
      status: res.status,
      ...responseData
    };
  }
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

  const responseData = await res.json();
  if (!res.ok) {
    if (responseData.error === "category_name_exists") {
      throw {
        status: res.status,
        error: "category_name_exists",
        message: "A category with this name already exists. Please choose a different name."
      };
    }
    throw {
      status: res.status,
      ...responseData,
      message: responseData.message || "Failed to update the category. Please try again."
    };
  }
  return responseData;
}

// DELETE category
export async function deleteCategory(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const responseData = await res.json();
  if (!res.ok) {
    if (responseData.error === "category_in_use") {
      throw {
        status: res.status,
        error: "category_in_use",
        message: "This category cannot be deleted because it is currently used by one or more expenses. Please remove or reassign these expenses first."
      };
    }
    throw {
      status: res.status,
      ...responseData,
      message: responseData.message || "Failed to delete the category. Please try again."
    };
  }
  return responseData;
}
