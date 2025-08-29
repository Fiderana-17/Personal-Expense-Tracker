import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Receipt, Edit, Trash2, Calendar } from 'lucide-react';
import { type Expense, getAllExpenses, deleteExpense, createExpense } from '../../api/expense.ts';


const ExpensesList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    categoryId: 1,
    userId: 1,
    type: 'ONE_TIME', // enum Prisma
    date: new Date().toISOString().split('T')[0], // yyyy-mm-dd
  });

  // Charger les dépenses depuis l’API
  const fetchExpenses = async () => {
    try {
      const data = await getAllExpenses();
      const normalized = data.map(exp => ({
        ...exp,
        type: (exp.type as any)?.toUpperCase?.() || exp.type,
        amount: typeof exp.amount === 'string' ? parseFloat(exp.amount as any) : exp.amount,
      }));
      setExpenses(normalized);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) return;
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ✅ Création d’une dépense et mise à jour immédiate de la liste
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createExpense(formData); // { message, data }

      const normalized = {
        ...res.data,
        type: (res.data.type as any)?.toUpperCase?.() || res.data.type,
        amount: typeof res.data.amount === 'string' ? parseFloat(res.data.amount as any) : res.data.amount,
      };

      setExpenses(prev => [normalized, ...prev]); // ajout en haut
      setShowForm(false);

      setFormData({
        description: '',
        amount: 0,
        categoryId: 1,
        userId: 1,
        type: 'ONE_TIME',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const categories = ['all', ...Array.from(new Set(expenses.map(e => e.category?.name || '')))];
  const types = ['all', 'ONE_TIME', 'RECURRING'];

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category?.name === selectedCategory;
    const matchesType = selectedType === 'all' || expense.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="space-y-6">
      {/* Header + bouton Ajouter */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Formulaire d’ajout */}
      {showForm && (
        <form onSubmit={handleAddExpense} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Amount (€)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ONE_TIME' | 'RECURRING' })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ONE_TIME">ONE_TIME</option>
              <option value="RECURRING">RECURRING</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Save Expense
          </button>
        </form>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{filteredExpenses.length} Expenses Found</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredExpenses.map(expense => (
            <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{expense.description || 'Untitled Expense'}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    expense.type === 'RECURRING' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {expense.type}
                  </span>
                  {expense.receipt && (
                    <div title="Has receipt">
                      <Receipt className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{expense.date ? new Date(expense.date).toLocaleDateString() : '—'}</span>
                  </div>
                  <span>•</span>
                  <span className="font-medium text-gray-700">{expense.category?.name || 'Sans catégorie'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">-{Number(expense.amount).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesList;
