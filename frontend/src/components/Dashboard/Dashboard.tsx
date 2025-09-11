import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import ExpenseChart from "./ExpenseChart";
import RecentTransactions from "./RecentTransactions";
import Breakdown from "./Breakdown";
import type { Alert, Transaction } from "@/api/dashboard";
import { getAlerts, getMonthlyExpensesSummary, getAllTransactions } from "@/api/dashboard";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation(); 

  // INIT STATE avec localStorage
const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "yearly">(
  () => (localStorage.getItem("selectedPeriod") as "monthly" | "yearly") || "monthly"
);

const [selectedMonth, setSelectedMonth] = useState(() => {
  return localStorage.getItem("selectedMonth") || (() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  })();
});

// Sauvegarder à chaque changement
useEffect(() => {
  localStorage.setItem("selectedPeriod", selectedPeriod);
}, [selectedPeriod]);

useEffect(() => {
  localStorage.setItem("selectedMonth", selectedMonth);
}, [selectedMonth]);

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
          getAllTransactions(),
          getMonthlyExpensesSummary(),
        ]);
        setAlert(alertData);
        setTransactions(txs);
        setChartData(chart);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("dashboard.error"));
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

  // --- CALCULATE TOTALS ---
  const totalIncome = filteredTransactions
    .filter(t => t.type.toLowerCase() === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type.toLowerCase() === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-gray-600 text-lg animate-pulse">{t("dashboard.loading")}</div></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-red-600 text-lg font-semibold">{error}</div></div>;

  return (
    <div className="min-h-screen duration-500 rounded-2xl bg-page py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              {t("dashboard.greeting")}, {user?.name}
            </h1>
            <span className="text-sm bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800 px-2 py-1 rounded-full">
              {t("dashboard.welcome")}
            </span>
          </div>
          <div className="card rounded-lg shadow p-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-text">{t("dashboard.period")}</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full sm:w-32 border border-border px-3 py-2 rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">{t("dashboard.month")}</option>
                  <option value="yearly">{t("dashboard.year")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t("dashboard.month")}</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-36 border border-border px-3 py-2 rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <button
                  onClick={() => setShowCustomRange(!showCustomRange)}
                  className="flex items-center space-x-2 bg-background-hover px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-background-hover text-text"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{t("dashboard.customRange")}</span>
                </button>
                {showCustomRange && (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      value={customRange.start || ""}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      className="border border-border px-3 py-2 rounded-lg w-full bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={customRange.end || ""}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      className="border border-border px-3 py-2 rounded-lg w-full bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard title={t("dashboard.stats.totalBalance")} value={`$${netBalance}`} changeType={netBalance >= 0 ? "positive" : "negative"} icon={DollarSign} color="blue"/>
          <StatsCard title={t("dashboard.stats.totalIncome")} value={`$${totalIncome}`} changeType="positive" icon={TrendingUp} color="green"/>
          <StatsCard title={t("dashboard.stats.totalExpense")} value={`$${totalExpenses}`} changeType="negative" icon={TrendingDown} color="red"/>
          <StatsCard
            title={t("dashboard.stats.alerts")}
            value={alert?.alert ? "1 Alert" : " OK"}
            change={alert?.message ?? t("dashboard.stats.noAlerts")}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;