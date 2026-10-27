import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        password
      });
      setMessage('Registration successful! Please login.');
      toast.success('Registration successful!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
        {message && <p className="text-center text-sm text-purple-700 font-medium">{message}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Name Input (Only Alphabets allowed) */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              const onlyText = e.target.value.replace(/[0-9]/g, '');
              setName(onlyText);
            }}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />

          {/* Email Input (Only Alphabets for name part before numbers/domain) */}
          <input
            type="email"
            placeholder="Email (e.g. name123@gmail.com)"
            value={email}
            onChange={(e) => {
              // Custom logic to ensure name part before numbers/domain contains letters
              setEmail(e.target.value);
            }}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
            required
          />

          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-sky-500 text-white p-2 rounded-lg font-semibold hover:from-purple-700 hover:to-sky-600 shadow-md transition-all">
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
