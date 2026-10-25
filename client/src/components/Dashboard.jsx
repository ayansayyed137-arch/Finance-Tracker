import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('Food');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

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
        console.error('Error parsing user from localStorage', err);
      }
    }

    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch transactions');
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!text || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Adding transaction...');

    try {
      await API.post('/transactions', {
        text,
        amount: Number(amount),
        type,
        category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setText('');
      setAmount('');
      setCategory('Food');
      fetchTransactions();
      
      toast.success('Transaction added successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Error adding transaction', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    const toastId = toast.loading('Deleting transaction...');
    try {
      await API.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
      toast.success('Transaction deleted!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete transaction', { id: toastId });
    }
  };

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const balance = income - expense;

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const categoryDataMap = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const chartData = Object.keys(categoryDataMap).map(cat => ({
    name: cat,
    value: categoryDataMap[cat]
  }));

  const COLORS = ['#8b5cf6', '#0ea5e9', '#c084fc', '#38bdf8', '#a855f7'];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesType = filterType === 'All' || t.type === filterType;
    
    let matchesDate = true;
    if (filterDate && t.createdAt) {
      const itemDate = t.createdAt.split('T')[0];
      matchesDate = itemDate === filterDate;
    }

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Welcome Banner (Logout button removed from here) */}
        <div className="bg-gradient-to-r from-purple-600/80 to-sky-500/80 backdrop-blur-md p-6 rounded-2xl shadow-xl text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userName || 'User'}! 👋</h1>
            <p className="text-purple-100 mt-1 text-sm">Here is your financial overview for today.</p>
          </div>
          <div className="hidden md:block bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 text-right">
            <p className="text-xs text-purple-100">Net Balance</p>
            <p className="text-xl font-bold">{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-lg border-l-4 border-purple-500">
            <p className="text-gray-600 font-medium">Total Balance</p>
            <h2 className="text-2xl font-bold text-gray-800">{formatCurrency(balance)}</h2>
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-lg border-l-4 border-sky-500">
            <p className="text-gray-600 font-medium">Total Income</p>
            <h2 className="text-2xl font-bold text-sky-600">+{formatCurrency(income)}</h2>
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-lg border-l-4 border-purple-400">
            <p className="text-gray-600 font-medium">Total Expense</p>
            <h2 className="text-2xl font-bold text-purple-600">-{formatCurrency(expense)}</h2>
          </div>
        </div>

        {/* Analytics Section */}
        {expenseTransactions.length > 0 && (
          <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Expense Breakdown (Analytics)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Add Transaction Form */}
        <form onSubmit={addTransaction} className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Transaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Description (e.g., Salary, Rent)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800 placeholder-gray-500"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800 placeholder-gray-500"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            >
              <option value="Food">Food & Drinks</option>
              <option value="Rent">Rent & Bills</option>
              <option value="Salary">Salary</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-sky-500 text-white p-2 rounded-lg font-semibold hover:from-purple-700 hover:to-sky-600 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Adding Transaction...' : 'Add Transaction'}
          </button>
        </form>

        {/* History & Advanced Filters Section */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
          
          {/* Filters UI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800 placeholder-gray-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food & Drinks</option>
              <option value="Rent">Rent & Bills</option>
              <option value="Salary">Salary</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            >
              <option value="All">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-white/50 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            />
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500 pt-2">No matching transactions found.</p>
          ) : (
            <ul className="space-y-2 pt-2">
              {filteredTransactions.map((t) => (
                <li key={t._id} className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/40 shadow-sm">
                  <div>
                    <span className="font-semibold text-gray-800">{t.text}</span>
                    <span className="ml-3 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {t.category || 'General'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={t.type === 'income' ? 'text-sky-600 font-bold' : 'text-purple-700 font-bold'}>
                      {t.type === 'income' ? `+${formatCurrency(Math.abs(t.amount))}` : `-${formatCurrency(Math.abs(t.amount))}`}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
