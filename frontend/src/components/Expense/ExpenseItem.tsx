import React from "react";
import { Calendar, Receipt, Edit, Trash2, Eye, Download } from "lucide-react";
import type { Expense, Category } from "@/types/index.ts";
import { formatDate } from "@/utils/FormatDate.ts";
import { viewReceipt, downloadReceipt } from "@/api/receipt.ts";

interface ExpenseItemProps {
  expense: Expense;
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, categories, onEdit, onDelete }) => {
  const categoryName =
    categories.find((c) => c.id === expense.categoryId)?.name || "No category";

  const handleViewReceipt = async () => {
    if (!expense.receipt) return;
    try {
      const url = await viewReceipt(expense.receipt.id.toString());
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!expense.receipt) return;
    try {
      const blob = await downloadReceipt(expense.receipt.id.toString());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${expense.description || expense.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 hover:bg-background-hover transition-colors duration-150 flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h4 className="text-lg font-semibold text-text">{expense.description || "Untitled Expense"}</h4>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              expense.type === "RECURRING"
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300"
                : "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300"
            }`}
          >
            {expense.type}
          </span>
          {expense.receipt && <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(expense.date)}</span>
          </div>
          <span>•</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{categoryName}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            -${Number(expense.amount).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {expense.receipt && (
            <div className="flex items-center gap-1">
              <button onClick={handleViewReceipt} title="View receipt" className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg transition-colors duration-200">
                <Eye className="h-4 w-4" />
              </button>
              <button onClick={handleDownloadReceipt} title="Download receipt" className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200">
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
          <button onClick={() => onEdit(expense)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors duration-200">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(expense.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
