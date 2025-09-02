import React, { useEffect, useState } from "react";
import { type Income } from "../../types";

type Mode = "create" | "edit";

interface IncomeFormProps {
  mode: Mode;
  initial: Partial<Income> | null;
  onCancel: () => void;
  onSubmit: (values: {
    id?: string;
    amount: number;
    date: string;
    source?: string;
    description?: string;
    userId: string;
  }) => void | Promise<void>;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ mode, initial, onCancel, onSubmit }) => {
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount != null ? String(initial.amount) : "");
      setDate(initial.date ?? "");
      setSource(initial.source ?? "");
      setDescription(initial.description ?? "");
      setUserId(initial.userId ?? "");
    } else {
      setAmount("");
      setDate("");
      setSource("");
      setDescription("");
      setUserId("");
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      alert("Amount doit être un nombre.");
      return;
    }
    if (!date) {
      alert("La date est requise.");
      return;
    }
    if (!userId) {
      alert("userId est requis.");
      return;
    }

    onSubmit({
      id: initial?.id,
      amount: parsedAmount,
      date,
      source: source || undefined,
      description: description || undefined,
      userId,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {mode === "create" ? "Add Income" : "Edit Income"}
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="ex: 1"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Optional details..."
          />
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
