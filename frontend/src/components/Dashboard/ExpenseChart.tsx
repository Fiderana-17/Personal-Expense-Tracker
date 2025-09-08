import React from "react";

interface ExpenseChartProps {
  data: { month: string; income: number; expenses: number }[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div>Pas de données pour ce mois.</div>;

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]));

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.month} className="flex items-center space-x-4">
            <div className="w-10 text-sm font-medium text-gray-600">{item.month}</div>
            <div className="flex-1 flex space-x-2">
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${(item.income / maxValue) * 100}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">${item.income.toLocaleString()}</div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${(item.expenses / maxValue) * 100}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">${item.expenses.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;