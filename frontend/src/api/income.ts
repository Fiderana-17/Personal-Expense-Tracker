const API_BASE = import.meta.env.VITE_API_URL;

import { type Income } from "../types";

async function normalize<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erreur API");
  }
  const body = await res.json();
  return (body && typeof body === "object" && "data" in body) ? (body.data as T) : (body as T);
}

// GET all incomes
export async function getAllIncomes(): Promise<Income[]> {
  const res = await fetch(`${API_BASE}/incomes`);
  return normalize<Income[]>(res);
}

// GET income by ID
export async function getIncomeById(id: string): Promise<Income> {
  const res = await fetch(`${API_BASE}/incomes/${id}`);
  return normalize<Income>(res);
}

// CREATE new income
export async function createIncome(
  data: Pick<Income, "amount" | "date" | "source" | "description" | "userId">
): Promise<Income> {
  const res = await fetch(`${API_BASE}/incomes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return normalize<Income>(res);
}

// UPDATE income
export async function updateIncome(
  id: string,
  data: Pick<Income, "amount" | "date" | "source" | "description" | "userId">
): Promise<Income> {
  const res = await fetch(`${API_BASE}/incomes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return normalize<Income>(res);
}

// DELETE income
export async function deleteIncome(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/incomes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erreur lors de la suppression du revenu");
  }
}



