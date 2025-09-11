import {
  Plus,
  Search,
  Receipt,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Download,
  Eye,
  TrendingDown,
} from "lucide-react";
import {
  deleteExpense,
  createExpense,
  updateExpense,
  getExpenses,
} from "@/api/expense.ts";
import { uploadReceipt, downloadReceipt, viewReceipt } from "@/api/receipt.ts";
import type { Category, Expense } from "@/types/index.ts";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCategories } from "@/api/category.ts";
import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/FormatDate.ts";
import { useAuth } from "@/hooks/useAuth.ts";
import Loader from "../ui/Loader.tsx";
import { useTranslation } from "react-i18next";

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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );
  const { t } = useTranslation(); 

  const [formData, setFormData] = useState({
    description: "",
    amount: 0 as number | undefined,
    categoryId: 1,
    userId: user?.id || "",
    type: "ONE_TIME" as "ONE_TIME" | "RECURRING",
    date: new Date().toISOString().split("T")[0],
    receipt: null as File | null,
  });

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
      if (err instanceof Error) {
        setNotification(err.message);
        setNotificationType("error");
      } else {
        setNotification("An unknown error occurred");
        setNotificationType("error");
      }
    } finally {
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        receipt: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const expense = "data" in updated ? updated.data : updated;

        if (formData.receipt) {
          await uploadReceipt(formData.receipt, expense.id);
          // Rafraîchir les données pour obtenir le reçu mis à jour
          await fetchExpenses();
        } else {
          setExpenses((prev) =>
            prev.map((e) =>
              e.id === editingExpense.id && typeof expense === "object"
                ? { ...e, ...expense }
                : e
            )
          );
        }
        setNotification("Expense updated successfully");
      } else {
        const res = await createExpense(expenseData);
        const expense = {
          ...res.data,
          type: res.data.type.toUpperCase(),
          amount:
            typeof res.data.amount === "string"
              ? parseFloat(res.data.amount)
              : res.data.amount,
        };

        if (formData.receipt) {
          await uploadReceipt(formData.receipt, expense.id);
          // Rafraîchir les données pour obtenir le reçu mis à jour
          await fetchExpenses();
        } else {
          setExpenses((prev) => [expense, ...prev]);
        }
        setNotification("Expense created successfully");
      }
      setNotificationType("success");
      setShowForm(false);
      setEditingExpense(null);
      setFormData({
        description: "",
        amount: 0,
        categoryId: categories.length > 0 ? categories[0].id : 1,
        userId: user.id,
        type: "ONE_TIME",
        date: new Date().toISOString().split("T")[0],
        receipt: null,
      });
    } catch (err) {
      if (err instanceof Error) {
        setNotification(err.message);
        setNotificationType("error");
      } else {
        setNotification("An unknown error occurred");
        setNotificationType("error");
      }
    } finally {
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description ?? "",
      amount: Number(expense.amount),
      categoryId: expense.categoryId,
      userId: expense.userId.toString(),
      type:
        typeof expense.type === "string"
          ? (expense.type.toUpperCase() as "ONE_TIME" | "RECURRING")
          : "ONE_TIME",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
      receipt: null,
    });
    setShowForm(true);
  };

  const handleViewReceipt = async (receiptId: number) => {
    try {
      const url = await viewReceipt(receiptId.toString());
      window.open(url, "_blank");
      // Nettoyer l'URL après ouverture
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("View failed:", error);
      setNotification("Failed to view receipt");
      setNotificationType("error");
    }
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setFormData({
      description: "",
      amount: 0,
      categoryId: categories.length > 0 ? categories[0].id : 1,
      userId: user?.id || "",
      type: "ONE_TIME",
      date: new Date().toISOString().split("T")[0],
      receipt: null,
    });
    setShowForm(true);
  };

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
      <div className="grid place-items-center min-h-[calc(100vh-130px)]">
        <Loader />
      </div>
    );
  }

  if (error)
    return (
      <p className="text-red-600">
        {t("expenses.error")}: {error}
      </p>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-title duration-500">
          {t("expenses.title")}
        </h1>
        <button
          onClick={handleAddClick}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t("expenses.addExpense")}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="absolute w-full inset-0 bg-black/20 backdrop-blur-sm z-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-md space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingExpense
                    ? t("expenses.editExpense")
                    : t("expenses.addExpense")}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("expenses.description")}
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("expenses.amount")} ($)
                  </label>
                  <input
                    type="text"
                    value={formData.amount ?? ""}
                    onChange={(e) => {
                      const chiffres = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        amount: chiffres === "" ? undefined : Number(chiffres),
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("expenses.category")}
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("expenses.date")}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("expenses.type")}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "ONE_TIME" | "RECURRING",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="ONE_TIME">{t("expenses.oneTime")}</option>
                    <option value="RECURRING">{t("expenses.recurring")}</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 w-full flex gap-x-3 items-center text-center justify-center"
                    >
                      <Download className="inline h-5 w-5" />
                      {formData.receipt ? formData.receipt.name : t("expenses.addReceipt")}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>
                    {editingExpense
                      ? t("expenses.updateExpense")
                      : t("expenses.saveExpense")}
                  </span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              className="absolute w-full inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-md space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("expenses.confirmDelete")}
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600">{t("expenses.deleteMessage")}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t("expenses.no")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t("expenses.yes")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
              notificationType === "success"
                ? "bg-green-500 text-white"
                : "border-red-300 text-red-800 bg-red-100"
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredExpenses.length >= 0 && (
        <div className="bg-gradient-to-t from-red-500 to-red-700 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium opacity-90">
                {t("expenses.total")}
              </h3>
              <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-1">
                {t("expenses.thisPeriod")}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-700" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-page duration-500 rounded-xl shadow-md border border-border p-6 my-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t("expenses.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-title duration-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-title duration-500"
          >
            {filterCategories.map((category) => (
              <option
                key={category}
                value={category}
                className="bg-page duration-500"
              >
                {category === "all"
                  ? `${t("expenses.allCategories")}`
                  : category}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-title duration-500"
          >
            {types.map((type) => (
              <option key={type} value={type} className="bg-page duration-500">
                {type === "all" ? `${t("expenses.allTypes")}` : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-page duration-500 rounded-xl shadow-md border border-border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-title duration-500">
            {t("expenses.found", { count: filteredExpenses.length })}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-6 hover:bg-background duration-150 transition-colors flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-title duration-500">
                    {expense.description || "Untitled Expense"}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      expense.type === "RECURRING"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {expense.type}
                  </span>
                  {expense.receipt && (
                    <Receipt className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                  <span>•</span>
                  <span className="font-medium text-gray-700">
                    {categories.find((c) => c.id === expense.categoryId)
                      ?.name || "No category"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    -${Number(expense.amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {expense.receipt && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewReceipt(expense.receipt!.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title={t("expenses.viewReceipt")}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const blob = await downloadReceipt(
                              expense.receipt!.id.toString()
                            );
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `receipt-${
                              expense.description || expense.id
                            }.pdf`; // nom du fichier à télécharger
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch (error) {
                            console.error("Download failed:", error);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title={t("expenses.downloadReceipt")}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesList;
