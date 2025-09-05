import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Income } from "@/types";

type Mode = "create" | "edit";

interface IncomeFormProps {
  mode: Mode;
  initial: Partial<Income> | null;
  onCancel: () => void;
  onSubmit: (values: {
    id?: string;
    amount: number;
    source?: string;
    description?: string;
    date: string;
  }) => void | Promise<void>;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ mode, initial, onCancel, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount != null ? String(initial.amount) : "");
      setSource(initial.source ?? "");
      setDescription(initial.description ?? "");
    } else {
      setAmount("");
      setSource("");
      setDescription("");
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      setNotification("Amount must be a valid number.");
      setTimeout(() => setNotification(""), 5000);
      return;
    }

    const now = new Date().toISOString();
    onSubmit({
      id: initial?.id,
      amount: parsedAmount,
      source: source || undefined,
      description: description || undefined,
      date: now,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
            placeholder="Salary, Freelance, ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border outline-0 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500"
            rows={3}
            placeholder="Optional details..."
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {mode === "create" ? "Save Income" : "Update Income"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;