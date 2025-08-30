// src/pages/IncomePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null); // For editing existing income
  const [newIncomeSource, setNewIncomeSource] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeDate, setNewIncomeDate] = useState(new Date().toISOString().split('T')[0]); // Current date

  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Helper for unauthorized access (token expired/missing)
  const handleUnauthorized = (errorMessage = 'Your session has expired. Please log in again.') => {
    alert(errorMessage);
    logout();
    navigate('/login');
  };

  // Fetch Incomes
  const fetchIncomes = async () => {
    if (!user || !user.token) {
      setIncomes([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/income`, { // Fetch all incomes for simplicity
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
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    }
  };

  // Add/Create Income
  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!newIncomeSource || !newIncomeAmount) {
      alert('Please fill in source and amount.');
      return;
    }
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to add income.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          source: newIncomeSource,
          amount: parseFloat(newIncomeAmount),
          date: newIncomeDate
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert('Income added successfully!');
        setIncomes(prev => [data, ...prev]); // Add new income to top of list
        setNewIncomeSource('');
        setNewIncomeAmount('');
        setNewIncomeDate(new Date().toISOString().split('T')[0]); // Reset date to current
      } else {
        alert(data.message || 'Failed to add income.');
      }
    } catch (error) {
      console.error('Error adding income:', error);
      alert('Network error or server issue. Could not add income.');
    }
  };

  // Edit Income - Open Modal/Form with data
  const startEditIncome = (income) => {
    setEditingIncome(income);
    setNewIncomeSource(income.source);
    setNewIncomeAmount(income.amount.toString());
    setNewIncomeDate(new Date(income.date).toISOString().split('T')[0]);
  };

  // Update Income - API call
  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    if (!newIncomeSource || !newIncomeAmount || !editingIncome) {
        alert('Invalid data for update.');
        return;
    }
    if (!user || !user.token) {
        handleUnauthorized('You must be logged in to update income.');
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/income/${editingIncome._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                source: newIncomeSource,
                amount: parseFloat(newIncomeAmount),
                date: newIncomeDate
            }),
        });
        if (res.status === 401) {
            handleUnauthorized();
            return;
        }
        const data = await res.json();
        if (res.ok) {
            alert('Income updated successfully!');
            setIncomes(prev => prev.map(i => (i._id === data._id ? data : i)));
            setEditingIncome(null); // Close edit form
            setNewIncomeSource('');
            setNewIncomeAmount('');
            setNewIncomeDate(new Date().toISOString().split('T')[0]); // Reset date
        } else {
            alert(data.message || 'Failed to update income.');
        }
    } catch (error) {
        console.error('Error updating income:', error);
        alert('Network error or server issue. Could not update income.');
    }
};


  // Delete Income
  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to delete income.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/income/${id}`, {
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
      alert('Income entry deleted successfully!');
      setIncomes(prev => prev.filter(i => i._id !== id));
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Network error or server issue. Could not delete income.');
    }
  };

  // Fetch incomes on component mount and when user changes
  useEffect(() => {
    fetchIncomes();
  }, [user]);


  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Income</h2>

      {user ? (
        <>
          {/* Add/Edit Income Form */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{editingIncome ? 'Edit Income' : 'Add New Income'}</h3>
            <form onSubmit={editingIncome ? handleUpdateIncome : handleAddIncome} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Source</label>
                <input
                  type="text"
                  value={newIncomeSource}
                  onChange={(e) => setNewIncomeSource(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Salary, Freelance, Gift"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Amount</label>
                <input
                  type="number"
                  value={newIncomeAmount}
                  onChange={(e) => setNewIncomeAmount(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 50000"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  value={newIncomeDate}
                  onChange={(e) => setNewIncomeDate(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {editingIncome && (
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setEditingIncome(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel Edit</button>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {editingIncome ? 'Update Income' : 'Add Income'}
              </button>
            </form>
          </div>

          {/* Income List */}
          <h3 className="text-xl font-semibold mb-4">Your Income Entries</h3>
          {incomes.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {incomes.map(income => (
                <div key={income._id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-semibold text-lg">{income.source}</p>
                    <p className="text-gray-600 dark:text-gray-400">₹{income.amount.toFixed(2)}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{new Date(income.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => startEditIncome(income)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                    <button onClick={() => handleDeleteIncome(income._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No income entries recorded.</p>
          )}
        </>
      ) : (
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-20">
          Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> or <Link to="/register" className="text-blue-600 hover:underline">register</Link> to manage your income.
        </p>
      )}
    </div>
  );
};

export default IncomePage;