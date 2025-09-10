import React, { useState, useEffect } from "react";
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

  // Log data at various stages for debugging
  useEffect(() => {
    console.log("Input data:", JSON.stringify(data, null, 2));
    console.log("Transformed data:", JSON.stringify(transformedData, null, 2));
    console.log("Formatted data:", JSON.stringify(formattedData, null, 2));
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center">No data available</div>;
  }

  // Transform and validate data - Handle both "YYYY-MM" and "YY-MM" formats
  const transformedData = data
    .map((item, index) => {
      let year, month;
      if (item.month.length === 7) { // "YYYY-MM"
        [year, month] = item.month.split("-");
      } else if (item.month.length === 6) { // "YY-MM"
        [year, month] = item.month.split("-");
        year = `20${year}`;
      } else {
        console.warn(`Invalid month format at index ${index}: ${item.month}`);
        return null;
      }
      const monthNum = parseInt(month, 10);
      const income = Number(item.income);
      const expenses = Number(item.expenses);
      if (
        isNaN(monthNum) ||
        monthNum < 1 ||
        monthNum > 12 ||
        isNaN(income) ||
        isNaN(expenses)
      ) {
        console.warn(`Invalid data entry at index ${index}: ${JSON.stringify(item)}`);
        return null;
      }
      const date = new Date(`${year}-${month}-01`);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date for month: ${item.month}`);
        return null;
      }
      const monthName = date.toLocaleString("default", { month: "short" });
      return { month: monthName, monthNum, year, income, expenses };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Create entries for all months (1-12) with zeros for missing months
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthStr = monthNum.toString().padStart(2, "0");
    const date = new Date(`2025-${monthStr}-01`);
    const monthName = date.toLocaleString("default", { month: "short" });
    const existing = transformedData.find((d) => d.monthNum === monthNum);
    return {
      month: monthName,
      monthNum,
      year: "2025",
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