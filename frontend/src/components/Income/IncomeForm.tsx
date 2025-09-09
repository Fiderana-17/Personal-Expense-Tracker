import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type IncomeFormProps } from "@/types";
import { useTranslation } from "react-i18next";

const IncomeForm: React.FC<IncomeFormProps> = ({ mode, initial, onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [notification, setNotification] = useState("");
  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount != null ? String(initial.amount) : "");
      setSource(initial.source ?? "");
      setDescription(initial.description ?? "");
      setDate(
        initial.date
          ? new Date(initial.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
    } else {
      setAmount("");
      setSource("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      setNotification(t("income.errors.invalidAmount"));
      setTimeout(() => setNotification(""), 5000);
      return;
    }

    onSubmit({
      id: initial?.id,
      amount: parsedAmount,
      source: source || undefined,
      description: description || undefined,
      date: new Date(date).toISOString(),
    });
  };

  return (
    <div className="relative">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 border-red-300 text-red-800 bg-red-100"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("income.amount")}
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
            placeholder={t("income.amountPlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("income.source")}
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
            placeholder={t("income.sourcePlaceholder")}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
            rows={3}
            placeholder={t("income.descriptionPlaceholder")}
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          >
            {t("buttons.cancel")}
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {mode === "create" ? t("income.save") : t("income.update")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
