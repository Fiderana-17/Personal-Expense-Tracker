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
      bg: "bg-blue-50",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
    },
  };

  const changeColorClasses = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };

  return (
    <div
      className={`rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in ${colorClasses[color].bg}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <h1 className={`text-sm  uppercase font-bold tracking-wide ${colorClasses[color].text}`}>
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