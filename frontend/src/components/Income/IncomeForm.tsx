import React, { useState, useEffect } from "react";
import { type Income } from "../../types";

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
      alert("Amount doit être un nombre.");
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
    // Overlay flou léger
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 pointer-events-auto rounded-xl" />

      {/* Formulaire centré */}
      <div className="relative bg-gray-50 rounded-xl shadow-lg border border-gray-100 px-8 py-10 w-[500px] max-w-[90%] pointer-events-auto z-10">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          {mode === "create" ? "Add Income" : "Edit Income"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Salary, Freelance, ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Optional details..."
            />
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              {mode === "create" ? "Submit" : "Update"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;
