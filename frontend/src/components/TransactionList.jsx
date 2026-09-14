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
      <table className="w-full text-sm">
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
