import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import StatsCard from './StatsCard';
import RecentTransactions from './RecentTransactions';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Last updated: </span>
          <span className="font-medium">2 minutes ago</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Balance"
          value="$4,250.00"
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Monthly Income"
          value="$8,400.00"
          change="+5.2% from last month"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Monthly Expenses"
          value="$4,150.00"
          change="+8.1% from last month"
          changeType="negative"
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Budget Alerts"
          value="2"
          change="1 new alert"
          changeType="neutral"
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