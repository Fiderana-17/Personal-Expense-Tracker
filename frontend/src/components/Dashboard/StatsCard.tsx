import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
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
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
  };

  const changeColorClasses = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${changeColorClasses[changeType]}`}
          >
            {change}
          </div>
        </div>
        <div
          className={`p-3 rounded-full ${colorClasses[color]} flex items-center justify-center transition-transform duration-300 hover:scale-110`}
        >
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;