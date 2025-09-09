import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getExpenses } from "@/api/expense"; 
import { getAllCategories } from "@/api/category";
import type { Expense, Category } from "@/types";

interface ExpenseBreakdown {
  category: string;
  amount: number;
  color: string;
}

const COLORS = [
  "#3B82F6", 
  "#10B981", 
  "#F59E0B", 
  "#EF4444", 
  "#8B5CF6", 
  "#EC4899", 
  "#14B8A6", 
];

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

function Breakdown() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ExpenseBreakdown[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(localStorage.getItem("userId"));
        if (isNaN(userId)) {
          throw new Error("Invalid user ID");
        }
        const [expensesRes, categoriesRes] = await Promise.all([
          getExpenses(userId),
          getAllCategories(),
        ]);
        setExpenses(expensesRes);
        setCategories(categoriesRes);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setError("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // Calcul du breakdown par catégorie
  useEffect(() => {
    if (expenses.length > 0 && categories.length > 0) {
      const breakdown: ExpenseBreakdown[] = categories.map((cat, index) => {
        const total = expenses
          .filter((e) => e.categoryId === cat.id)
          .reduce((sum, e) => sum + e.amount, 0);

        return {
          category: cat.name,
          amount: total,
          color: COLORS[index % COLORS.length],
        };
      }).filter((item) => item.amount > 0); // Supprimer les catégories vides

      setData(breakdown);
    }
  }, [expenses, categories]);

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-2xl font-semibold">Expenses by Category</h3>
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune donnée à afficher</p>
      ) : (
        <div className="h-58">
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
                nameKey="category" // Added to ensure category names are used
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
                  borderRadius: "8px"
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
      )}
    </div>
  );
}

export default Breakdown;