import { Search } from "lucide-react";
import type { Category } from "@/types/index.ts";

interface ExpenseFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  categories: Category[];
  t: any;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  categories,
  t,
}) => {
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
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card-bg text-text"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-card-bg text-text"
        >
          {filterCategories.map((category) => (
            <option key={category} value={category} className="bg-page text-text">
              {category === "all" ? t("expenses.allCategories") : category}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-card-bg text-text"
        >
          {types.map((type) => (
            <option key={type} value={type} className="bg-page text-text">
              {type === "all" ? t("expenses.allTypes") : type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ExpenseFilters;