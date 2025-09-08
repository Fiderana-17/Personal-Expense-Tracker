import React, { useEffect, useState } from "react";
import { Calendar, Download, TrendingUp, PieChart } from "lucide-react";
import { getExpenses } from "@/api/expense";
import { getAllIncomes } from "@/api/income";
import { getAllCategories } from "@/api/category";
import type { Expense, Income, ReportData, ExpenseBreakdown, Category } from "@/types";
import Loader from "../ui/Loader";

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monthlyTrend, setMonthlyTrend] = useState<
    { month: string; income: number; expenses: number; savings: number }[]
  >([]);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const userId = Number(localStorage.getItem("userId"));
        const [expenses, incomes, categories]: [Expense[], Income[], Category[]] =
          await Promise.all([getExpenses(userId), getAllIncomes(), getAllCategories()]);

        // Filtrage Custom Range
        let filteredExpenses = expenses;
        let filteredIncomes = incomes;
        if (showCustomRange && customRange.start && customRange.end) {
          const start = customRange.start;
          const end = customRange.end;
          filteredExpenses = expenses.filter(
            (e) => e.date && e.date >= start && e.date <= end
          );
          filteredIncomes = incomes.filter(
            (i) => i.date && i.date >= start && i.date <= end
          );
        }

        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        // Expense Breakdown
        const breakdownMap: Record<string, number> = {};
        categories.forEach((cat) => (breakdownMap[cat.name] = 0));
        filteredExpenses.forEach((e) => {
          const cat = e.category?.name ?? "Other";
          breakdownMap[cat] = (breakdownMap[cat] || 0) + e.amount;
        });
        const expenseBreakdown: ExpenseBreakdown[] = Object.entries(breakdownMap).map(
          ([category, amount], i) => ({
            category,
            amount,
            percentage: totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0,
            color: [
              "bg-blue-500",
              "bg-green-500",
              "bg-yellow-500",
              "bg-purple-500",
              "bg-pink-500",
              "bg-indigo-500",
              "bg-red-500",
              "bg-gray-500",
            ][i % 8],
          })
        );

        // Monthly Trend dynamique
        const currentYear = new Date().getFullYear();
        const trend = Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(currentYear, i, 1);
          const monthName = monthDate.toLocaleString("default", { month: "long" });
          const monthIncome = filteredIncomes
            .filter((inc) => inc.date && new Date(inc.date).getMonth() === i)
            .reduce((sum, inc) => sum + inc.amount, 0);
          const monthExpenses = filteredExpenses
            .filter((exp) => exp.date && new Date(exp.date).getMonth() === i)
            .reduce((sum, exp) => sum + exp.amount, 0);
          return {
            month: monthName,
            income: monthIncome,
            expenses: monthExpenses,
            savings: monthIncome - monthExpenses,
          };
        });

        const filteredTrend = showAllMonths ? trend : trend.slice(0, 6);

        setReport({ totalExpenses, totalIncome, netBalance, expenseBreakdown });
        setMonthlyTrend(filteredTrend);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message || "Erreur lors du chargement des données");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [showCustomRange, customRange, showAllMonths]);

  if (loading)
    return (
      <div className="grid place-items-center min-h-screen">
        <Loader />
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;
  if (!report) return <div>Erreur lors du chargement du report.</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Custom Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Range</label>
            <button
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
              onClick={() => setShowCustomRange(!showCustomRange)}
            >
              <Calendar className="h-4 w-4" />
              <span>Custom Range</span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showCustomRange ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={customRange.start || ""}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                />
                <input
                  type="date"
                  value={customRange.end || ""}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">
            ${report.totalExpenses.toLocaleString()}
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${report.totalIncome.toLocaleString()}
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Net Balance</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            ${report.netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* EXPENSE BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Expense Breakdown by Category
        </h3>
        <div className="space-y-4">
          {report.expenseBreakdown.map((item, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700">{item.category}</div>
              <div className="flex-1 bg-gray-200 h-3 rounded-full relative">
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-900">
                {item.percentage}%
              </div>
              <div className="w-20 text-right text-sm font-semibold text-gray-900">
                ${item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MONTHLY TREND */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
          <div className="flex justify-end">
            <button
              className="text-gray-700 text-lg font-bold transform transition-transform duration-300"
              onClick={() => setShowAllMonths(!showAllMonths)}
            >
              <span
                className={`inline-block transition-transform duration-300 ${
                  showAllMonths ? "rotate-180" : "rotate-0"
                }`}
              >
                ^
              </span>
            </button>
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showAllMonths ? "max-h-[2000px]" : "max-h-[400px]"
          }`}
        >
          {monthlyTrend.map((month) => (
            <div
              key={month.month}
              className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{month.month}</div>
              <div className="text-green-600 font-semibold">
                ${month.income.toLocaleString()}
              </div>
              <div className="text-red-600 font-semibold">
                ${month.expenses.toLocaleString()}
              </div>
              <div className="text-blue-600 font-semibold">
                ${month.savings.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 py-3 bg-gray-50 rounded-lg mt-4 px-4">
          <div className="font-semibold text-gray-700">Month</div>
          <div className="font-semibold text-green-600">Income</div>
          <div className="font-semibold text-red-600">Expenses</div>
          <div className="font-semibold text-blue-600">Savings</div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
