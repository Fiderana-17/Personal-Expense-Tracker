import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Calendar, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getAllIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../../api/income.ts";
import { type Income } from "../../types";
import IncomeForm from "./IncomeForm.tsx";
import Loader from "../ui/Loader.tsx";

const IncomeList: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Partial<Income> | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Confirmation delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Fetch incomes
  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const data = await getAllIncomes();
      setIncomes(data);
    } catch (err) {
      if (err instanceof Error) {
        setNotification(err.message);
        setNotificationType('error');
      } else {
        setNotification('An unknown error occurred');
        setNotificationType('error');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 5000);
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
        showNotification("Income created successfully!", "success");
      } else if (mode === "edit" && editing?.id) {
        await updateIncome(editing.id, values as Required<Pick<Income, "amount" | "date"> & { source?: string; description?: string }>);
        showNotification("Income updated successfully!", "success");
      }
      setNotificationType('success');
      await fetchIncomes();
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error("Erreur submit income:", err);
      showNotification("An error occurred while saving income.", "error");
    }
  };
  
  // Delete handlers
  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteYes = async () => {
    if (!confirmDelete) return;
    try {
      await deleteIncome(confirmDelete);
      setIncomes(prev => prev.filter(inc => inc.id !== confirmDelete));
      showNotification("Income deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("An error occurred while deleting income.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const confirmDeleteNo = () => {
    setConfirmDelete(null);
  };

  if (loading) return <p>Loading incomes...</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-title">Income</h1>
        <button
          onClick={openCreateForm}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm && mode === "create" ? "Close Form" : "Add Income"}</span>
        </button>
      </div>

      {/* Total Summary */}
      {filteredIncomes.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium opacity-90">Total Income</h3>
              <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-1">This period</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-700" />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-page rounded-xl shadow-md border duration-500 border-border p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search income sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-title pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
              notificationType === 'success' ? 'bg-green-500 text-white' : 'border-red-300 text-red-800 bg-red-100'
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income List */}
      {filteredIncomes.length === 0 ? (
        <div className="bg-page rounded-xl shadow-md border border-border p-12 text-center duration-500">
          <p className="text-title text-lg">No income yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncomes.map((income) => (
            <div
              key={income.id}
              className="bg-page rounded-xl shadow-md border border-border p-6 hover:shadow-lg duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-title duration-500">
                    {income.source ?? "Untitled Income"}
                  </h3>
                  {income.description && (
                    <p className="text-sm text-gray-500">
                      {income.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{income.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(income)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-red-500 hover:text-red-700"
                  >
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
      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop qui couvre 100% de main */}
            <motion.div
              className="fixed inset-0 w-full h-full bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            />

            {/* Form centré */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md"
            >
              <IncomeForm
                mode={mode}
                initial={editing}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Delete */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              className="fixed inset-0 w-full h-full bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={confirmDeleteNo}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-sm z-50"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm deletion
              </h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this income?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={confirmDeleteNo}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  onClick={confirmDeleteYes}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white 
              ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncomeList;