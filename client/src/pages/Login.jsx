import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. Yeh import add karo
import API from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // <-- 2. Navigate hook initialize karo

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', {
        email,
        password
      });
      setMessage('Login successful!');
      
      // Agar backend token bhej raha hai toh use localStorage mein save kar lo:
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      // 3. Login hote hi 1 second baad Dashboard par bhej do
      setTimeout(() => {
        navigate('/'); // (Ya jo bhi aapka dashboard route ho, jaise '/dashboard')
      }, 1000);

    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    // ... baaki ka form wala code same waisa hi rahega ...
