import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: '', category_id: '' });
  const [loading, setLoading] = useState(true);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category_id) params.category_id = filters.category_id;

      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  }

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-ink">Transactions</h1>

        <TransactionForm
          editingTransaction={editingTransaction}
          onSaved={() => {
            setEditingTransaction(null);
            fetchTransactions();
          }}
          onCancel={() => setEditingTransaction(null)}
        />

        <div className="bg-cream p-4 rounded-xl border border-line flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Filter by Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="border border-line rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Filter by Category</label>
            <select
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
              className="border border-line rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
              ))}
            </select>
          </div>
          {(filters.type || filters.category_id) && (
            <button
              onClick={() => setFilters({ type: '', category_id: '' })}
              className="text-sm text-terracotta hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading...</p>
        ) : (
          <TransactionList
            transactions={transactions}
            onEdit={setEditingTransaction}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
