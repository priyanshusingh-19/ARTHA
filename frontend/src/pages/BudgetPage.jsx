// src/pages/BudgetPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null); // For editing existing budgets
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetMonth, setNewBudgetMonth] = useState(new Date().getMonth() + 1); // Current month
  const [newBudgetYear, setNewBudgetYear] = useState(new Date().getFullYear()); // Current year

  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Helper for unauthorized access (token expired/missing)
  const handleUnauthorized = (errorMessage = 'Your session has expired. Please log in again.') => {
    alert(errorMessage);
    logout();
    navigate('/login');
  };

  // Fetch Budgets
  const fetchBudgets = async () => {
    if (!user || !user.token) {
      setBudgets([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/budgets?month=${newBudgetMonth}&year=${newBudgetYear}`, { // Fetch for specific month/year
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    }
  };

  // Add/Create Budget
  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetAmount) {
      alert('Please fill in category and amount.');
      return;
    }
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to add a budget.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          category: newBudgetCategory,
          amount: parseFloat(newBudgetAmount),
          month: parseInt(newBudgetMonth),
          year: parseInt(newBudgetYear)
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert('Budget added successfully!');
        setBudgets(prev => [...prev, data]);
        setNewBudgetCategory('');
        setNewBudgetAmount('');
        // Re-fetch to ensure data consistency, especially with unique index
        fetchBudgets();
      } else {
        alert(data.message || 'Failed to add budget.');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Network error or server issue. Could not add budget.');
    }
  };

  // Edit Budget - Open Modal/Form with data
  const startEditBudget = (budget) => {
    setEditingBudget(budget);
    setNewBudgetCategory(budget.category);
    setNewBudgetAmount(budget.amount.toString());
    setNewBudgetMonth(budget.month);
    setNewBudgetYear(budget.year);
  };

  // Update Budget - API call
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetAmount || !editingBudget) {
        alert('Invalid data for update.');
        return;
    }
    if (!user || !user.token) {
        handleUnauthorized('You must be logged in to update a budget.');
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/budgets/${editingBudget._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                category: newBudgetCategory,
                amount: parseFloat(newBudgetAmount),
                month: parseInt(newBudgetMonth),
                year: parseInt(newBudgetYear)
            }),
        });
        if (res.status === 401) {
            handleUnauthorized();
            return;
        }
        const data = await res.json();
        if (res.ok) {
            alert('Budget updated successfully!');
            setBudgets(prev => prev.map(b => (b._id === data._id ? data : b)));
            setEditingBudget(null); // Close edit form
            setNewBudgetCategory('');
            setNewBudgetAmount('');
            // Re-fetch to ensure consistency after update, especially if unique fields changed
            fetchBudgets();
        } else {
            alert(data.message || 'Failed to update budget.');
        }
    } catch (error) {
        console.error('Error updating budget:', error);
        alert('Network error or server issue. Could not update budget.');
    }
};


  // Delete Budget
  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to delete a budget.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      alert('Budget deleted successfully!');
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Network error or server issue. Could not delete budget.');
    }
  };

  // Fetch budgets on component mount and when month/year filters change or user changes
  useEffect(() => {
    fetchBudgets();
  }, [newBudgetMonth, newBudgetYear, user]); // Depend on filters and user

  const months = Array.from({ length: 12 }, (e, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
  const years = Array.from({ length: 5 }, (e, i) => new Date().getFullYear() - 2 + i); // Current year +/- 2


  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Budgets</h2>

      {user ? (
        <>
          {/* Filter by Month/Year */}
          <div className="flex justify-center gap-4 mb-6">
            <select
              value={newBudgetMonth}
              onChange={(e) => setNewBudgetMonth(parseInt(e.target.value))}
              className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              {months.map((monthName, index) => (
                <option key={index} value={index + 1}>{monthName}</option>
              ))}
            </select>
            <select
              value={newBudgetYear}
              onChange={(e) => setNewBudgetYear(parseInt(e.target.value))}
              className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Add/Edit Budget Form */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{editingBudget ? 'Edit Budget' : 'Add New Budget'}</h3>
            <form onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Category</label>
                <input
                  type="text"
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Amount</label>
                <input
                  type="number"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {editingBudget && (
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setEditingBudget(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel Edit</button>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {editingBudget ? 'Update Budget' : 'Add Budget'}
              </button>
            </form>
          </div>

          {/* Budget List */}
          <h3 className="text-xl font-semibold mb-4">Your Budgets ({months[newBudgetMonth - 1]} {newBudgetYear})</h3>
          {budgets.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {budgets.map(budget => (
                <div key={budget._id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-semibold text-lg">{budget.category}</p>
                    <p className="text-gray-600 dark:text-gray-400">₹{budget.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => startEditBudget(budget)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                    <button onClick={() => handleDeleteBudget(budget._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No budgets set for this period.</p>
          )}
        </>
      ) : (
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-20">
          Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> or <Link to="/register" className="text-blue-600 hover:underline">register</Link> to manage your budgets.
        </p>
      )}
    </div>
  );
};

export default BudgetPage;