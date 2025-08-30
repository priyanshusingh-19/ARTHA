// src/components/MonthlyBarChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const MonthlyBarChart = ({ expenses }) => {
  const { isDarkMode } = useTheme();

  const getMonthlyData = () => {
    const monthlyData = {};

    expenses.forEach(expense => {
      if (expense.amount < 0) {
        const date = new Date(expense.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { name: monthYear, expenses: 0 };
        }
        monthlyData[monthYear].expenses += Math.abs(parseFloat(expense.amount));
      }
    });

    const sortedData = Object.values(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.name.split('-');
      const [monthB, yearB] = b.name.split('-');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA - dateB;
    });

    return sortedData;
  };

  const data = getMonthlyData();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Monthly Expenses</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#444" : "#ccc"} />
            <XAxis dataKey="name" stroke={isDarkMode ? "#ddd" : "#888"} tick={{ fill: isDarkMode ? "#ddd" : "#888" }} />
            <YAxis stroke={isDarkMode ? "#ddd" : "#888"} tick={{ fill: isDarkMode ? "#ddd" : "#888" }} />
            <Tooltip
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff", borderColor: isDarkMode ? "#555" : "#ccc" }}
                itemStyle={{ color: isDarkMode ? "#fff" : "#000" }}
            />
            <Legend wrapperStyle={{ color: isDarkMode ? "#fff" : "#000" }} />
            <Bar dataKey="expenses" fill={isDarkMode ? "#93C5FD" : "#8884d8"} name="Total Expenses" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No expenses to display in chart.</p>
      )}
    </div>
  );
};

export default MonthlyBarChart;