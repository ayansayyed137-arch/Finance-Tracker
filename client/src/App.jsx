import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword'; // <-- 1. Import ForgotPassword component
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <Router>
      {/* Glassmorphism Toast Configuration */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            color: '#1f2937',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-sky-50 to-blue-100 text-gray-800">
        {/* Glassmorphism Navbar */}
        <nav className="bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm p-4 flex justify-between items-center px-8 sticky top-0 z-50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">Finance Tracker</h1>
          <div className="space-x-6 font-medium text-gray-700 flex items-center">
            <Link to="/" className="hover:text-purple-600 transition-colors">Dashboard</Link>
            {!token ? (
              <>
                <Link to="/login" className="hover:text-purple-600 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-purple-600 transition-colors">Register</Link>
              </>
            ) : (
              <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* <-- 2. Added Forgot Password Route */}
        </Routes>
      </div>
    </Router>
  );
}
