const API_BASE = import.meta.env.VITE_API_URL;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Types
export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface Alert {
  alert: boolean;
  message: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  type: "income" | "expense";
  category?: { name: string };
}

// 🔹 GET monthly summary
export async function getMonthlySummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/summary/monthly`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erreur récupération résumé mensuel");
  return res.json();
}

// 🔹 GET alerts
export async function getAlerts(): Promise<Alert> {
  const res = await fetch(`${API_BASE}/summary/alerts`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erreur récupération alertes");
  return res.json();
}

// 🔹 GET recent transactions (last 5)
export async function getRecentTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/summary/recent`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erreur récupération transactions");
  return res.json();
}

// 🔹 GET chart data (expenses + income)
export async function getMonthlyExpensesSummary(): Promise<{ month: string; income: number; expenses: number }[]> {
  const res = await fetch(`${API_BASE}/summary/chart`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erreur récupération chart");
  return res.json();
}