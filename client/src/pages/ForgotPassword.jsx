import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating password...');

    try {
      const res = await API.post('/auth/forgot-password', {
        email,
        newPassword
      });
      
      toast.success(res.data.message || 'Password reset successfully!', { id: toastId });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to reset password', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Registered Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-sky-500 text-white p-2 rounded-lg font-semibold hover:from-purple-700 hover:to-sky-600 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
