import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import ExpenseChart from "./ExpenseChart";
import RecentTransactions from "./RecentTransactions";
import Breakdown from "./Breakdown";
import type { Alert, Transaction } from "@/api/dashboard";
import { getAlerts, getMonthlyExpensesSummary, getAllTransactions } from "@/api/dashboard";
import { useTranslation } from "react-i18next";
import Loader from "../ui/Loader";

const Dashboard: React.FC = () => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();

  // INIT STATE avec localStorage
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "yearly" | "custom">(
    () => {
      const stored = localStorage.getItem("selectedPeriod");
      const normalized = stored ? stored.trim().toLowerCase() : null;
      return (["monthly", "yearly", "custom"].includes(normalized || "") ? normalized : "monthly") as "monthly" | "yearly" | "custom";
    }
  );

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const stored = localStorage.getItem("selectedMonth");
    return stored ? stored.trim() : (() => {
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

  const [showCustomRange, setShowCustomRange] = useState(selectedPeriod === "custom");
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});
  const showAllMonths = true;

  // Mettre à jour showCustomRange quand selectedPeriod change
  useEffect(() => {
    setShowCustomRange(selectedPeriod === "custom");
    if (selectedPeriod !== "custom") {
      setCustomRange({}); // Reset custom range quand on quitte le mode custom
    }
  }, [selectedPeriod]);

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
  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) return [];

    return transactions.filter((t) => {
      if (!t.date) return false;

      const txDate = new Date(t.date);
      if (isNaN(txDate.getTime())) return false;

      const txDateStr = txDate.toISOString().split("T")[0];

      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      if (isNaN(year) || isNaN(month)) return false;

      let matches = false;

      if (selectedPeriod === "custom" && customRange.start && customRange.end) {
        const startDate = new Date(customRange.start);
        const endDate = new Date(customRange.end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];
        matches = txDateStr >= startDateStr && txDateStr <= endDateStr;
      } else if (selectedPeriod === "monthly") {
        matches = txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
      } else if (selectedPeriod === "yearly") {
        matches = txDate.getFullYear() === year;
      } else {
        matches = false;
      }

      return matches;
    });
  }, [transactions, selectedPeriod, selectedMonth, customRange.start, customRange.end]);

  // --- ENSURE ALL MONTHS IN CHART DATA ---
  const allMonthsChartData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthStr = monthNum.toString().padStart(2, "0");
    const year = selectedMonth.split("-")[0];
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

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[calc(100vh-130px)] bg-page">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

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
                  onChange={(e) => {
                    const value = e.target.value.trim().toLowerCase() as "monthly" | "yearly" | "custom";
                    setSelectedPeriod(value);
                  }}
                  className="w-full sm:w-32 border border-border px-3 py-2 rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly" className="card">{t("dashboard.month")}</option>
                  <option value="yearly" className="card">{t("dashboard.year")}</option>
                  <option value="custom" className="card">{t("dashboard.customRange")}</option>
                </select>
              </div>
              {selectedPeriod === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-text">{t("dashboard.month")}</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value) {
                        setSelectedMonth(value);
                      }
                    }}
                    className="w-full sm:w-36 border border-border px-3 py-2 rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {selectedPeriod === "custom" && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div>
                    <label className="block text-sm font-medium text-text">{t("dashboard.startDate")}</label>
                    <input
                      type="date"
                      value={customRange.start || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value && !isNaN(new Date(value).getTime())) {
                          setCustomRange(prev => ({ ...prev, start: value }));
                        }
                      }}
                      className="w-full border border-border px-3 py-2 rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text">{t("dashboard.endDate")}</label>
                    <input
                      type="date"
                      value={customRange.end || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value && !isNaN(new Date(value).getTime())) {
                          setCustomRange(prev => ({ ...prev, end: value }));
                        }
                      }}
                      className="w-full border border-border px-3 py-2 rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
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
            <RecentTransactions
              transactions={filteredTransactions}
              key={`${selectedPeriod}-${selectedMonth}-${customRange.start || ''}-${customRange.end || ''}`}
            />
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