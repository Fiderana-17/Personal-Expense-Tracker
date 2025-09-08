// frontend/services/income.ts
const API_BASE = import.meta.env.VITE_API_URL;

import { type Income } from "../types";

// Auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET all incomes
export async function getAllIncomes(): Promise<Income[]> {
  const res = await fetch(`${API_BASE}/incomes`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des revenus");
  return res.json();
}

// GET income by ID
export async function getIncomeById(id: string): Promise<Income> {
  const res = await fetch(`${API_BASE}/incomes/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération du revenu");
  return res.json();
}

// CREATE new income
export async function createIncome(
  data: Pick<Income, "amount" | "source" | "description">
): Promise<{ message: string; data: Income }> {
  const res = await fetch(`${API_BASE}/incomes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    } as HeadersInit,
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur lors de la création du revenu");
  return res.json();
}

// UPDATE income
export async function updateIncome(
  id: string,
  data: Pick<Income, "amount" | "source" | "description">
): Promise<{ message: string; data: Income }> {
  const res = await fetch(`${API_BASE}/incomes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur lors de la mise à jour du revenu");
  return res.json();
}

// DELETE income
export async function deleteIncome(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/incomes/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error("Erreur lors de la suppression du revenu");
  return res.json();
}
