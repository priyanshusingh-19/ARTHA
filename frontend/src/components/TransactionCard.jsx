// src/components/TransactionCard.jsx
import React from "react";
import { useTheme } from '../context/ThemeContext';

const TransactionCard = ({ title, amount, type, date, id, onDelete, onEdit, category }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm p-4 rounded-b-lg border-b border-l border-r border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full items-center text-gray-800 dark:text-gray-100 text-sm">
        <span className="col-span-1 font-medium">{date}</span>
        <span className="col-span-1 font-medium">{title}</span>
        <span className="hidden md:block col-span-1 text-gray-600 dark:text-gray-400">{category || '-'}</span>
        
        <div className="col-span-1 text-right flex flex-col items-end">
          <p className={`font-bold text-base ${type === "income" ? "text-green-600" : "text-red-600"}`}>
            {type === "income" ? "+" : "-"}₹{Math.abs(amount)}
          </p>
          <div className="flex space-x-2 mt-1">
            <button
              onClick={() => onEdit(id)}
              className="text-blue-500 hover:text-blue-700 text-xs focus:outline-none"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(id)}
              className="text-red-500 hover:text-red-700 text-xs focus:outline-none"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;