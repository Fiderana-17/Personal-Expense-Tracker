import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import type { Category, Expense, User } from "@/types/index.ts";
import { createExpense, updateExpense } from "@/api/expense.ts";
import { uploadReceipt } from "@/api/receipt.ts";

interface ExpenseFormProps {
  user: User | null;
  categories: Category[];
  editingExpense: Expense | null;
  setShowForm: (show: boolean) => void;
  setEditingExpense: (expense: Expense | null) => void;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  fetchExpenses: () => Promise<void>;
  setNotification: (message: string) => void;
  setNotificationType: (type: "success" | "error") => void;
  t: (key: string, options?: any) => string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  user,
  categories,
  editingExpense,
  setShowForm,
  setEditingExpense,
  setExpenses,
  fetchExpenses,
  setNotification,
  setNotificationType,
  t,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = React.useState({
    description: editingExpense?.description ?? "",
    amount: editingExpense ? Number(editingExpense.amount) : (0 as number | undefined),
    categoryId: editingExpense?.categoryId ?? (categories.length > 0 ? categories[0].id : 1),
    userId: editingExpense?.userId.toString() ?? user?.id ?? "",
    type: editingExpense?.type
      ? (typeof editingExpense.type === "string"
          ? (editingExpense.type.toUpperCase() as "ONE_TIME" | "RECURRING")
          : "ONE_TIME")
      : "ONE_TIME",
    date: editingExpense?.date
      ? new Date(editingExpense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    endDate: editingExpense?.endDate
      ? new Date(editingExpense.endDate).toISOString().split("T")[0]
      : undefined,
    receipt: null as File | null,
  });

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

    console.log("handleSubmit called, editingExpense:", editingExpense, "formData:", formData);

    try {
      const expenseData = {
        description: formData.description,
        amount: formData.amount,
        categoryId: formData.categoryId,
        type: formData.type,
        date: formData.date,
        endDate: formData.endDate,
        userId: Number(user.id),
      };

      if (editingExpense) {
        const updated = await updateExpense(editingExpense.id, expenseData);
        let expense: Expense;

        // Vérification du type de retour de updateExpense
        if ("data" in updated && typeof updated.data === "object") {
          expense = updated.data as Expense;
        } else if (typeof updated === "object") {
          expense = updated as Expense;
        } else {
          throw new Error("Unexpected response format from updateExpense");
        }

        if (formData.receipt) {
          await uploadReceipt(formData.receipt, expense.id);
          await fetchExpenses();
        } else {
          setExpenses((prev) =>
            prev.map((e) =>
              e.id === editingExpense.id ? { ...e, ...expense } : e
            )
          );
        }
        setNotification("Expense updated successfully");
      } else {
        const res = await createExpense(expenseData);
        const expense: Expense = {
          ...res.data,
          type: res.data.type.toUpperCase(),
          amount:
            typeof res.data.amount === "string"
              ? parseFloat(res.data.amount)
              : res.data.amount,
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

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="absolute w-full inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            console.log("Closing form via backdrop, setting editingExpense to null");
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 card rounded-xl shadow-lg border border-border p-6 w-full max-w-md space-y-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-text">
              {editingExpense && editingExpense.id
                ? t("expenses.editExpense")
                : t("expenses.addExpense")}
            </h2>
            <button
              onClick={() => {
                console.log("Closing form via X button, setting editingExpense to null");
                setShowForm(false);
                setEditingExpense(null);
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                {t("expenses.description")}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
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
                className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
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
                className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                {t("expenses.type")}
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "ONE_TIME" | "RECURRING",
                    endDate:
                      e.target.value === "RECURRING" && !editingExpense
                        ? new Date().toISOString().split("T")[0]
                        : formData.endDate,
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-card text-title focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ONE_TIME">{t("expenses.oneTime")}</option>
                <option value="RECURRING">{t("expenses.recurring")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                {formData.type === "RECURRING"
                  ? t("expenses.startDate")
                  : t("expenses.date")}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {formData.type === "RECURRING" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  {t("expenses.endDate")}
                </label>
                <input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 w-full flex gap-x-3 items-center text-center justify-center"
                >
                  <Download className="inline h-5 w-5" />
                  {formData.receipt
                    ? t("expenses.changeReceipt")
                    : t("expenses.addReceipt")}
                </button>
                {formData.receipt && (
                  <span className="ml-2 text-text">{formData.receipt.name}</span>
                )}
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
              className="w-full bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>
                {editingExpense && editingExpense.id
                  ? t("expenses.updateExpense")
                  : t("expenses.saveExpense")}
              </span>
            </button>
          </form>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default ExpenseForm;