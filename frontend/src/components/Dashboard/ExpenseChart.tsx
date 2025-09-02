import React from 'react';

const ExpenseChart: React.FC = () => {
  const data = [
    { month: 'Jan', expenses: 3200, income: 4200 },
    { month: 'Feb', expenses: 2800, income: 4200 },
    { month: 'Mar', expenses: 3500, income: 4200 },
    { month: 'Apr', expenses: 4100, income: 4200 },
    { month: 'May', expenses: 3800, income: 4200 },
    { month: 'Jun', expenses: 4150, income: 4200 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.expenses, d.income]));

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Expenses</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.month} className="flex items-center space-x-4">
            <div className="w-10 text-sm font-medium text-gray-600">
              {item.month}
            </div>
            <div className="flex-1 flex space-x-2">
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(item.income / maxValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  ${item.income.toLocaleString()}
                </div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  ${item.expenses.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;