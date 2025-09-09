import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Expense, Category } from "@/types";

interface ExpenseBreakdown {
  category: string;
  amount: number;
  color: string;
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
];

interface BreakdownProps {
  expenses: Expense[];
  categories: Category[];
}

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function Breakdown({ expenses, categories }: BreakdownProps) {
  const [data, setData] = useState<ExpenseBreakdown[]>([]);

  useEffect(() => {
    if (expenses.length && categories.length) {
      const breakdown = categories
        .map((cat, index) => {
          const total = expenses
            .filter(e => e.categoryId === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
          return { category: cat.name, amount: total, color: COLORS[index % COLORS.length] };
        })
        .filter(item => item.amount > 0); // Supprimer catégories à 0
      setData(breakdown);
    }
  }, [expenses, categories]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-2xl font-semibold">Expenses by Category</h3>
        <p className="text-gray-500 text-sm mt-2">Aucune donnée à afficher</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-2xl font-semibold mb-4">Expenses by Category</h3>
      <div className="h-70">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Breakdown;
