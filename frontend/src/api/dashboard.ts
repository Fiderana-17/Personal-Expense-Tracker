// src/api/dashboard.ts
const API_BASE = import.meta.env.VITE_API_URL;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Types exportés
export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface Alert {
  alert: boolean;
  message: string;
}

// 🔹 GET current month summary
export async function getMonthlySummary(month?: string): Promise<Summary> {
  const url = month
    ? `${API_BASE}/summary/monthly?month=${month}`
    : `${API_BASE}/summary/monthly`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erreur lors de la récupération du résumé mensuel");
  return res.json();
}

// 🔹 GET summary between two dates
export async function getSummaryBetween(start: string, end: string): Promise<Summary> {
  const res = await fetch(`${API_BASE}/summary?start=${start}&end=${end}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération du résumé entre deux dates");
  return res.json();
}

// 🔹 GET alerts
export async function getAlerts(): Promise<Alert> {
  const res = await fetch(`${API_BASE}/summary/alerts`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erreur lors de la récupération des alertes");
  return res.json();
}
