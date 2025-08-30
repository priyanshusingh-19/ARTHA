// src/pages/About.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Still needed for dark mode context

function About() {
  const { isDarkMode } = useTheme();

  return (
    <div className="max-w-xl mx-auto p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">About ARTHA</h2>
        <p className="text-md leading-relaxed mb-4">
          ARTHA is your personal finance companion, designed to help you effortlessly manage your expenses, track your income, and stay on top of your budgets.
        </p>
        <p className="text-md leading-relaxed mb-4">
          Our goal is to provide a clear and insightful overview of your financial health, empowering you to make smarter spending and saving decisions.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-200">Key Features:</h3>
        <ul className="list-disc list-inside space-y-2 mb-6 text-md pl-4">
          <li>Track Expenses & Income</li>
          <li>Set & Manage Budgets</li>
          <li>AI-powered Financial Summaries</li>
          <li>Smart Category Suggestions</li>
          <li>Interactive Charts & Visualizations</li>
          <li>Data Export to CSV</li>
          <li>Dark/Light Theme Toggle</li>
          <li>Secure User Profiles</li>
        </ul>
        <p className="text-md leading-relaxed text-center font-semibold text-gray-700 dark:text-gray-200">
          Simplify your financial life with ARTHA.
        </p>
      </div>
    </div>
  );
}

export default About;