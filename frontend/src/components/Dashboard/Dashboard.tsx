import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import StatsCard from "./StatsCard";
import ExpenseChart from "./ExpenseChart";
import RecentTransactions from "./RecentTransactions";
import Breakdown from "./Breakdown";
import type { Summary, Alert, Transaction } from "@/api/dashboard";
import { getAlerts, getMonthlyExpensesSummary, getMonthlySummary, getRecentTransactions } from "@/api/dashboard";

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user} = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [monthly, alertData, txs, chart] = await Promise.all([
          getMonthlySummary().catch((err) => {
            throw new Error(`Error in getMonthlySummary: ${err.message}`);
          }),
          getAlerts().catch((err) => {
            throw new Error(`Error in getAlerts: ${err.message}`);
          }),
          getRecentTransactions().catch((err) => {
            throw new Error(`Error in getRecentTransactions: ${err.message}`);
          }),
          getMonthlyExpensesSummary().catch((err) => {
            throw new Error(`Error in getMonthlyExpensesSummary: ${err.message}`);
          }),
        ]);
        setSummary(monthly);
        setAlert(alertData);
        setTransactions(txs);
        setChartData(chart);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError(error instanceof Error ? error.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
    <div className="flex items-center gap-3">
  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-slide-up">
  Hi {user?.name}
</h1>
  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
    👋 Welcome back!
  </span>
</div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard
            title="Total Balance"
            value={`$${summary?.balance.toFixed(2) ?? 0}`}
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            color="blue"
          />
          <StatsCard
            title="Monthly Income"
            value={`$${summary?.income.toFixed(2) ?? 0}`}
            change="+5.2%"
            changeType="positive"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Monthly Expenses"
            value={`$${summary?.expense.toFixed(2) ?? 0}`}
            change="+8.1%"
            changeType="negative"
            icon={TrendingDown}
            color="red"
          />
          <StatsCard
            title="Budget Alerts"
            value={alert?.alert ? "⚠️ 1 Alert" : "✅ OK"}
            change={alert?.message ?? "No alerts"}
            changeType={alert?.alert ? "negative" : "neutral"}
            icon={AlertTriangle}
            color="orange"
          />
        </div>

        {/* Charts + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-slide-up">
            <Breakdown/>
            <ExpenseChart data={chartData} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <RecentTransactions transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;