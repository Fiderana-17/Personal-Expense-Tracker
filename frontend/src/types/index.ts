import type { ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  expenses: Expense[];
  incomes: Income[];
  profilePic: string;
  categories: Category[];

}

export interface Category {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
}

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
}

export interface Income {
  id: string;
  amount: number;
  date: string;
  source?: string;
  description?: string;
  userId: string;
}

export interface Summary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  period: {
    start: string;
    end: string;
  };
}

export interface Alert {
  id: string;
  type: 'budget_overrun' | 'low_balance';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface SwitchProps {
  onToggle?: (checked: boolean) => void;
}
export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ReportData {
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  expenseBreakdown: ExpenseBreakdown[];
}

export interface ApiError {
  status?: number;
  error?: string;
  message?: string;
  data?: {
    message?: string;
    error?: string;
  };
}


type Mode = "create" | "edit";

export interface CategoryFormProps {
  mode: Mode;
  initial?: Pick<Category, "id" | "name" | "description"> | null;
  onCancel: () => void;
  onSubmit: (values: { id?: number; name: string; description?: string }) => Promise<void> | void;
}

export interface IncomeFormProps {
  mode: Mode;
  initial: Partial<Income> | null;
  onCancel: () => void;
  onSubmit: (values: {
    id?: string;
    amount: number;
    source?: string;
    description?: string;
    date: string;
  }) => void | Promise<void>;
}