import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/transactions', { params: { limit: 5, page: 1 } });
        setSummary(data.summary);
        setRecent(data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cards = [
    { label: 'Total Income', value: summary.income, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Expense', value: summary.expense, color: 'text-terracotta', bg: 'bg-[#fdf0e7]' },
    { label: 'Balance', value: summary.balance, color: summary.balance >= 0 ? 'text-primary-600' : 'text-terracotta', bg: 'bg-primary-50' },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Dashboard</h1>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className={`p-5 rounded-xl border border-line ${c.bg}`}>
              <p className="text-sm text-ink/60">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>
                ₹{Number(c.value).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-terracotta font-medium hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading...</p>
        ) : recent.length === 0 ? (
          <div className="bg-cream p-8 rounded-xl border border-line text-center text-ink/50">
            No transactions yet.{' '}
            <Link to="/transactions" className="text-terracotta hover:underline">Add your first one</Link>.
          </div>
        ) : (
          <div className="bg-cream rounded-xl border border-line divide-y divide-[#eeece4]">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{t.description || t.category_name || 'Transaction'}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(t.transaction_date).toLocaleDateString()} · {t.category_name || 'Uncategorized'}
                  </p>
                </div>
                <span className={`font-medium ${t.type === 'income' ? 'text-primary-600' : 'text-terracotta'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
