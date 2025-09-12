import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Transaction } from "@/api/dashboard";
import { t } from "i18next";

interface Props {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-text text-center text-title duration-500 card p-10.5 rounded-lg border">{t("dashboard.transactions.none")}</div>;
  }

  return (
    <div className="card rounded-2xl shadow-md border border-border p-6 animate-slide-up">
      <h3 className="text-xl font-semibold text-text mb-6">{t("dashboard.transactions.recent")}</h3>
      <div className="space-y-5 max-h-64 overflow-y-auto pr-2 scrollbar-custom">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 hover:bg-background-hover rounded-xl transition-colors duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${isIncome ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"}`}>
                  <Icon className={`h-5 w-5 ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
                </div>
                <div>
                  <p className="font-medium text-text text-base">
                    {tx.description || tx.category?.name || "Other"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tx.category?.name || "Other"} • {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold text-base ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {isIncome ? "+" : "-"}${tx.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;