import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import type { Category, Expense, User } from "@/types/index.ts";

interface ExpenseFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingExpense: Expense | null;
  categories: Category[];
  user: User | null;
  setEditingExpense: (expense: Expense | null) => void; // Ajouté pour réinitialiser editingExpense
  onSubmit: (formData: {
    description: string;
    amount: number | undefined;
    categoryId: number;
    userId: string;
    type: "ONE_TIME" | "RECURRING";
    date: string;
    endDate?: string;
    receipt: File | null;
  }) => void;
  t: (key: string) => string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  showForm,
  setShowForm,
  editingExpense,
  categories,
  user,
  setEditingExpense,
  onSubmit,
  t,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: 0 as number | undefined,
    categoryId: categories.length > 0 ? categories[0].id : 1,
    userId: user?.id || "",
    type: "ONE_TIME" as "ONE_TIME" | "RECURRING",
    date: new Date().toISOString().split("T")[0],
    endDate: undefined as string | undefined,
    receipt: null as File | null,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    console.log("useEffect triggered, showForm:", showForm, "editingExpense:", editingExpense); // Log pour débogage
    if (editingExpense) {
      setFormData({
        description: editingExpense.description ?? "",
        amount: Number(editingExpense.amount) || 0,
        categoryId: editingExpense.categoryId ?? (categories.length > 0 ? categories[0].id : 1),
        userId: editingExpense.userId.toString() ?? user?.id ?? "",
        type:
          typeof editingExpense.type === "string"
            ? (editingExpense.type.toUpperCase() as "ONE_TIME" | "RECURRING")
            : "ONE_TIME",
        date: editingExpense.date
          ? new Date(editingExpense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: editingExpense.endDate
          ? new Date(editingExpense.endDate).toISOString().split("T")[0]
          : undefined,
        receipt: null,
      });
    } else {
      setFormData({
        description: "",
        amount: 0,
        categoryId: categories.length > 0 ? categories[0].id : 1,
        userId: user?.id ?? "",
        type: "ONE_TIME",
        date: new Date().toISOString().split("T")[0],
        endDate: undefined,
        receipt: null,
      });
    }
  }, [editingExpense, categories, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        receipt: e.target.files![0],
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, editingExpense:", editingExpense, "formData:", formData); // Log pour débogage
    onSubmit(formData);
    setShowForm(false);
    setEditingExpense(null); // Réinitialise editingExpense après soumission
  };

  return (
    <AnimatePresence>
      {showForm && (
        <>
          <motion.div
            className="absolute w-full inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              console.log("Closing form via backdrop, setting editingExpense to null"); // Log pour débogage
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
                {editingExpense && editingExpense.id ? t("expenses.editExpense") : t("expenses.addExpense")}
              </h2>
              <button
                onClick={() => {
                  console.log("Closing form via X button, setting editingExpense to null"); // Log pour débogage
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
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
                      endDate: e.target.value === "RECURRING" && !editingExpense ? new Date().toISOString().split("T")[0] : formData.endDate,
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
                  {formData.type === "RECURRING" ? t("expenses.startDate") : t("expenses.date")}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                    {formData.receipt ? t("expenses.changeReceipt") : t("expenses.addReceipt")}
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
                  {editingExpense && editingExpense.id ? t("expenses.updateExpense") : t("expenses.saveExpense")}
                </span>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExpenseForm;