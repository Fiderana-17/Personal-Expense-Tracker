import React from "react";
import { TrendingDown } from "lucide-react";
import type { Expense } from "@/types/index.ts";
import { useTranslation } from "react-i18next";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
  const { t } = useTranslation();
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (expenses.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl shadow-md p-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium opacity-90">{t("income.total")}</h3>
          <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">{t("income.thisPeriod")}</p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800/30 bg-opacity-20 dark:bg-opacity-50 rounded-full">
          <TrendingDown className="w-8 h-8 text-red-700 dark:text-red-400" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
