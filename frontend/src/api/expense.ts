const API_BASE = import.meta.env.VITE_API_URL;

export interface Expense {
  id: number;
  amount: number;
  description?: string;
  type: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  userId: number;
  categoryId: number;
  category?: { id: number; name: string };
  receipt?: string;
  createdAt?: string;
  updatedAt?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET all expenses
export async function getExpenses(userId: number): Promise<Expense[]> {
  const res = await fetch(`${API_BASE}/expenses?userId=${userId}`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des dépenses");
  return res.json();
}


// GET expense by ID
export async function getExpenseById(id: number): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${id}`);
  if (!res.ok) throw new Error('Dépense non trouvée');
  return res.json();
}

// CREATE new expense
export async function createExpense(data: Partial<Expense>): Promise<{ message: string; data: Expense }> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    } as HeadersInit,
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur lors de la création de la dépense");
  return res.json();
}


// UPDATE expense
export async function updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
  const token = localStorage.getItem("token"); 
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Erreur lors de la mise à jour de la dépense');
  return res.json();
}



// DELETE expense
export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la dépense');
}



