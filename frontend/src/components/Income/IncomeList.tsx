import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Calendar, TrendingUp } from "lucide-react";
import {
  getAllIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../../api/income.ts";
import { type Income } from "../../types";
import IncomeForm from "./IncomeForm.tsx";

const IncomeList: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Partial<Income> | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch incomes
  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const data = await getAllIncomes();
      setIncomes(data);
    } catch (err) {
      console.error("Erreur fetching incomes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const filteredIncomes = useMemo(
    () =>
      incomes.filter(
        (inc) =>
          inc.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [incomes, searchTerm]
  );

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);

  // Form handlers
  const openCreateForm = () => {
    setMode("create");
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (income: Income) => {
    setMode("edit");
    setEditing(income);
    setShowForm(true);
  };

  const handleSubmit = async (values: Partial<Income>) => {
    try {
      if (mode === "create") {
        await createIncome(values as Required<Pick<Income, "amount" | "date"> & { source?: string; description?: string }>);
      } else if (mode === "edit" && editing?.id) {
        await updateIncome(editing.id, values as Required<Pick<Income, "amount" | "date"> & { source?: string; description?: string }>);
      }
      await fetchIncomes();
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error("Erreur submit income:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce revenu ?")) {
      try {
        await deleteIncome(id);
        setIncomes((prev) => prev.filter((inc) => inc.id !== id));
      } catch (err) {
        console.error("Erreur delete income:", err);
      }
    }
  };

  if (loading) return <p>Loading incomes...</p>;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Income</h1>
        <button
          onClick={openCreateForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm && mode === "create" ? "Close Form" : "Add Income"}
        </button>
      </div>

      {/* Total Summary */}
      {filteredIncomes.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-xs p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium opacity-90">Total Income</h3>
              <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-1">This period</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search income sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste incomes */}
      {filteredIncomes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-lg">No income yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncomes.map((income) => (
            <div
              key={income.id}
              className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {income.source ?? "Untitled Income"}
                  </h3>
                  {income.description && <p className="text-sm text-gray-500">{income.description}</p>}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" /> {income.date}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditForm(income)} className="text-blue-500 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(income.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right font-bold text-green-600 text-xl">
                +${income.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form with blur */}
      {showForm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-[1000ms]">
          {/* Background flou sur contenu principal seulement */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 pointer-events-auto" />

          {/* Formulaire centré */}
          <div className="relative bg-gray-50 rounded-xl shadow-lg border border-gray-100 px-8 py-10 w-[500px] max-w-[90%] pointer-events-auto z-10 transform transition-all duration-[1000ms] opacity-100 scale-100">
            <IncomeForm
              mode={mode}
              initial={editing}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeList;
