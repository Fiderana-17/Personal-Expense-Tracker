import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import ExpenseChart from "./ExpenseChart";
import StatsCard from "./StatsCard";
import RecentTransactions from "./RecentTransactions";
import { getMonthlySummary, getAlerts } from "@/api/dashboard";
import type {Summary, Alert } from "@/api/dashboard";


const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const monthly = await getMonthlySummary();
        setSummary(monthly);

        const alertData = await getAlerts();
        setAlert(alertData);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Balance"
          value={`$${summary?.balance ?? 0}`}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Monthly Income"
          value={`$${summary?.income ?? 0}`}
          change="+5.2% from last month"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Monthly Expenses"
          value={`$${summary?.expense ?? 0}`}
          change="+8.1% from last month"
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
          color="yellow"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseChart />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
