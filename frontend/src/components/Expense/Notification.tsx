import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error";
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
        type === "success"
          ? "bg-green-500 dark:bg-green-600 text-white"
          : "border-red-300 dark:border-red-500 text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/50"
      }`}
    >
      <AlertCircle className="h-5 w-5" />
      <span>{message}</span>
    </motion.div>
  );
};

export default Notification;
