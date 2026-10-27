import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Transactions from './pages/Transactions';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [userName, setUserName] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedUser = localStorage.getItem('user');

    if (storedName) {
      setUserName(storedName);
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setUserName(parsedUser.name);
        }
      } catch (err) {
        console.error('Error parsing user', err);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-sky-50 to-blue-100 text-gray-800">
        
        {/* Navbar */}
        <nav className="bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm p-4 flex justify-between items-center px-8 sticky top-0 z-50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">
            Finance Tracker
          </h1>
          <div className="space-x-6 font-medium text-gray-700 flex items-center">
            <Link to="/" className="hover:text-purple-600 transition-colors">Dashboard</Link>
            {token && <Link to="/transactions" className="hover:text-purple-600 transition-colors">Transactions</Link>}
            
            {!token ? (
              <>
                <Link to="/login" className="hover:text-purple-600 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-purple-600 transition-colors">Register</Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* 👤 User Profile Badge */}
                <div className="flex items-center space-x-2 bg-purple-100/80 border border-purple-200 px-3 py-1 rounded-full shadow-inner">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-sky-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {userName || 'User'}
                  </span>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-all shadow-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router>
  );
}
