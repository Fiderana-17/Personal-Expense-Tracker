import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { getExpenses } from "@/api/expense.ts";
import type { Expense, Category } from "@/types/index.ts";
import Loader from "../ui/Loader.tsx";
import { useTranslation } from "react-i18next";

import ExpenseFilters from "./ExpenseFilters";
import ExpenseForm from "./ExpenseForm";
import ExpenseItem from "./ExpenseItem";
import DeleteModal from "./DeleteModal.tsx";
import Notification from "./Notification";
import ExpenseSummary from "./ExpenseSummary.tsx";

const ExpensesList: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

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

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getExpenses(Number(user.id));
      const normalized = data.map((exp) => ({
        ...exp,
        type: exp.type.toUpperCase(),
        amount: typeof exp.amount === "string" ? parseFloat(exp.amount) : exp.amount,
      }));
      setExpenses(normalized);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user?.id]);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories
        .find((c) => c.id === expense.categoryId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      categories.find((c) => c.id === expense.categoryId)?.name === selectedCategory;
    const matchesType = selectedType === "all" || expense.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading)
    return (
      <div className="grid place-items-center min-h-[calc(100vh-130px)] bg-page">
        <Loader />
      </div>
    );

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
            onClick={() => { setEditingExpense(null); setShowForm(true); }}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2"
          >
            {t("expenses.addExpense")}
          </button>
        </div>

        <ExpenseFilters
          categories={categories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        <ExpenseSummary expenses={filteredExpenses} />

        {showForm && (
          <ExpenseForm
            categories={categories}
            userId={user?.id}
            expense={editingExpense}
            onClose={() => setShowForm(false)}
            onUpdate={fetchExpenses}
            setNotification={setNotification}
            setNotificationType={setNotificationType}
          />
        )}

        {showDeleteModal && (
          <DeleteModal
            expenseId={expenseToDelete}
            onClose={() => setShowDeleteModal(false)}
            onDelete={fetchExpenses}
            setNotification={setNotification}
            setNotificationType={setNotificationType}
          />
        )}

        <Notification message={notification} type={notificationType} />

        <div className="card rounded-xl shadow-md border border-border divide-y divide-border mt-6">
          {filteredExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              categories={categories}
              onEdit={(exp) => { setEditingExpense(exp); setShowForm(true); }}
              onDelete={(id) => { setExpenseToDelete(id); setShowDeleteModal(true); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesList;
