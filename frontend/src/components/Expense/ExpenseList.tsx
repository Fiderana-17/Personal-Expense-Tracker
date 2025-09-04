import React, { useEffect, useState } from 'react';
import { Plus, Search, Receipt, Edit, Trash2, Calendar } from 'lucide-react';
import { type Expense, deleteExpense, createExpense, updateExpense, getExpenses } from '../../api/expense.ts';
import { getAllCategories, type Category } from '../../api/category.ts';
import { useAuth } from '@/hooks/useAuth.ts';

const ExpensesList: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    categoryId: 1,
    userId: user?.id || '',
    type: 'ONE_TIME',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const data = await getExpenses(Number(user.id));
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

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) return;
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erreur lors de la suppression de la dépense:", err.message);
      } else {
        throw Error ("Erreur inconnue lors de la suppression de la dépense");
      }

    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingExpense) {
        const updated = await updateExpense(editingExpense.id, { ...formData, userId: Number(user.id) });
        const expense = (typeof updated === 'object' && 'data' in updated) ? updated.data : updated;

        setExpenses(prev =>
          prev.map(e => (e.id === editingExpense.id && typeof expense === 'object' ? { ...e, ...expense } : e))
        );

        alert((typeof updated === 'object' && 'message' in updated ? updated.message : "Dépense mise à jour avec succès"));
      } else {
        const res = await createExpense({ ...formData, userId: Number(user.id) });
        const expense = {
          ...res.data,
          type: (res.data.type as any)?.toUpperCase?.() || res.data.type,
          amount: typeof res.data.amount === "string" ? parseFloat(res.data.amount as any) : res.data.amount,
        };
        setExpenses(prev => [expense, ...prev]);
        alert(res.message || "Dépense créée avec succès");
      }

      setShowForm(false);
      setEditingExpense(null);
      setFormData({
        description: "",
        amount: 0,
        categoryId: categories.length > 0 ? categories[0].id : 1,
        userId: user.id,
        type: "ONE_TIME",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description ?? '',
      amount: Number(expense.amount),
      categoryId: expense.categoryId,
      userId: expense.userId.toString(),
      type: expense.type,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: 0,
      categoryId: categories.length > 0 ? categories[0].id : 1,
      userId: user?.id || '',
      type: 'ONE_TIME',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const filterCategories = ['all', ...categories.map(c => c.name)];
  const types = ['all', 'ONE_TIME', 'RECURRING'];

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find(c => c.id === expense.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || categories.find(c => c.id === expense.categoryId)?.name === selectedCategory;
    const matchesType = selectedType === 'all' || expense.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="space-y-6">
      {/* Header + Add */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-lg font-semibold">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
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
            <label className="block text-sm font-medium">Amount ($)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            {editingExpense ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {filterCategories.map(category => (
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
        </div>
      </div>

      {/* Liste des dépenses */}
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
                  {expense.receipt && <Receipt className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{expense.date ? new Date(expense.date).toLocaleDateString() : '—'}</span>
                  </div>
                  <span>•</span>
                  <span className="font-medium text-gray-700">
                    {categories.find(c => c.id === expense.categoryId)?.name || 'Sans catégorie'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">-${Number(expense.amount).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
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
