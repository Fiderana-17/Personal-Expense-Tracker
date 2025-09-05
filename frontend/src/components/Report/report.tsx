import React, { useEffect, useState } from "react";
import { Calendar, Download, TrendingUp, PieChart } from "lucide-react";
import { getExpenses } from "../../api/expense";
import { getAllIncomes } from "../../api/income";
import {  type Expense,  type Income ,type ReportData , type  ExpenseBreakdown } from "../../types";



const Reports: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const userId = Number(localStorage.getItem("userId")); // ou récupère depuis ton auth
        const Expenses: Expense[] = await getExpenses(userId);
        const incomes: Income[] = await getAllIncomes();

        const totalExpenses = Expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        // Breakdown par catégorie
        const breakdownMap: Record<string, number> = {};
        Expenses.forEach((e) => {
          const cat = e.category?.name ?? "Unknown";
          breakdownMap[cat] = (breakdownMap[cat] || 0) + e.amount;
        });

        const expenseBreakdown: ExpenseBreakdown[] = Object.entries(breakdownMap).map(
          ([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0,
          })
        );

        setReport({ totalExpenses, totalIncome, netBalance, expenseBreakdown });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <div>Loading...</div>;
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3>Total Expenses</h3>
          <p className="text-red-600 font-bold text-3xl">${report.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3>Total Income</h3>
          <p className="text-green-600 font-bold text-3xl">${report.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3>Net Balance</h3>
          <p className="text-blue-600 font-bold text-3xl">${report.netBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* EXPENSE BREAKDOWN */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="mb-4 font-semibold">Expense Breakdown by Category</h3>
        {report.expenseBreakdown.map((item, i) => (
          <div key={i} className="flex items-center space-x-4 mb-2">
            <div className="w-32 text-sm">{item.category}</div>
            <div className="flex-1 bg-gray-200 h-3 rounded-full">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
            </div>
            <div className="w-16 text-right text-sm">{item.percentage}%</div>
            <div className="w-20 text-right text-sm font-semibold">${item.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
