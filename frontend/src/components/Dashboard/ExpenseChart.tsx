import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseChartProps {
  data: { month: string; income: number; expenses: number }[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-center">No data for this month</div>;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 animate-slide-up">
      <h3 className="text-2xl font-semibold mb-6 text-gray-900">Income vs Expenses</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#374151' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#374151' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`, 
                name === 'income' ? 'Income' : 'Expenses'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend 
              formatter={(value) => (
                <span className="text-sm text-gray-700">
                  {value === 'income' ? 'Income' : 'Expenses'}
                </span>
              )}
            />
            <Bar 
              dataKey="income" 
              fill="#22c55e" 
              radius={[4, 4, 0, 0]}
              name="income"
            />
            <Bar 
              dataKey="expenses" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
              name="expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;