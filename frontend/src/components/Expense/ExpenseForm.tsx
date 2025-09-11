import React, { useRef } from "react";
import { X, Download } from "lucide-react";
import type { Category, Expense } from "@/types/index.ts";
import { useTranslation } from "react-i18next";

interface ExpenseFormProps {
  formData: {
    description: string;
    amount?: number;
    categoryId: number;
    type: "ONE_TIME" | "RECURRING";
    date: string;
    receipt: File | null;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      description: string;
      amount?: number;
      categoryId: number;
      type: "ONE_TIME" | "RECURRING";
      date: string;
      receipt: File | null;
    }>
  >;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  editingExpense: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  formData,
  setFormData,
  categories,
  onSubmit,
  onClose,
  editingExpense,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, receipt: e.target.files![0] }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">{t("expenses.description")}</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">{t("expenses.amount")} ($)</label>
        <input
          type="text"
          value={formData.amount ?? ""}
          onChange={(e) => {
            const chiffres = e.target.value.replace(/\D/g, "");
            setFormData({ ...formData, amount: chiffres === "" ? undefined : Number(chiffres) });
          }}
          className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">{t("expenses.category")}</label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">{t("expenses.date")}</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">{t("expenses.type")}</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as "ONE_TIME" | "RECURRING" })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-card text-title focus:ring-2 focus:ring-indigo-500"
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
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 w-full flex gap-x-3 items-center justify-center"
          >
            <Download className="inline h-5 w-5" />
            {formData.receipt ? t("expenses.changeReceipt") : t("expenses.addReceipt")}
          </button>
          {formData.receipt && <span className="ml-2 text-text">{formData.receipt.name}</span>}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" className="hidden" />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {editingExpense ? t("expenses.updateExpense") : t("expenses.saveExpense")}
      </button>
    </form>
  );
};

export default ExpenseForm;
