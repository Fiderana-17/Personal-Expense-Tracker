import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, PieChart } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Custom Range</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">$4,150.00</p>
          <p className="text-sm text-gray-500 mt-1">+8.1% from last month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">$8,400.00</p>
          <p className="text-sm text-gray-500 mt-1">+5.2% from last month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Net Balance</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">$4,250.00</p>
          <p className="text-sm text-gray-500 mt-1">+12.5% from last month</p>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown by Category</h3>
        
        <div className="space-y-4">
          {[
            { category: 'Housing', amount: 1200, percentage: 29, color: 'bg-blue-500' },
            { category: 'Food & Dining', amount: 850, percentage: 20, color: 'bg-green-500' },
            { category: 'Transportation', amount: 650, percentage: 16, color: 'bg-yellow-500' },
            { category: 'Entertainment', amount: 450, percentage: 11, color: 'bg-purple-500' },
            { category: 'Shopping', amount: 380, percentage: 9, color: 'bg-pink-500' },
            { category: 'Utilities', amount: 320, percentage: 8, color: 'bg-indigo-500' },
            { category: 'Healthcare', amount: 200, percentage: 5, color: 'bg-red-500' },
            { category: 'Other', amount: 100, percentage: 2, color: 'bg-gray-500' },
          ].map((item) => (
            <div key={item.category} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700">
                {item.category}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                <div 
                  className={`${item.color} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-900">
                {item.percentage}%
              </div>
              <div className="w-20 text-right text-sm font-semibold text-gray-900">
                ${item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trend</h3>
        
        <div className="space-y-4">
          {[
            { month: 'January', income: 8400, expenses: 4150, savings: 4250 },
            { month: 'February', income: 8200, expenses: 3800, savings: 4400 },
            { month: 'March', income: 8600, expenses: 4300, savings: 4300 },
            { month: 'April', income: 8400, expenses: 4100, savings: 4300 },
            { month: 'May', income: 8500, expenses: 3900, savings: 4600 },
            { month: 'June', income: 8400, expenses: 4150, savings: 4250 },
          ].map((month) => (
            <div key={month.month} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0">
              <div className="font-medium text-gray-900">{month.month}</div>
              <div className="text-green-600 font-semibold">${month.income.toLocaleString()}</div>
              <div className="text-red-600 font-semibold">${month.expenses.toLocaleString()}</div>
              <div className="text-blue-600 font-semibold">${month.savings.toLocaleString()}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-4 py-3 bg-gray-50 rounded-lg mt-4 px-4">
          <div className="font-semibold text-gray-700">Month</div>
          <div className="font-semibold text-green-600">Income</div>
          <div className="font-semibold text-red-600">Expenses</div>
          <div className="font-semibold text-blue-600">Savings</div>
        </div>
      </div>
    </div>
  );
};

export default Reports;