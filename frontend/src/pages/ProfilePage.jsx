// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout, login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // NEW: Define error state
  const [loading, setLoading] = useState(false);

  // Helper for unauthorized access (token expired/missing)
  const handleUnauthorized = (errorMessage = 'Your session has expired. Please log in again.') => {
    alert(errorMessage);
    logout();
    navigate('/login');
  };

  // Fetch user profile on component mount
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    } else {
      handleUnauthorized('User data not found. Please log in.');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setError('');   // NEW: Clear previous errors (now that setError is defined)
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!user || !user.token) {
      handleUnauthorized('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }

    const updatedFields = {};
    if (username !== user.username) updatedFields.username = username;
    if (email !== user.email) updatedFields.email = email;
    if (password) updatedFields.password = password;

    if (Object.keys(updatedFields).length === 0) {
      setMessage('No changes to save.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedFields),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();

      if (res.ok) {
        login(data);
        setMessage('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Profile update failed.'); // Use setError for actual errors
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Network error. Could not update profile.'); // Use setError for actual errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

      {user ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Manage Your Account</h3>
          {message && (
            <p className={`mb-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          {error && ( // NEW: Display error message
            <p className="mb-4 text-center text-red-600">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Change Password (Optional)</h4>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if not changing"
              />
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-20">
          Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to view your profile.
        </p>
      )}
    </div>
  );
};

export default ProfilePage;