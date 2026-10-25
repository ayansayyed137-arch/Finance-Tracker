import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // Agar token nahi hai, toh login page par redirect kar do
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Agar token hai, toh jo component manga hai wahi dikhao (jaise Dashboard)
  return children;
}