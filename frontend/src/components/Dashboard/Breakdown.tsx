import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getAllCategories } from "@/api/category";
import type { Expense, Category } from "@/types";
import { getExpenses } from "@/api/expense";

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

  // Fetch des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(localStorage.getItem("userId"));
        const [expensesRes, categoriesRes] = await Promise.all([
          getExpenses(userId), // Utilise l'ID utilisateur depuis le localStorage
          getAllCategories(),
        ]);
        setExpenses(expensesRes);
        setCategories(categoriesRes);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
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
      }).filter((item) => item.amount > 0); // supprimer les catégories vides

      setData(breakdown);
    }
  }, [expenses, categories]);

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <h3 className="text-2xl font-semibold mb-6">Expenses by Category</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune donnée à afficher</p>
      ) : (
        <div className="h-80">
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
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
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
