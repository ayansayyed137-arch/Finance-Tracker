import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('Food');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

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
        console.error('Error parsing user storage', err);
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
      toast.error('Failed to load transaction data');
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!text || !amount) {
      toast.error('Please fill in all required fields');
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
      
      toast.success('Transaction logged successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Error recording transaction', { id: toastId });
    } finally {
      setLoading(false);
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

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const categoryDataMap = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const chartData = Object.keys(categoryDataMap).map(cat => ({
    name: cat,
    value: categoryDataMap[cat]
  }));

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Developer Header */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-semibold">Live Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Welcome back, {userName || 'User'}
            </h1>
          </div>
          <div className="bg-gray-950 border border-gray-800 px-5 py-3 rounded-xl text-right">
            <p className="text-xs font-mono text-gray-400 uppercase">Net Balance</p>
            <p className="text-2xl font-bold font-mono text-cyan-400">{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl shadow-lg">
            <p className="text-xs font-mono text-gray-400 uppercase">Total Balance</p>
            <h2 className="text-2xl font-bold font-mono text-white mt-1">{formatCurrency(balance)}</h2>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl shadow-lg border-l-4 border-l-cyan-500">
            <p className="text-xs font-mono text-cyan-400 uppercase">Total Income</p>
            <h2 className="text-2xl font-bold font-mono text-cyan-400 mt-1">+{formatCurrency(income)}</h2>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-xs font-mono text-indigo-400 uppercase">Total Expense</p>
            <h2 className="text-2xl font-bold font-mono text-indigo-400 mt-1">-{formatCurrency(expense)}</h2>
          </div>
        </div>

        {/* Analytics Charts */}
        {expenseTransactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-sm font-mono text-gray-400 uppercase mb-4">Expense Distribution</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-sm font-mono text-gray-400 uppercase mb-4">Category Analysis</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Entry Form */}
        <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Transaction</h2>
            <p className="text-xs text-gray-400">Record a new credit or debit transaction</p>
          </div>

          <form onSubmit={addTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Description (Alphabets only)"
                value={text}
                onChange={(e) => {
                  const cleanText = e.target.value.replace(/[0-9]/g, '');
                  setText(cleanText);
                }}
                className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition-all"
                required
              />
              <input
                type="number"
                placeholder="Amount (e.g. 5000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition-all font-mono"
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500 text-white transition-all"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500 text-white transition-all"
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
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-semibold p-3 rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? 'Processing...' : 'Submit Transaction'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
