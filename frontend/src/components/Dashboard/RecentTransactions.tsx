import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Transaction } from "@/api/dashboard";
import { t } from "i18next";

interface Props {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-gray-500 text-center">{t("dashboard.transactions.none")}</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-slide-up">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{t("dashboard.transactions.recent")}</h3>

      {/* Liste scrollable */}
      <div className="space-y-5 max-h-64 overflow-y-auto pr-2">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${isIncome ? "bg-green-100" : "bg-red-100"}`}>
                  <Icon className={`h-5 w-5 ${isIncome ? "text-green-600" : "text-red-600"}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-base">
                    {tx.description || tx.category?.name || "Other"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tx.category?.name || "Other"} • {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold text-base ${
                  isIncome ? "text-green-600" : "text-red-600"
                }`}
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
