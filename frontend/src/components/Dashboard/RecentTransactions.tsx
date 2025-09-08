import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Transaction } from "@/api/dashboard";

interface Props {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return <div>Pas de transactions récentes</div>;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      <div className="space-y-4">
        {transactions.map(tx => {
          const isIncome = tx.type === "income";
          const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isIncome ? "bg-green-100" : "bg-red-100"}`}>
                  <Icon className={`h-4 w-4 ${isIncome ? "text-green-600" : "text-red-600"}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{tx.description || tx.category?.name}</p>
                  <p className="text-xs text-gray-500">{tx.category?.name || "Autre"} • {new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${isIncome ? "text-green-600" : "text-red-600"}`}>
                {isIncome ? "+" : "-"}${tx.amount.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;