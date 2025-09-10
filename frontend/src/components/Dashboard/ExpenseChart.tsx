import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


interface ExpenseChartProps {
  data: { month: string; income: number; expenses: number }[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const [startMonth, setStartMonth] = useState(1); // Start with January (1-based index)

  if (!data || data.length === 0)
    return <div className="text-gray-500 text-center">No data available</div>;

  // Transform data and add month number
  const transformedData = data
    .map((item) => {
      const [year, month] = item.month.split("-");
      const monthNum = parseInt(month, 10);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        console.warn(`Invalid month in data: ${item.month}`);
        return null;
      }
      const date = new Date(`20${year}-${month}-01`);
      const shortMonth = date.toLocaleString("default", { month: "short" });
      return { ...item, shortMonth, monthNum, year };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Create entries for all months (1-12) with zeros for missing months
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthStr = monthNum.toString().padStart(2, "0");
    const date = new Date(`2025-${monthStr}-01`);
    const shortMonth = date.toLocaleString("default", { month: "short" });
    const existing = transformedData.find((d) => d.monthNum === monthNum);
    return {
      month: shortMonth, // affichage sur XAxis
      monthNum,
      year: "25",
      income: existing ? existing.income : 0,
      expenses: existing ? existing.expenses : 0,
    };
  });

  // Sort data starting with startMonth
  const formattedData = allMonths.sort((a, b) => {
    const aAdjusted = a.monthNum >= startMonth ? a.monthNum : a.monthNum + 12;
    const bAdjusted = b.monthNum >= startMonth ? b.monthNum : b.monthNum + 12;
    return aAdjusted - bAdjusted;
  });


  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up">
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Income vs Expenses
        </h3>
  
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#374151" }}
              tickLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fill: "#374151" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === "income" ? "Income" : "Expenses",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-700">
                  {value === "income" ? "Income" : "Expenses"}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              name="income"
            />
            <Bar
              dataKey="expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;
