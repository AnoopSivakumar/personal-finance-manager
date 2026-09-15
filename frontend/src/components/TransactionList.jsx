import React from 'react';

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-cream p-8 rounded-xl border border-line text-center text-ink/50">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-xl border border-line overflow-hidden">
      <div className="md:hidden divide-y divide-[#eeece4]">
        {transactions.map((t) => (
          <article key={t.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink break-words">{t.description || '—'}</p>
                <p className="text-xs text-ink/60 mt-1">
                  {new Date(t.transaction_date).toLocaleDateString()}
                </p>
              </div>
              <p
                className={`shrink-0 font-medium ${
                  t.type === 'income' ? 'text-primary-600' : 'text-terracotta'
                }`}
              >
                {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink/70">
              <span>{t.category_name || 'Uncategorized'}</span>
              <span className="text-ink/30">•</span>
              <span
                className={`px-2 py-1 rounded-full font-medium ${
                  t.type === 'income'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-[#fdf0e7] text-terracotta'
                }`}
              >
                {t.type}
              </span>
            </div>
            <div className="flex justify-end gap-4 pt-1">
              <button
                onClick={() => onEdit(t)}
                className="text-terracotta hover:underline text-xs font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="text-terracotta hover:underline text-xs font-medium"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <table className="hidden md:table w-full text-sm">
        <thead className="bg-[#eeece4] text-ink/60 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eeece4]">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-paper transition">
              <td className="px-4 py-3 whitespace-nowrap text-ink/70">
                {new Date(t.transaction_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-ink">{t.description || '—'}</td>
              <td className="px-4 py-3 text-ink/70">{t.category_name || 'Uncategorized'}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.type === 'income'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-[#fdf0e7] text-terracotta'
                  }`}
                >
                  {t.type}
                </span>
              </td>
              <td
                className={`px-4 py-3 text-right font-medium ${
                  t.type === 'income' ? 'text-primary-600' : 'text-terracotta'
                }`}
              >
                {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(t)}
                  className="text-terracotta hover:underline text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-terracotta hover:underline text-xs font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
