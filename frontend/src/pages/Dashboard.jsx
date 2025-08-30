// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import AddExpense from "../components/AddExpense";
import TransactionCard from "../components/TransactionCard";
import MonthlyBarChart from "../components/MonthlyBarChart";
import CategoryPieChart from "../components/CategoryPieChart";
import EditExpenseModal from "../components/EditExpenseModal";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom'; // NEW: Import useNavigate

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingExpense, setEditingExpense] = useState(null);
  const { user, logout } = useAuth(); // NEW: Get logout from context
  const { isDarkMode } = useTheme();
  const navigate = useNavigate(); // NEW: Initialize useNavigate

  // Helper function for 401 handling
  const handleUnauthorized = (errorMessage = 'Your session has expired. Please log in again.') => {
    alert(errorMessage);
    logout();
    navigate('/login');
  };

  const fetchExpenses = async () => {
    if (!user || !user.token) {
      setExpenses([]);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/expenses", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (res.status === 401) { // NEW: Handle Unauthorized
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
    }
  };

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    fetchExpenses();
  };

  const handleDeleteExpense = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmed) return;

    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to delete an expense.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (res.status === 401) { // NEW: Handle Unauthorized
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to delete expense: ${res.status}`);
      }

      setExpenses(prevExpenses => prevExpenses.filter(expense => expense._id !== id));
      console.log(`Expense with ID ${id} deleted successfully.`);

    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Could not delete expense. Please try again.");
    }
  };

  const handleEditExpense = (id) => {
    const expenseToEdit = expenses.find(exp => exp._id === id);
    if (expenseToEdit) {
      setEditingExpense(expenseToEdit);
    }
  };

  const handleUpdateExpense = async (updatedExpense) => {
    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to update an expense.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${updatedExpense._id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedExpense),
      });

      if (res.status === 401) { // NEW: Handle Unauthorized
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to update expense: ${res.status}`);
      }

      const data = await res.json();

      setExpenses(prevExpenses =>
        prevExpenses.map(exp => (exp._id === data._id ? data : exp))
      );
      setEditingExpense(null);
      console.log(`Expense with ID ${data._id} updated successfully.`);

    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Could not update expense. Please try again.");
    }
  };

  const handleExportCsv = () => {
    if (filteredAndSortedExpenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const headers = ["Date", "Title", "Amount", "Category", "User"];
    const rows = filteredAndSortedExpenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.title.replace(/"/g, '""'),
      expense.amount.toFixed(2),
      (expense.category || "N/A").replace(/"/g, '""'),
      user ? user.username.replace(/"/g, '""') : "N/A"
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `artha_expenses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("Your browser does not support downloading files directly.");
    }
  };


  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const totalIncome = expenses
    .filter((expense) => expense.amount > 0)
    .reduce((acc, expense) => acc + parseFloat(expense.amount), 0);

  const totalExpense = expenses
    .filter((expense) => expense.amount <= 0)
    .reduce((acc, expense) => acc + parseFloat(expense.amount), 0);

  const balance = totalIncome + totalExpense;

  const filteredAndSortedExpenses = expenses
    .filter((expense) => {
      const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || (expense.category && expense.category.toLowerCase() === filterCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "amount") {
        return b.amount - a.amount;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.date) - new Date(a.date);
      }
    });

  const uniqueCategories = ["All", ...new Set(expenses.map(expense => expense.category).filter(Boolean))];

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">ARTHA Dashboard</h2>

      {user ? (
        <>
          <AddExpense onAdd={handleAddExpense} />

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Financial Overview</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-medium text-green-600">Income</p>
                <p className="text-xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-lg font-medium text-red-600">Expenses</p>
                <p className="text-xl font-bold text-red-600">₹{Math.abs(totalExpense).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-lg font-medium text-blue-600">Balance</p>
                <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8 mt-8">
            <div className="w-full md:w-1/2">
              <MonthlyBarChart expenses={expenses} />
            </div>
            <div className="w-full md:w-1/2">
              <CategoryPieChart expenses={expenses} />
            </div>
          </div>


          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            Expense List
            <button
              onClick={handleExportCsv}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Export CSV
            </button>
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded w-full md:w-1/4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="title">Sort by Title</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border rounded w-full md:w-1/4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {filteredAndSortedExpenses.length > 0 && (
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-t-lg font-semibold text-gray-700 dark:text-gray-200 grid grid-cols-3 md:grid-cols-4 gap-4 text-sm uppercase">
              <span className="col-span-1 md:col-span-1">Date</span>
              <span className="col-span-1 md:col-span-1">Title</span>
              <span className="hidden md:block col-span-1">Category</span>
              <span className="col-span-1 text-right">Amount</span>
              <span className="hidden">Actions</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedExpenses.length > 0 ? (
              filteredAndSortedExpenses.map((expense) => (
                <TransactionCard
                  key={expense._id}
                  id={expense._id}
                  title={expense.title}
                  amount={expense.amount}
                  type={expense.amount < 0 ? "expense" : "income"}
                  date={new Date(expense.date).toLocaleDateString()}
                  onDelete={handleDeleteExpense}
                  onEdit={handleEditExpense}
                  category={expense.category}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center col-span-full mt-4">
                {expenses.length > 0 ? "No expenses match your current filters." : "No expenses found. Add some above!"}
              </p>
            )}
          </div>

          {editingExpense && (
            <EditExpenseModal
              expense={editingExpense}
              onClose={() => setEditingExpense(null)}
              onSave={handleUpdateExpense}
            />
          )}
        </>
      ) : (
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-20">
          Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> or <Link to="/register" className="text-blue-600 hover:underline">register</Link> to view your expenses.
        </p>
      )}
    </div>
  );
};

export default Dashboard;