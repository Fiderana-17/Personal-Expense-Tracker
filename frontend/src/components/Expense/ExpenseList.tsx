import React, { useState } from 'react';
import { Plus, Search, Filter, Receipt, Edit, Trash2, Calendar } from 'lucide-react';
import { type Expense } from '../../types';

const ExpensesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const expenses: Expense[] = [
    {
      id: '1',
      amount: 85.50,
      date: '2024-01-15',
      categoryId: '1',
      category: { id: '1', name: 'Food & Dining', userId: '1' },
      description: 'Grocery shopping at Whole Foods',
      type: 'one-time',
      userId: '1',
    },
    {
      id: '2',
      amount: 1200.00,
      date: '2024-01-01',
      categoryId: '2',
      category: { id: '2', name: 'Housing', userId: '1' },
      description: 'Monthly rent payment',
      type: 'recurring',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      userId: '1',
    },
    {
      id: '3',
      amount: 65.00,
      date: '2024-01-14',
      categoryId: '3',
      category: { id: '3', name: 'Transportation', userId: '1' },
      description: 'Gas station fill-up',
      type: 'one-time',
      receiptId: 'receipt-123',
      userId: '1',
    },
  ];

  const categories = ['all', 'Food & Dining', 'Housing', 'Transportation', 'Entertainment'];
  const types = ['all', 'one-time', 'recurring'];

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category?.name === selectedCategory;
    const matchesType = selectedType === 'all' || expense.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
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
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredExpenses.length} Expenses Found
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {expense.description || 'Untitled Expense'}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      expense.type === 'recurring' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.type}
                    </span>
                    {expense.receiptId && (
                        <div title="Has receipt">
                            <Receipt className="h-4 w-4 text-green-600"  />
                        </div>
                      
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{expense.date}</span>
                    </div>
                    <span>•</span>
                    <span className="font-medium text-gray-700">{expense.category?.name}</span>
                    {expense.type === 'recurring' && expense.startDate && expense.endDate && (
                      <>
                        <span>•</span>
                        <span>Recurring: {expense.startDate} to {expense.endDate}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      -${expense.amount.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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