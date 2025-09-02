import React from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingCart, Coffee, Car, Home } from 'lucide-react';

const RecentTransactions: React.FC = () => {
  const transactions = [
    {
      id: '1',
      type: 'expense',
      description: 'Grocery Shopping',
      amount: 85.50,
      category: 'Food',
      date: '2024-01-15',
      icon: ShoppingCart,
    },
    {
      id: '2',
      type: 'income',
      description: 'Salary',
      amount: 4200.00,
      category: 'Job',
      date: '2024-01-15',
      icon: ArrowUpRight,
    },
    {
      id: '3',
      type: 'expense',
      description: 'Coffee Shop',
      amount: 12.75,
      category: 'Food',
      date: '2024-01-14',
      icon: Coffee,
    },
    {
      id: '4',
      type: 'expense',
      description: 'Gas Station',
      amount: 65.00,
      category: 'Transportation',
      date: '2024-01-14',
      icon: Car,
    },
    {
      id: '5',
      type: 'expense',
      description: 'Rent',
      amount: 1200.00,
      category: 'Housing',
      date: '2024-01-13',
      icon: Home,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const Icon = transaction.icon;
          const isIncome = transaction.type === 'income';
          
          return (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${isIncome ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold text-sm ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                {isIncome ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
        View All Transactions
      </button>
    </div>
  );
};

export default RecentTransactions;