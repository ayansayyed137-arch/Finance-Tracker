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
      toast.error('Unable to sync transaction data');
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!text || !amount) {
      toast.error('All input fields are required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Processing entry...');

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
      
      toast.success('Record added successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save record', { id: toastId });
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

  const BRAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header / Banner */}
        <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Account Overview</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1">
              Welcome, {userName || 'User'}
            </h1>
          </div>
          
          <div className="bg-slate-800/80 border border-slate-700/60 px-5 py-3 rounded-lg text-right w-full md:w-auto">
            <p className="text-xs font-mono text-slate-400 uppercase">Available Capital</p>
            <p className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-slate-300 transition-all">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Net Balance</p>
            <h2 className="text-2xl font-bold font-mono text-slate-900 mt-2">{formatCurrency(balance)}</h2>
            <p className="text-xs text-slate-400 mt-1">Calculated from total ledger</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm border-l-4 border-l-emerald-500 hover:border-slate-300 transition-all">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider font-mono">Total Inflow</p>
            <h2 className="text-2xl font-bold font-mono text-emerald-600 mt-2">+{formatCurrency(income)}</h2>
            <p className="text-xs text-slate-400 mt-1">Income & credits</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm border-l-4 border-l-rose-500 hover:border-slate-300 transition-all">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider font-mono">Total Outflow</p>
            <h2 className="text-2xl font-bold font-mono text-rose-600 mt-2">-{formatCurrency(expense)}</h2>
            <p className="text-xs text-slate-400 mt-1">Expenses & debits</p>
          </div>
        </div>

        {/* Chart Section */}
        {expenseTransactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-mono">
                  Category Distribution
                </h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-mono">
                  Expense Comparison
                </h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Add Entry Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-base font-semibold text-slate-800">Create Transaction Record</h2>
            <p className="text-xs text-slate-500">Log incoming capital or expenses into the system</p>
          </div>

          <form onSubmit={addTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Description field: Alphabet validation */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Salary, Equipment"
                  value={text}
                  onChange={(e) => {
                    const cleanText = e.target.value.replace(/[0-9]/g, '');
                    setText(cleanText);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
                  required
                />
              </div>

              {/* Amount field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all font-mono"
                  required
                />
              </div>

              {/* Type field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
                >
                  <option value="income">Income (+)</option>
                  <option value="expense">Expense (-)</option>
                </select>
              </div>

              {/* Category field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
                >
                  <option value="Food">Food & Utilities</option>
                  <option value="Rent">Housing & Bills</option>
                  <option value="Salary">Payroll & Income</option>
                  <option value="Shopping">Shopping & Assets</option>
                  <option value="Other">Miscellaneous</option>
                </select>
              </div>

            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : 'Save Record'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
