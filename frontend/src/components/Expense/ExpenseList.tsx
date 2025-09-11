import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { getExpenses, deleteExpense, createExpense, updateExpense } from "@/api/expense.ts";
import { getAllCategories } from "@/api/category.ts";
import { uploadReceipt } from "@/api/receipt.ts";
import type { Category, Expense } from "@/types/index.ts";
import { useTranslation } from "react-i18next";
import Loader from "../ui/Loader.tsx";
import ExpenseForm from "./ExpenseForm.tsx";
import DeleteModal from "./DeleteModal.tsx";
import Notification from "./Notification.tsx";
import ExpenseFilters from "./ExpenseFilters.tsx";
import ExpenseItem from "./ExpenseItem.tsx";
import { Plus, TrendingDown } from "lucide-react";

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
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  const { t } = useTranslation();

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const data = await getExpenses(Number(user.id));
      const normalized = data.map((exp) => ({
        ...exp,
        type: exp.type.toUpperCase(),
        amount: typeof exp.amount === "string" ? parseFloat(exp.amount) : exp.amount,
      }));
      setExpenses(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
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

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    setExpenseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete));
      setNotification("Expense deleted successfully");
      setNotificationType("success");
    } catch (err) {
      setNotification(err instanceof Error ? err.message : "An unknown error occurred");
      setNotificationType("error");
    } finally {
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const handleSubmit = async (formData: {
    description: string;
    amount: number;
    categoryId: number;
    userId: string;
    type: "ONE_TIME" | "RECURRING";
    date: string;
    receipt: File | null;
  }) => {
    if (!user) return;
    try {
      const expenseData = {
        description: formData.description,
        amount: formData.amount,
        categoryId: formData.categoryId,
        type: formData.type,
        date: formData.date,
        userId: Number(user.id),
      };

      if (editingExpense) {
        const updated = await updateExpense(editingExpense.id, expenseData);
        // Type guard to extract Expense
        const expense: Expense = "data" in updated ? updated.data : updated;
        if (formData.receipt) {
          await uploadReceipt(formData.receipt, expense.id);
          await fetchExpenses();
        } else {
          setExpenses((prev) =>
            prev.map((e) => (e.id === editingExpense.id ? { ...e, ...expense } : e))
          );
        }
        setNotification("Expense updated successfully");
      } else {
        const res = await createExpense(expenseData);
        const expense: Expense = {
          ...res.data,
          type: res.data.type.toUpperCase(),
          amount: typeof res.data.amount === "string" ? parseFloat(res.data.amount) : res.data.amount,
        };
        if (formData.receipt) {
          await uploadReceipt(formData.receipt, expense.id);
          await fetchExpenses();
        } else {
          setExpenses((prev) => [expense, ...prev]);
        }
        setNotification("Expense created successfully");
      }
      setNotificationType("success");
      setShowForm(false);
      setEditingExpense(null);
    } catch (err) {
      setNotification(err instanceof Error ? err.message : "An unknown error occurred");
      setNotificationType("error");
    } finally {
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const filterCategories = ["all", ...categories.map((c) => c.name)];
  const types = ["all", "ONE_TIME", "RECURRING"];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find((c) => c.id === expense.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      categories.find((c) => c.id === expense.categoryId)?.name === selectedCategory;
    const matchesType = selectedType === "all" || expense.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[calc(100vh-130px)] bg-page">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 dark:text-red-400">
        {t("expenses.error")}: {error}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-page py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text text-title">{t("expenses.title")}</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("expenses.addExpense")}</span>
          </button>
        </div>

        <Notification notification={notification} notificationType={notificationType} />

        {filteredExpenses.length > 0 && (
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
        )}

        <ExpenseFilters
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </div>
        </div>

        <ExpenseForm
          showForm={showForm}
          setShowForm={setShowForm}
          editingExpense={editingExpense}
          categories={categories}
          user={user}
          onSubmit={handleSubmit}
          t={t}
        />

        <DeleteModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onConfirm={confirmDelete}
          t={t}
        />
      </div>
    </div>
  );
};

export default ExpensesList;