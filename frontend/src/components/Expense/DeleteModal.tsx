import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DeleteModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  onConfirm: () => void;
  t: any;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  onConfirm,
  t,
}) => {
  return (
    <AnimatePresence>
      {showDeleteModal && (
        <>
          <motion.div
            className="absolute w-full inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40"
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
            className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 card rounded-xl shadow-lg border border-border p-6 w-full max-w-md space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-text">{t("expenses.confirmDelete")}</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t("expenses.deleteMessage")}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                {t("expenses.no")}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
              >
                {t("expenses.yes")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;