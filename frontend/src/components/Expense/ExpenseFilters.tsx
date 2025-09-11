import React from "react";
import { Search } from "lucide-react";
import type { Category } from "@/types/index.ts";
import { useTranslation } from "react-i18next";

interface ExpenseFiltersProps {
  categories: Category[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
}) => {
  const { t } = useTranslation();
  const filterCategories = ["all", ...categories.map((c) => c.name)];
  const types = ["all", "ONE_TIME", "RECURRING"];

  return (
    <div className="card rounded-xl shadow-md border border-border p-6 my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder={t("expenses.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
        >
          {filterCategories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? t("expenses.allCategories") : category}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:ring-2 focus:ring-indigo-500"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? t("expenses.allTypes") : type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ExpenseFilters;
