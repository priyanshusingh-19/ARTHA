// src/pages/GoalsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null); // For editing existing goals
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTargetAmount, setNewGoalTargetAmount] = useState('');
  const [newGoalCurrentAmount, setNewGoalCurrentAmount] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');

  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Helper for unauthorized access (token expired/missing)
  const handleUnauthorized = (errorMessage = 'Your session has expired. Please log in again.') => {
    alert(errorMessage);
    logout();
    navigate('/login');
  };

  // Fetch Goals
  const fetchGoals = async () => {
    if (!user || !user.token) {
      setGoals([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/goals`, {
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
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    }
  };

  // Add/Create Goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTargetAmount) {
      alert('Please fill in goal name and target amount.');
      return;
    }
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to add a goal.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: newGoalName,
          targetAmount: parseFloat(newGoalTargetAmount),
          currentAmount: parseFloat(newGoalCurrentAmount) || 0,
          targetDate: newGoalTargetDate || null
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert('Goal added successfully!');
        setGoals(prev => [data, ...prev]);
        setNewGoalName('');
        setNewGoalTargetAmount('');
        setNewGoalCurrentAmount('');
        setNewGoalTargetDate('');
      } else {
        alert(data.message || 'Failed to add goal.');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Network error or server issue. Could not add goal.');
    }
  };

  // Edit Goal - Open Modal/Form with data
  const startEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalTargetAmount(goal.targetAmount.toString());
    setNewGoalCurrentAmount(goal.currentAmount.toString());
    setNewGoalTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '');
  };

  // Update Goal - API call
  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTargetAmount || !editingGoal) {
        alert('Invalid data for update.');
        return;
    }
    if (!user || !user.token) {
        handleUnauthorized('You must be logged in to update a goal.');
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/goals/${editingGoal._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                name: newGoalName,
                targetAmount: parseFloat(newGoalTargetAmount),
                currentAmount: parseFloat(newGoalCurrentAmount) || 0,
                targetDate: newGoalTargetDate || null
            }),
        });
        if (res.status === 401) {
            handleUnauthorized();
            return;
        }
        const data = await res.json();
        if (res.ok) {
            alert('Goal updated successfully!');
            setGoals(prev => prev.map(g => (g._id === data._id ? data : g)));
            setEditingGoal(null); // Close edit form
            setNewGoalName('');
            setNewGoalTargetAmount('');
            setNewGoalCurrentAmount('');
            setNewGoalTargetDate('');
        } else {
            alert(data.message || 'Failed to update goal.');
        }
    } catch (error) {
        console.error('Error updating goal:', error);
        alert('Network error or server issue. Could not update goal.');
    }
};

  // Add Funds to a Goal
  const handleAddFunds = async (goalId) => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
        alert('Please enter a valid amount to add.');
        return;
    }
    if (!user || !user.token) {
        handleUnauthorized('You must be logged in to add funds.');
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/goals/add-funds/${goalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ amount: parseFloat(addFundsAmount) }),
        });
        if (res.status === 401) {
            handleUnauthorized();
            return;
        }
        const data = await res.json();
        if (res.ok) {
            alert('Funds added successfully!');
            setGoals(prev => prev.map(g => (g._id === data._id ? data : g)));
            setAddFundsAmount('');
        } else {
            alert(data.message || 'Failed to add funds.');
        }
    } catch (error) {
        console.error('Error adding funds:', error);
        alert('Network error or server issue. Could not add funds.');
    }
  };


  // Delete Goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to delete a goal.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
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
      alert('Goal deleted successfully!');
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Network error or server issue. Could not delete goal.');
    }
  };

  // Fetch goals on component mount and when user changes
  useEffect(() => {
    fetchGoals();
  }, [user]);

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Financial Goals</h2>

      {user ? (
        <>
          {/* Add/Edit Goal Form */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{editingGoal ? 'Edit Goal' : 'Set a New Goal'}</h3>
            <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Trip to Goa"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Target Amount</label>
                <input
                  type="number"
                  value={newGoalTargetAmount}
                  onChange={(e) => setNewGoalTargetAmount(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 50000"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Current Amount (Optional)</label>
                <input
                  type="number"
                  value={newGoalCurrentAmount}
                  onChange={(e) => setNewGoalCurrentAmount(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Amount already saved"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Target Date (Optional)</label>
                <input
                  type="date"
                  value={newGoalTargetDate}
                  onChange={(e) => setNewGoalTargetDate(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              {editingGoal && (
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setEditingGoal(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel Edit</button>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {editingGoal ? 'Update Goal' : 'Set Goal'}
              </button>
            </form>
          </div>

          {/* Goals List */}
          <h3 className="text-xl font-semibold mb-4">Your Financial Goals</h3>
          {goals.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {goals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isCompleted = goal.isCompleted;

                return (
                    <div key={goal._id} className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-lg">{goal.name}</p>
                            {isCompleted ? (
                                <span className="text-green-600 dark:text-green-400 font-bold">Goal Achieved!</span>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}</p>
                            )}
                        </div>
                        {!isCompleted && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Progress: {progress.toFixed(0)}%</p>
                            {goal.targetDate && <p>Due: {new Date(goal.targetDate).toLocaleDateString()}</p>}
                        </div>

                        <div className="flex justify-between items-center space-x-2 mt-4">
                            <div className="flex flex-1 space-x-2">
                                <input
                                    type="number"
                                    value={addFundsAmount}
                                    onChange={(e) => setAddFundsAmount(e.target.value)}
                                    className="shadow appearance-none border rounded w-2/3 py-1 px-2 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline text-sm"
                                    placeholder="Add funds..."
                                />
                                <button onClick={() => handleAddFunds(goal._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Add</button>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => startEditGoal(goal)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                                <button onClick={() => handleDeleteGoal(goal._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No goals set yet. Start a new one!</p>
          )}
        </>
      ) : (
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-20">
          Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> or <Link to="/register" className="text-blue-600 hover:underline">register</Link> to manage your goals.
        </p>
      )}
    </div>
  );
};

export default GoalsPage;