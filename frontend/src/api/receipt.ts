const API_BASE = import.meta.env.VITE_API_URL;

import { type Receipt } from "../types";

// Auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET all receipts
export async function getAllReceipts(): Promise<Receipt[]> {
  const res = await fetch(`${API_BASE}/receipts`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des reçus");
  return res.json();
}

// GET receipt by ID
export async function getReceiptById(id: string): Promise<Receipt> {
  const res = await fetch(`${API_BASE}/receipts/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération du reçu");
  return res.json();
}

// UPLOAD receipt (lié à une dépense)
export async function uploadReceipt(
  expenseId: string,
  file: File
): Promise<{ message: string; data: Receipt }> {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("expenseId", expenseId);

  const res = await fetch(`${API_BASE}/receipts/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(), // ne pas mettre Content-Type sinon ça casse le formData
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Erreur lors de l’upload du reçu");
  return res.json();
}

// DOWNLOAD receipt
export async function downloadReceipt(id: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/receipts/${id}/download`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du téléchargement du reçu");
  return res.blob();
}

// DELETE receipt
export async function deleteReceipt(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/receipts/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error("Erreur lors de la suppression du reçu");
  return res.json();
}
