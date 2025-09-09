import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import ExpenseChart from "./ExpenseChart";
import RecentTransactions from "./RecentTransactions";
import Breakdown from "./Breakdown";

import type { Expense, Category } from "@/types";
import type { Alert, Transaction } from "@/api/dashboard";
import { getAlerts, getMonthlyExpensesSummary, getMonthlySummary, getRecentTransactions } from "@/api/dashboard";
import { getExpenses } from "@/api/expense";
import { getAllCategories } from "@/api/category";
import { getAllIncomes } from "@/api/income"; // à ajouter pour filtrage revenus

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Données
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Expense[]>([]); // même type que Expense pour simplifier
  const [alert, setAlert] = useState<Alert | null>(null);

  // Filtres
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});

  // États filtrés
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = Number(localStorage.getItem("userId"));
        const [allExpenses, allIncomes, allCategories, txs, alertData, chart] = await Promise.all([
          getExpenses(userId),
          getAllIncomes(),
          getAllCategories(),
          getRecentTransactions(),
          getAlerts(),
          getMonthlyExpensesSummary(),
        ]);

        setExpenses(allExpenses);
        setIncomes(allIncomes);
        setCategories(allCategories);
        setTransactions(txs);
        setAlert(alertData);
        setChartData(chart);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Filtrage dynamique ---
  useEffect(() => {
    const filterData = (items: Expense[]): Expense[] => {
      let filtered = items;

      if (showCustomRange && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        filtered = items.filter(e => e.date && new Date(e.date) >= start && new Date(e.date) <= end);
      } else if (selectedPeriod === "monthly") {
        const [year, month] = selectedMonth.split("-").map(Number);
        filtered = items.filter(e => e.date && new Date(e.date).getFullYear() === year && new Date(e.date).getMonth() + 1 === month);
      } else if (selectedPeriod === "quarterly") {
        const [year] = selectedMonth.split("-").map(Number);
        const quarterMap: Record<string, [number, number]> = { Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11] };
        const [startMonth, endMonth] = quarterMap[selectedQuarter];
        filtered = items.filter(e => e.date && (() => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth; })());
      } else if (selectedPeriod === "yearly") {
        const [year] = selectedMonth.split("-").map(Number);
        filtered = items.filter(e => e.date && new Date(e.date).getFullYear() === year);
      }

      return filtered;
    };

    setFilteredExpenses(filterData(expenses));
    setFilteredIncomes(filterData(incomes));
  }, [expenses, incomes, selectedPeriod, selectedMonth, selectedQuarter, showCustomRange, customRange]);

  // --- Totaux dynamiques ---
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-600 font-semibold">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header + filtres */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Hi {user?.name}</h1>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">👋 Welcome!</span>
          </div>
          <div className="flex gap-2 items-center ">
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className=" bg-white shadow-2xl px-2 py-1 rounded ">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            {selectedPeriod === "monthly" && <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border px-2 py-1 rounded" />}
            {selectedPeriod === "quarterly" && (
              <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} className="border px-2 py-1 rounded">
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            )}
            <button className="border px-2 py-1 rounded flex items-center gap-1" onClick={() => setShowCustomRange(!showCustomRange)}>
              <Calendar className="w-4 h-4" /> Custom
            </button>
            {showCustomRange && (
              <div className="flex gap-1">
                <input type="date" value={customRange.start || ""} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} className="border px-2 py-1 rounded" />
                <input type="date" value={customRange.end || ""} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} className="border px-2 py-1 rounded" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards dynamiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard title="Total Balance" value={`$${totalBalance.toFixed(2)}`} changeType={totalBalance >= 0 ? "positive" : "negative"} change={`${totalBalance >= 0 ? "+" : "-"}${Math.abs(totalBalance).toFixed(2)}`} icon={DollarSign} color="blue" />
          <StatsCard title="Total Income" value={`$${totalIncome.toFixed(2)}`} changeType="positive" change="+0%" icon={TrendingUp} color="green" />
          <StatsCard title="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} changeType="negative" change="+0%" icon={TrendingDown} color="red" />
          <StatsCard title="Budget Alerts" value={alert?.alert ? "⚠️ 1 Alert" : "✅ OK"} change={alert?.message ?? "No alerts"} changeType={alert?.alert ? "negative" : "neutral"} icon={AlertTriangle} color="orange" />
        </div>

        {/* Charts + Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Breakdown expenses={filteredExpenses} categories={categories} />
            <ExpenseChart data={chartData} />
          </div>
          <div>
            <RecentTransactions transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
