import { t } from "i18next";
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
  const [startMonth, setStartMonth] = useState(1);

  useEffect(() => {
    console.log("Input data:", JSON.stringify(data, null, 2));
    console.log("Transformed data:", JSON.stringify(transformedData, null, 2));
    console.log("Formatted data:", JSON.stringify(formattedData, null, 2));
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="text-text text-center">{t("dashboard.chart.NoData")}</div>;
  }

  const transformedData = data
    .map((item, index) => {
      let year, month;
      if (item.month.length === 7) {
        [year, month] = item.month.split("-");
      } else if (item.month.length === 6) {
        [year, month] = item.month.split("-");
        year = `20${year}`;
      } else {
        console.warn(`Invalid month format at index ${index}: ${item.month}`);
        return null;
      }
      const monthNum = parseInt(month, 10);
      const income = Number(item.income);
      const expenses = Number(item.expenses);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(income) || isNaN(expenses)) {
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

  const formattedData = allMonths.sort((a, b) => {
    const aAdjusted = a.monthNum >= startMonth ? a.monthNum : a.monthNum + 12;
    const bAdjusted = b.monthNum >= startMonth ? b.monthNum : b.monthNum + 12;
    return aAdjusted - bAdjusted;
  });

  return (
    <div className="card rounded-lg shadow-md p-6 animate-slide-up">
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-2xl font-semibold text-text">
          {t("dashboard.chart.income")} vs {t("dashboard.chart.expenses")}
        </h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--chart-text)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "var(--chart-text)" }}
              tickLine={{ stroke: "var(--border)" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === "income" ? t("dashboard.chart.income") : t("dashboard.chart.expenses"),
              ]}
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text)",
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-text">
                  {value === "income" ? "Income" : "Expenses"}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              fill="var(--chart-income)"
              radius={[4, 4, 0, 0]}
              name="income"
            />
            <Bar
              dataKey="expenses"
              fill="var(--chart-expense)"
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