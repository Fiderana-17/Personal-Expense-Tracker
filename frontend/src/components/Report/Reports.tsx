import React, { useEffect, useState } from "react";
import { Calendar, Download, TrendingUp, PieChart } from "lucide-react";
import { getExpenses } from "@/api/expense";
import { getAllIncomes } from "@/api/income";
import { getAllCategories } from "@/api/category";
import type { Expense, Income, ReportData, ExpenseBreakdown, Category } from "@/types";
import Loader from "../ui/Loader";

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const userId = Number(localStorage.getItem("userId"));

        const [expenses, incomes, categories]: [Expense[], Income[], Category[]] =
          await Promise.all([getExpenses(userId), getAllIncomes(), getAllCategories()]);

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        // Init breakdown avec toutes les catégories
        const breakdownMap: Record<string, number> = {};
        categories.forEach((cat) => (breakdownMap[cat.name] = 0));
        expenses.forEach((e) => {
          const cat = e.category?.name ?? "Other";
          breakdownMap[cat] = (breakdownMap[cat] || 0) + e.amount;
        });

        const expenseBreakdown: ExpenseBreakdown[] = Object.entries(breakdownMap).map(
          ([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0,
            color: "bg-blue-500", // tu peux assigner dynamiquement une couleur par catégorie si tu veux
          })
        );

        setReport({ totalExpenses, totalIncome, netBalance, expenseBreakdown });
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
  }, []);

  if (loading) return <div className="grid place-items-center min-h-screen"><Loader /></div>;
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Custom Range</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">${report.totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">${report.totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Net Balance</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">${report.netBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* EXPENSE BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown by Category</h3>
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
              <div className="w-16 text-right text-sm font-medium text-gray-900">{item.percentage}%</div>
              <div className="w-20 text-right text-sm font-semibold text-gray-900">${item.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
