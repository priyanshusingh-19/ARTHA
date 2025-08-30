// src/components/CategoryPieChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0054', '#8A2BE2', '#32CD32'];

const CategoryPieChart = ({ expenses }) => {
  const { isDarkMode } = useTheme();

  const getCategoryData = () => {
    const categoryData = {};

    expenses.forEach(expense => {
      if (expense.amount < 0) {
        const categoryName = expense.category || 'Uncategorized';
        if (!categoryData[categoryName]) {
          categoryData[categoryName] = 0;
        }
        categoryData[categoryName] += Math.abs(parseFloat(expense.amount));
      }
    });

    return Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name],
    }));
  };

  const data = getCategoryData();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Expenses by Category</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff", borderColor: isDarkMode ? "#555" : "#ccc" }}
                itemStyle={{ color: isDarkMode ? "#fff" : "#000" }}
            />
            <Legend wrapperStyle={{ color: isDarkMode ? "#fff" : "#000" }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No expenses to display in this chart.</p>
      )}
    </div>
  );
};

export default CategoryPieChart;