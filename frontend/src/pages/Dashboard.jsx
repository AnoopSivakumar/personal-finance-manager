import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function formatMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(date) {
  return `${formatMonth(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMonthRange(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  return {
    startDate: `${monthValue}-01`,
    endDate: formatDate(new Date(year, month, 0)),
  };
}

function getMonthLabel(monthValue) {
  return new Date(`${monthValue}-02T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => formatMonth(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [year, month] = selectedMonth.split('-').map(Number);
        const comparisonMonths = Array.from({ length: 6 }, (_, index) => {
          const date = new Date(year, month - 1 - index, 1);
          return formatMonth(date);
        }).reverse();
        const requests = comparisonMonths.map((monthValue) => {
          const range = getMonthRange(monthValue);
          return api.get('/transactions', {
            params: { limit: 1, page: 1, ...range },
          });
        });
        const selectedRange = getMonthRange(selectedMonth);
        const [selectedData, ...comparisonData] = await Promise.all([
          api.get('/transactions', {
            params: { limit: 5, page: 1, ...selectedRange },
          }),
          ...requests,
        ]);
        setSummary(selectedData.data.summary);
        setRecent(selectedData.data.transactions);
        setMonthlyComparison(comparisonData.map(({ data }, index) => ({
          month: comparisonMonths[index],
          label: getMonthLabel(comparisonMonths[index]),
          income: data.summary.income,
          expense: data.summary.expense,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth]);

  function changeMonth(offset) {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextMonth = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(formatMonth(nextMonth));
  }

  const currentMonth = formatMonth(new Date());
  const selectedMonthLabel = getMonthLabel(selectedMonth);
  const chartMax = Math.max(
    ...monthlyComparison.flatMap(({ income, expense }) => [income, expense]),
    1,
  );

  const cards = [
    { label: 'Monthly Income', value: summary.income, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Monthly Expense', value: summary.expense, color: 'text-terracotta', bg: 'bg-[#fdf0e7]' },
    { label: 'Monthly Balance', value: summary.balance, color: summary.balance >= 0 ? 'text-primary-600' : 'text-terracotta', bg: 'bg-primary-50' },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Dashboard</h1>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="View previous month"
            className="border border-line rounded-lg px-3 py-2 text-lg leading-none hover:bg-primary-50"
          >
            &larr;
          </button>
          <input
            type="month"
            value={selectedMonth}
            max={currentMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            aria-label="Select month"
            className="border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={selectedMonth >= currentMonth}
            aria-label="View next month"
            className="border border-line rounded-lg px-3 py-2 text-lg leading-none hover:bg-primary-50 disabled:opacity-40"
          >
            &rarr;
          </button>
          <span className="text-sm text-ink/60">Showing {selectedMonthLabel}</span>
        </div>

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

        <section className="bg-cream p-5 rounded-xl border border-line mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-semibold text-ink">Income vs Expenses</h2>
              <p className="text-sm text-ink/60">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink/60">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary-500" />Income</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-terracotta" />Expenses</span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 items-end h-56">
            {monthlyComparison.map((monthData) => (
              <div key={monthData.month} className="h-full flex flex-col items-center justify-end gap-2">
                <div className="w-full flex-1 flex items-end justify-center gap-1">
                  <div
                    title={`Income: ₹${Number(monthData.income).toFixed(2)}`}
                    aria-label={`Income for ${monthData.label}: ₹${Number(monthData.income).toFixed(2)}`}
                    className="w-1/3 max-w-6 bg-primary-500 rounded-t-sm"
                    style={{ height: `${monthData.income ? Math.max((monthData.income / chartMax) * 100, 4) : 0}%` }}
                  />
                  <div
                    title={`Expenses: ₹${Number(monthData.expense).toFixed(2)}`}
                    aria-label={`Expenses for ${monthData.label}: ₹${Number(monthData.expense).toFixed(2)}`}
                    className="w-1/3 max-w-6 bg-terracotta rounded-t-sm"
                    style={{ height: `${monthData.expense ? Math.max((monthData.expense / chartMax) * 100, 4) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-ink/60 whitespace-nowrap">{monthData.label}</span>
              </div>
            ))}
          </div>
        </section>

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
