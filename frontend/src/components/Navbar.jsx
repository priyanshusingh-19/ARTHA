// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 text-white p-4 shadow-md">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <ul className="flex space-x-6 text-lg font-medium">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/budgets">Budgets</Link></li>
          <li><Link to="/income">Income</Link></li>
          <li><Link to="/goals">Goals</Link></li> {/* NEW: Link to Goals Page */}
          <li><Link to="/ai-summary">AI Summary</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/profile" className="text-gray-300 hover:text-gray-100 hidden md:block">Welcome, {user.username}</Link>
              <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700 text-sm font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-white hover:text-gray-300">Register</Link>
              <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-yellow-300 hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.451 4.549a1 1 0 00-1.416 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM17 10a1 1 0 11-2 0 1 1 0 012 0zm-3.549-4.451a1 1 0 00-1.414-1.416l-.707.707a1 1 0 001.414 1.414l.707-.707zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.451 4.451A1 1 0 004.037 3.037l-.707.707a1 1 0 001.414 1.414l.707-.707zM3 10a1 1 0 11-2 0 1 1 0 012 0zm3.549 3.549a1 1 0 001.416 1.414l-.707.707a1 1 0 00-1.414-1.414l.707-.707z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;