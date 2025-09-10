import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import ExpenseChart from "./ExpenseChart";
import RecentTransactions from "./RecentTransactions";
import Breakdown from "./Breakdown";
import type { Alert, Transaction } from "@/api/dashboard";
import { getAlerts, getRecentTransactions, getMonthlyExpensesSummary } from "@/api/dashboard";

const Dashboard: React.FC = () => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // --- FILTRES ---
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});
  const [showAllMonths, setShowAllMonths] = useState(true); // Show all months by default

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertData, txs, chart] = await Promise.all([
          getAlerts(),
          getRecentTransactions(),
          getMonthlyExpensesSummary(),
        ]);
        console.log("Fetched chartData:", JSON.stringify(chart, null, 2));
        setAlert(alertData);
        setTransactions(txs);
        setChartData(chart);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- APPLY FILTERS ---
  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const txDate = new Date(t.date);
    const [year, month] = selectedMonth.split("-").map(Number);

    if (showCustomRange && customRange.start && customRange.end) {
      return txDate >= new Date(customRange.start) && txDate <= new Date(customRange.end);
    }

    if (selectedPeriod === "monthly") {
      return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
    }
    if (selectedPeriod === "yearly") {
      return txDate.getFullYear() === year;
    }
    return true;
  });

  // --- ENSURE ALL MONTHS IN CHART DATA ---
  const allMonthsChartData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthStr = monthNum.toString().padStart(2, "0");
    const year = selectedMonth.split("-")[0]; // Get YYYY from "2025-09"
    const monthKey = `${year}-${monthStr}`;
    const existing = chartData.find((d) => d.month === monthKey);
    return {
      month: monthKey,
      income: existing ? existing.income : 0,
      expenses: existing ? existing.expenses : 0,
    };
  });

  const filteredChart = showAllMonths ? allMonthsChartData : allMonthsChartData.slice(0, 6);
  console.log("Filtered chart data:", JSON.stringify(filteredChart, null, 2));

  // --- CALCULATE TOTALS ---
  const totalIncome = filteredTransactions
    .filter(t => t.type.toLowerCase() === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type.toLowerCase() === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-gray-600 text-lg animate-pulse">Loading...</div></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-red-600 text-lg font-semibold">{error}</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hi {user?.name}
            </h1>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              👋 Welcome!
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full sm:w-32 border px-3 py-2 rounded-lg"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-36 border px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <button
                  onClick={() => setShowCustomRange(!showCustomRange)}
                  className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg w-full sm:w-auto"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Custom Range</span>
                </button>
                {showCustomRange && (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      value={customRange.start || ""}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      className="border px-3 py-2 rounded-lg w-full"
                    />
                    <input
                      type="date"
                      value={customRange.end || ""}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      className="border px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard title="Total Balance" value={`$${netBalance}`} changeType={netBalance >= 0 ? "positive" : "negative"} icon={DollarSign} color="blue"/>
          <StatsCard title="Total Income" value={`$${totalIncome}`} changeType="positive" icon={TrendingUp} color="green"/>
          <StatsCard title="Total Expense" value={`$${totalExpenses}`} changeType="negative" icon={TrendingDown} color="red"/>
          <StatsCard
            title="Budget Alerts"
            value={alert?.alert ? "1 Alert" : " OK"}
            change={alert?.message ?? "No alerts"}
            changeType={alert?.alert ? "negative" : "neutral"}
            icon={AlertTriangle}
            color="orange"
          />
        </div>

        {/* Charts + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Breakdown
              selectedMonth={selectedMonth}
              selectedPeriod={selectedPeriod}
              showCustomRange={showCustomRange}
              customRange={customRange}
            />
          </div>
          <div className="lg:col-span-1">
            <RecentTransactions transactions={filteredTransactions} />
          </div>
          <div className="lg:col-span-3">
            <ExpenseChart data={filteredChart} />
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowAllMonths(!showAllMonths)}
                className="text-gray-700 font-bold transition-transform duration-300"
              >
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;