// src/components/AddExpense.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AddExpense = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [userTypedCategory, setUserTypedCategory] = useState(false);
  const [autoSuggestedCategory, setAutoSuggestedCategory] = useState('');
  const initialLoadRef = useRef(true);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const suggestCategory = (expenseTitle) => {
    const lowerCaseTitle = expenseTitle.toLowerCase();
    if (lowerCaseTitle.includes('coffee') || lowerCaseTitle.includes('restaurant') || lowerCaseTitle.includes('cafe') || lowerCaseTitle.includes('food') || lowerCaseTitle.includes('dine') || lowerCaseTitle.includes('samosa') || lowerCaseTitle.includes('pizza') || lowerCaseTitle.includes('burger') || lowerCaseTitle.includes('sandwich') || lowerCaseTitle.includes('tea') || lowerCaseTitle.includes('breakfast') || lowerCaseTitle.includes('lunch') || lowerCaseTitle.includes('dinner') || lowerCaseTitle.includes('groceries')) {
      return 'Food & Dining';
    }
    if (lowerCaseTitle.includes('uber') || lowerCaseTitle.includes('ola') || lowerCaseTitle.includes('bus') || lowerCaseTitle.includes('train') || lowerCaseTitle.includes('petrol') || lowerCaseTitle.includes('fuel') || lowerCaseTitle.includes('auto') || lowerCaseTitle.includes('cab')) {
      return 'Transportation';
    }
    if (lowerCaseTitle.includes('electricity') || lowerCaseTitle.includes('rent') || lowerCaseTitle.includes('wifi') || lowerCaseTitle.includes('bill') || lowerCaseTitle.includes('internet') || lowerCaseTitle.includes('water')) {
      return 'Bills & Utilities';
    }
    if (lowerCaseTitle.includes('shopping') || lowerCaseTitle.includes('clothes') || lowerCaseTitle.includes('shoes') || lowerCaseTitle.includes('mall') || lowerCaseTitle.includes('store')) {
      return 'Shopping';
    }
    if (lowerCaseTitle.includes('salary') || lowerCaseTitle.includes('freelance') || lowerCaseTitle.includes('income') || lowerCaseTitle.includes('payout')) {
      return 'Income';
    }
    if (lowerCaseTitle.includes('loan') || lowerCaseTitle.includes('emi') || lowerCaseTitle.includes('debt') || lowerCaseTitle.includes('credit card')) {
      return 'Debt Payment';
    }
    if (lowerCaseTitle.includes('movie') || lowerCaseTitle.includes('cinema') || lowerCaseTitle.includes('party') || lowerCaseTitle.includes('concert')) {
        return 'Entertainment';
    }
    if (lowerCaseTitle.includes('doctor') || lowerCaseTitle.includes('pharmacy') || lowerCaseTitle.includes('medicine') || lowerCaseTitle.includes('hospital')) {
        return 'Health';
    }
    return '';
  };

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const storedCorrections = JSON.parse(localStorage.getItem('categoryCorrections') || '{}');
    const userSpecificCorrections = storedCorrections[user?.email] || {};

    if (title) {
      if (userSpecificCorrections[title.toLowerCase()]) {
        setCategory(userSpecificCorrections[title.toLowerCase()]);
        setAutoSuggestedCategory(userSpecificCorrections[title.toLowerCase()]);
        setUserTypedCategory(false);
        return;
      }

      if (!userTypedCategory) {
        const suggested = suggestCategory(title);
        if (suggested) {
          setCategory(suggested);
          setAutoSuggestedCategory(suggested);
        } else {
          setCategory('');
          setAutoSuggestedCategory('');
        }
      }
    } else {
      setCategory('');
      setAutoSuggestedCategory('');
      setUserTypedCategory(false);
    }
  }, [title, userTypedCategory, user?.email]);


  useEffect(() => {
    if (title && category && userTypedCategory && autoSuggestedCategory && category !== autoSuggestedCategory) {
        const storedCorrections = JSON.parse(localStorage.getItem('categoryCorrections') || '{}');
        const userEmail = user?.email;

        if (userEmail) {
            storedCorrections[userEmail] = storedCorrections[userEmail] || {};
            storedCorrections[userEmail][title.toLowerCase()] = category;
            localStorage.setItem('categoryCorrections', JSON.stringify(storedCorrections));
            console.log(`Saved correction: "${title}" to "${category}" for ${userEmail}`);
        }
    }
  }, [category, autoSuggestedCategory, title, userTypedCategory, user?.email]);


  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setUserTypedCategory(true);
    if (e.target.value === '') {
        setUserTypedCategory(false);
        setAutoSuggestedCategory('');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.token) {
      alert('You must be logged in to add an expense.');
      return;
    }

    const newExpense = {
      title,
      amount: parseFloat(amount),
      category: category || 'Miscellaneous',
      date: date || new Date().toISOString().split('T')[0],
    };

    try {
      const res = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(newExpense),
      });

      const data = await res.json();

      if (res.ok) {
        onAdd(data);
        setTitle("");
        setAmount("");
        setCategory("");
        setDate("");
        setUserTypedCategory(false);
        setAutoSuggestedCategory('');
      } else {
        alert(data.message || "Error adding expense.");
      }
    } catch (error) {
      console.error("Network error while adding expense:", error);
      alert("Network error. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Add New Expense</h3>
      <input
        type="text"
        placeholder="Title (e.g., Coffee, Petrol, Rent)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        required
      />
      <input
        type="number"
        placeholder="Amount (e.g., -50 for expense, 100 for income)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="block w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        required
      />
      <input
        type="text"
        placeholder="Category (Auto-suggested / Learned)"
        value={category}
        onChange={handleCategoryChange}
        className="block w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="block w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Expense
      </button>
    </form>
  );
};

export default AddExpense;