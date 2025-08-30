// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth(); // Get user from context

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight">
          {user ? `Welcome, ${user.username}! 🎉` : "Welcome to ARTHA! 💰"}
        </h1>
        <p className="text-xl max-w-md mx-auto opacity-90">
          {user
            ? "Let's track your spending and see what's left in your pockets! 💰" // Updated English message
            : "Track your money, understand your spending, and achieve your financial goals with ease. Smart finance, made simple! ✨"
          }
        </p>
        <div className="flex justify-center gap-4 mt-8">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
            >
              Go to My Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
              >
                Login to Start Tracking
              </Link>
              <Link
                to="/register"
                className="border border-white text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:border-blue-700 transition duration-300"
              >
                New User? Register Now!
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;