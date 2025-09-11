import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "orange";
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      iconBg: "bg-blue-100 dark:bg-blue-800/30",
      iconText: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      iconBg: "bg-green-100 dark:bg-green-800/30",
      iconText: "text-green-600 dark:text-green-400",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      iconBg: "bg-red-100 dark:bg-red-800/30",
      iconText: "text-red-600 dark:text-red-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-300",
      iconBg: "bg-orange-100 dark:bg-orange-800/30",
      iconText: "text-orange-600 dark:text-orange-400",
    },
  };

  const changeColorClasses = {
    positive: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/30",
    negative: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/30",
    neutral: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/30",
  };

  return (
    <div
      className={`rounded-2xl shadow-md border border-border p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in card ${colorClasses[color].bg}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <h1 className={`text-sm uppercase font-bold tracking-wide ${colorClasses[color].text}`}>
            {title}
          </h1>
          <p className={`text-3xl font-bold ${colorClasses[color].text}`}>
            {value}
          </p>
          {change && (
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${changeColorClasses[changeType]}`}
            >
              {change}
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-full ${colorClasses[color].iconBg} flex items-center justify-center transition-transform duration-300 hover:scale-110`}
        >
          <Icon className={`h-10 w-10 ${colorClasses[color].iconText}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;