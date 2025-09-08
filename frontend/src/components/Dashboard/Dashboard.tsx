import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import StatsCard from "./StatsCard";
import ExpenseChart from "./ExpenseChart";
import RecentTransactions from "./RecentTransactions";
import type { Summary, Alert, Transaction } from "@/api/dashboard";
import { getAlerts, getMonthlyExpensesSummary, getMonthlySummary, getRecentTransactions } from "@/api/dashboard";

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [monthly, alertData, txs, chart] = await Promise.all([
          getMonthlySummary().catch((err) => {
            throw new Error(`Erreur dans getMonthlySummary: ${err.message}`);
          }),
          getAlerts().catch((err) => {
            throw new Error(`Erreur dans getAlerts: ${err.message}`);
          }),
          getRecentTransactions().catch((err) => {
            throw new Error(`Erreur dans getRecentTransactions: ${err.message}`);
          }),
          getMonthlyExpensesSummary().catch((err) => {
            throw new Error(`Erreur dans getMonthlyExpensesSummary: ${err.message}`);
          }),
        ]);
        setSummary(monthly);
        setAlert(alertData);
        setTransactions(txs);
        setChartData(chart);
      } catch (error) {
        console.error("Erreur dans fetchData:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des données"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">Chargement...</div>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900">Tableau de bord</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Ajouter une transaction
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Solde Total"
            value={`$${summary?.balance.toFixed(2) ?? 0}`}
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            color="blue"
          />
          <StatsCard
            title="Revenus Mensuels"
            value={`$${summary?.income.toFixed(2) ?? 0}`}
            change="+5.2%"
            changeType="positive"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Dépenses Mensuelles"
            value={`$${summary?.expense.toFixed(2) ?? 0}`}
            change="+8.1%"
            changeType="negative"
            icon={TrendingDown}
            color="red"
          />
          <StatsCard
            title="Alertes Budget"
            value={alert?.alert ? "⚠️ 1 Alerte" : "✅ OK"}
            change={alert?.message ?? "Aucune alerte"}
            changeType={alert?.alert ? "negative" : "neutral"}
            icon={AlertTriangle}
            color="orange"
          />
        </div>

        {/* Charts + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-slide-up">
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