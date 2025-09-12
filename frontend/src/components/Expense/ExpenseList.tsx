import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { useTranslation } from "react-i18next";
import { getExpenses } from "@/api/expense.ts";
import { getAllCategories } from "@/api/category.ts";
import { viewReceipt, downloadReceipt } from "@/api/receipt.ts";
import type { Category, Expense } from "@/types/index.ts";
import Loader from "../ui/Loader.tsx";
import ExpenseForm from "./ExpenseForm.tsx";
import DeleteModal from "./DeleteModal.tsx";
import ExpenseFilter from "./ExpenseFilter.tsx";
import ExpenseItem from "./ExpenseItem.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingDown, AlertCircle } from "lucide-react";

const ExpensesList: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );
  const { t } = useTranslation();

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const data = await getExpenses(Number(user.id));
      const normalized = data.map((exp) => ({
        ...exp,
        type: exp.type.toUpperCase(),
        amount:
          typeof exp.amount === "string" ? parseFloat(exp.amount) : exp.amount,
      }));
      setExpenses(normalized);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const handleEdit = (expense: Expense) => {
    console.log("handleEdit called with:", expense);
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setExpenseToDelete(id);
    setShowDeleteModal(true);
  };

  const handleViewReceipt = async (receiptId: number) => {
    try {
      const url = await viewReceipt(receiptId.toString());
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("View failed:", error);
      setNotification("Failed to view receipt");
      setNotificationType("error");
    }
  };

  const handleAddClick = () => {
    console.log("handleAddClick called, setting editingExpense to null");
    setEditingExpense(null);
    setShowForm(true);
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [user?.id]);

  const filterCategories = ["all", ...categories.map((c) => c.name)];
  const types = ["all", "ONE_TIME", "RECURRING"];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories
        .find((c) => c.id === expense.categoryId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      categories.find((c) => c.id === expense.categoryId)?.name ===
        selectedCategory;
    const matchesType = selectedType === "all" || expense.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[calc(100vh-130px)] bg-page">
        <Loader />
      </div>
    );
  }

  if (error)
    return (
      <p className="text-red-600 dark:text-red-400">
        {t("expenses.error")}: {error}
      </p>
    );

  return (
    <div className="min-h-screen bg-page py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text text-title">
            {t("expenses.title")}
          </h1>
          <button
            onClick={handleAddClick}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("expenses.addExpense")}</span>
          </button>
        </div>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
                notificationType === "success"
                  ? "bg-green-500 dark:bg-green-600 text-white"
                  : "border-red-300 dark:border-red-500 text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/50"
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredExpenses.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl shadow-md p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium opacity-90">
                  {t("income.total")}
                </h3>
                <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
                <p className="text-sm opacity-80 mt-1">
                  {t("income.thisPeriod")}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800/30 bg-opacity-20 dark:bg-opacity-50 rounded-full">
                <TrendingDown className="w-8 h-8 text-red-700 dark:text-red-400" />
              </div>
            </div>
          </div>
        )}

        <ExpenseFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          categories={categories}
          t={t}
        />

        <div className="card rounded-xl shadow-md border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text">
              {t("expenses.found", { count: filteredExpenses.length })}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {filteredExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                categories={categories}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleViewReceipt={handleViewReceipt}
                handleDownloadReceipt={async (
                  receiptId: string,
                  description: string | undefined,
                  id: number
                ) => {
                  try {
                    const blob = await downloadReceipt(receiptId);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `receipt-${description || id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error("Download failed:", error);
                  }
                }}
                t={t}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <ExpenseForm
              user={user}
              categories={categories}
              editingExpense={editingExpense}
              setShowForm={setShowForm}
              setEditingExpense={setEditingExpense}
              setExpenses={setExpenses}
              fetchExpenses={fetchExpenses}
              setNotification={setNotification}
              setNotificationType={setNotificationType}
              t={t}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <DeleteModal
              setShowDeleteModal={setShowDeleteModal}
              expenseToDelete={expenseToDelete}
              setExpenses={setExpenses}
              setNotification={setNotification}
              setNotificationType={setNotificationType}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpensesList;