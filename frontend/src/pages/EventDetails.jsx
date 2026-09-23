import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState('');

  async function fetchEvent() {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load event.');
    }
  }

  useEffect(() => { fetchEvent(); }, [id]);

  function downloadStatement() {
    if (!event) return;
    const document = new jsPDF();
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();
    const left = 14;
    const right = pageWidth - 14;
    let y = 18;

    document.setFontSize(20);
    document.setTextColor(31, 41, 55);
    document.text(event.name, left, y);
    y += 8;
    document.setFontSize(10);
    document.setTextColor(107, 114, 128);
    document.text('Event financial statement', left, y);
    y += 12;

    const summaryItems = [
      ['Income', event.summary.income, [22, 163, 74]],
      ['Expenses', event.summary.expense, [194, 65, 60]],
      ['Balance', event.summary.balance, [31, 41, 55]],
    ];
    const boxWidth = (right - left - 8) / 3;
    summaryItems.forEach(([label, amount, color], index) => {
      const x = left + index * (boxWidth + 4);
      document.setFillColor(248, 247, 242);
      document.roundedRect(x, y, boxWidth, 20, 2, 2, 'F');
      document.setFontSize(9);
      document.setTextColor(107, 114, 128);
      document.text(label, x + 4, y + 7);
      document.setFontSize(12);
      document.setTextColor(...color);
      document.text(`INR ${Number(amount).toFixed(2)}`, x + 4, y + 15);
    });
    y += 30;

    const columns = [
      { label: 'Date', width: 27 },
      { label: 'Description', width: 63 },
      { label: 'Category', width: 43 },
      { label: 'Type', width: 25 },
      { label: 'Amount', width: 29 },
    ];
    const drawHeader = () => {
      document.setFillColor(238, 236, 228);
      document.rect(left, y, right - left, 9, 'F');
      document.setFontSize(8);
      document.setTextColor(75, 85, 99);
      let x = left + 3;
      columns.forEach((column) => {
        document.text(column.label, x, y + 6);
        x += column.width;
      });
      y += 13;
    };

    drawHeader();
    event.transactions.forEach((transaction) => {
      const description = document.splitTextToSize(transaction.description || '-', 57);
      const category = document.splitTextToSize(transaction.category_name || 'Uncategorized', 37);
      const rowHeight = Math.max(description.length, category.length, 1) * 4 + 5;
      if (y + rowHeight > pageHeight - 14) {
        document.addPage();
        y = 18;
        drawHeader();
      }
      document.setFontSize(8);
      document.setTextColor(55, 65, 81);
      const values = [
        transaction.transaction_date,
        description,
        category,
        transaction.type,
        `INR ${Number(transaction.amount).toFixed(2)}`,
      ];
      let x = left + 3;
      values.forEach((value, index) => {
        document.text(value, x, y + 4);
        x += columns[index].width;
      });
      document.setDrawColor(229, 231, 235);
      document.line(left, y + rowHeight, right, y + rowHeight);
      y += rowHeight;
    });

    document.save(`${event.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-statement.pdf`);
  }

  async function handleDelete(transactionId) {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${transactionId}`);
    fetchEvent();
  }

  if (!event) return <div className="min-h-screen bg-paper"><Navbar /><main className="max-w-5xl mx-auto px-4 py-8">{error ? <p className="text-terracotta">{error}</p> : <p className="text-ink/50">Loading...</p>}</main></div>;

  const cards = [
    ['Income', event.summary.income, 'text-primary-600'],
    ['Expenses', event.summary.expense, 'text-terracotta'],
    ['Balance', event.summary.balance, event.summary.balance >= 0 ? 'text-primary-600' : 'text-terracotta'],
  ];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Link to="/events" className="text-sm text-terracotta hover:underline">← All events</Link><h1 className="text-2xl font-bold text-ink mt-2">{event.name}</h1><p className="text-sm text-ink/60">{event.description || 'Event financial statement'}</p></div>
          <button onClick={downloadStatement} className="border border-line rounded-lg px-4 py-2 text-sm font-medium text-ink hover:bg-cream">Download statement</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map(([label, amount, color]) => <div key={label} className="bg-cream p-5 rounded-xl border border-line"><p className="text-sm text-ink/60">{label}</p><p className={`text-2xl font-bold mt-1 ${color}`}>₹{Number(amount).toFixed(2)}</p></div>)}
        </div>
        <TransactionForm eventId={event.id} editingTransaction={editingTransaction} onSaved={() => { setEditingTransaction(null); fetchEvent(); }} onCancel={() => setEditingTransaction(null)} />
        <TransactionList transactions={event.transactions} onEdit={setEditingTransaction} onDelete={handleDelete} />
      </main>
    </div>
  );
}