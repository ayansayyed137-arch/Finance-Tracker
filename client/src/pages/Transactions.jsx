import React, { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [transactions, setTransactions] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
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

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">All Transactions History</h2>
        
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
  );
}
