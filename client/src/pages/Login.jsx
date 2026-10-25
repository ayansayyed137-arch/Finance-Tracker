import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', {
        email,
        password
      });
      setMessage('Login successful!');
      
      // 1. Purana sara localStorage clear karo taaki purana user data na bache
      localStorage.clear();

      // 2. Naya token save karo
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      // 3. Naya user naam save karo (backend se aane wale name ya email ke base par)
      const loggedInName = res.data.name || res.data.user?.name || email.split('@')[0];
      localStorage.setItem('userName', loggedInName);

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
        {message && <p className="text-center text-sm text-purple-700 font-medium">{message}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-sky-500 text-white p-2 rounded-lg font-semibold hover:from-purple-700 hover:to-sky-600 shadow-md transition-all">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
