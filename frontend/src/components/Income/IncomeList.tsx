import { Plus, Search, Edit, Trash2, Calendar, TrendingUp, AlertCircle, X, FolderOpen } from "lucide-react";
import { getAllIncomes, createIncome, updateIncome, deleteIncome } from "../../api/income.ts";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../ui/FormatDate.ts";
import { type Income } from "../../types";
import IncomeForm from "./IncomeForm.tsx";
import Loader from "../ui/Loader.tsx";
import { useTranslation } from "react-i18next";

const IncomeList: React.FC = () => {
  const { t } = useTranslation();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Partial<Income> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch incomes
  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const data = await getAllIncomes();
      setIncomes(data);
    } catch (err) {
      if (err instanceof Error) {
        setNotification(err.message);
        setNotificationType("error");
      } else {
        setNotification(t("errors.unknown"));
        setNotificationType("error");
      }
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(""), 5000);
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
        setNotification(t("income.created"));
      } else if (mode === "edit" && editing?.id) {
        await updateIncome(editing.id, values as Required<Pick<Income, "amount" | "date"> & { source?: string; description?: string }>);
        setNotification(t("income.updated"));
      }
      setNotificationType("success");
      await fetchIncomes();
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      if (err instanceof Error) {
        setNotification(err.message);
        setNotificationType("error");
      } else {
        setNotification(t("errors.unknown"));
        setNotificationType("error");
      }
    } finally {
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    setIncomeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!incomeToDelete) return;
    try {
      await deleteIncome(incomeToDelete);
      setIncomes((prev) => prev.filter((inc) => inc.id !== incomeToDelete));
      setNotification(t("income.deleted"));
      setNotificationType("success");
    } catch (err) {
      if (err instanceof Error) {
        setNotification(err.message);
        setNotificationType("error");
      } else {
        setNotification(t("errors.unknown"));
        setNotificationType("error");
      }
    } finally {
      setShowDeleteModal(false);
      setIncomeToDelete(null);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[calc(100vh-130px)]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-title">{t("income.title")}</h1>
        <button
          onClick={openCreateForm}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm && mode === "create" ? t("income.closeForm") : t("income.add")}</span>
        </button>
      </div>

      {/* Total Summary */}
      {filteredIncomes.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium opacity-90">{t("income.total")}</h3>
              <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-1">{t("income.thisPeriod")}</p>
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
            placeholder={t("income.searchPlaceholder") ?? ""}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-title pr-4 py-2 border border-gray-300 rounded-lg"
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
              notificationType === "success" ? "bg-green-500 text-white" : "border-red-300 text-red-800 bg-red-100"
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income List */}
      {filteredIncomes.length === 0 ? (
        <div className="bg-page duration-500 rounded-xl shadow-md border border-border p-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-title duration-500 mb-2">{t("income.noFound")}</h3>
          <p className="text-title duration-500 mb-6">{t("income.noFoundDesc")}</p>
          <button
            onClick={openCreateForm}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{t("income.add")}</span>
          </button>
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
                    {income.source ?? t("income.untitled")}
                  </h3>
                  {income.description && <p className="text-sm text-gray-500">{income.description}</p>}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(typeof income.date === "string" ? income.date : income.date.toISOString())}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <p>Creation date:</p>
                    <span>{formatDate(typeof income.createdAt === "string" ? income.createdAt : income.createdAt.toISOString())}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(income)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="absolute w-full inset-0 bg-black/20 backdrop-blur-sm z-40"
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
              className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {mode === "create" ? t("income.add") : t("income.edit")}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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

      {/* Delete Confirmation Modal */}
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
                <h2 className="text-lg font-semibold text-gray-800">{t("income.confirmDeleteTitle")}</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600">{t("income.confirmDeleteMessage")}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t("buttons.no")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t("buttons.yes")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncomeList;
