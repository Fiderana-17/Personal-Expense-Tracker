import type { ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];

}

export interface Category {
  id: string;
  name: string;
  userId: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  category?: Category;
  description?: string;
  type: 'ONE_TIME' | 'RECURRING';
  startDate?: string;
  endDate?: string;
  receiptId?: string;
  userId: string;
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
}

export interface ReportData {
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  expenseBreakdown: ExpenseBreakdown[];
}