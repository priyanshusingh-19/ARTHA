// src/pages/AISummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const AISummaryPage = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year

  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Helper for unauthorized access (token expired/missing)
  const handleUnauthorized = (errorMessage = 'Your session has expired. Please log in again.') => {
    alert(errorMessage);
    logout();
    navigate('/login');
  };

  // Function to fetch AI Summary
  const fetchAISummary = async () => {
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to get AI summary.');
      return;
    }
    setLoading(true);
    setSummary('');
    setError('');

    try {
      const res = await fetch(`http://localhost:5000/api/ai/summary?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setSummary(data.summary);

    } catch (err) {
      console.error('Error fetching AI summary:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (e, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
  const years = Array.from({ length: 5 }, (e, i) => new Date().getFullYear() - 2 + i); // Current year +/- 2

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">AI Financial Summary</h2>

      {user ? (
        <>
          {/* Month/Year Selector and Generate Button */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="p-2 border rounded w-full md:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              {months.map((monthName, index) => (
                <option key={index} value={index + 1}>{monthName}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-2 border rounded w-full md:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={fetchAISummary}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              disabled={loading} // Disable button when loading
            >
              {loading ? 'Generating...' : 'Get Summary'}
            </button>
          </div>

          {/* Summary Display Area */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your AI Insights:</h3>
            {loading && (
              <p className="text-center text-blue-500">
                <span className="animate-spin inline-block h-5 w-5 rounded-full border-b-2 border-blue-500"></span> Generating your financial summary...
              </p>
            )}
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}
            {summary ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
            ) : (
              !loading && !error && <p className="text-gray-500 dark:text-gray-400 text-center">Select a month/year and click 'Get Summary' to see your AI financial insights.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-20">
          Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> or <Link to="/register" className="text-blue-600 hover:underline">register</Link> to view your AI financial summary.
        </p>
      )}
    </div>
  );
};

export default AISummaryPage;