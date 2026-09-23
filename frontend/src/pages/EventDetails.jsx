import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

function formatStatementDate(value) {
  if (!value) return '-';
  const dateText = String(value).slice(0, 10);
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

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
    const document = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const tableTop = 84;
    let y = tableTop;

    function addPageFooter() {
      const pageNumber = document.getNumberOfPages();
      document.setDrawColor(229, 231, 235);
      document.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      document.setFontSize(8);
      document.setTextColor(107, 114, 128);
      document.text(`Generated ${new Date().toLocaleDateString()}`, margin, pageHeight - 7);
      document.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    document.setFillColor(31, 41, 55);
    document.rect(0, 0, pageWidth, 7, 'F');
    document.setFontSize(20);
    document.setFont('helvetica', 'bold');
    document.setTextColor(31, 41, 55);
    const title = document.splitTextToSize(event.name, contentWidth - 45);
    document.text(title, margin, 24);
    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.setTextColor(107, 114, 128);
    document.text('Event financial statement', margin, 35);
    document.setFontSize(9);
    document.text(`Prepared on ${new Date().toLocaleDateString()}`, pageWidth - margin, 35, { align: 'right' });
    document.setDrawColor(229, 231, 235);
    document.line(margin, 41, pageWidth - margin, 41);

    const summaryItems = [
      ['Income', event.summary.income, [22, 163, 74]],
      ['Expenses', event.summary.expense, [194, 65, 60]],
      ['Balance', event.summary.balance, [31, 41, 55]],
    ];
    const boxGap = 4;
    const boxWidth = (contentWidth - boxGap * 2) / 3;
    summaryItems.forEach(([label, amount, color], index) => {
      const x = margin + index * (boxWidth + boxGap);
      document.setFillColor(248, 247, 242);
      document.roundedRect(x, y, boxWidth, 20, 2, 2, 'F');
      document.setFontSize(9);
      document.setTextColor(107, 114, 128);
      document.text(label, x + 4, y + 7);
      document.setFontSize(12);
      document.setTextColor(...color);
      document.setFont('helvetica', 'bold');
      document.text(`INR ${Number(amount).toFixed(2)}`, x + 4, y + 15);
      document.setFont('helvetica', 'normal');
    });
    y += 30;

    const columns = [
      { label: 'Date', width: 27, align: 'left' },
      { label: 'Description', width: 55, align: 'left' },
      { label: 'Category', width: 38, align: 'left' },
      { label: 'Type', width: 25, align: 'left' },
      { label: 'Amount', width: 37, align: 'right' },
    ];
    const tableRight = margin + columns.reduce((total, column) => total + column.width, 0);
    const drawHeader = () => {
      document.setFillColor(238, 236, 228);
      document.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
      document.setFontSize(8);
      document.setFont('helvetica', 'bold');
      document.setTextColor(75, 85, 99);
      let x = margin + 3;
      columns.forEach((column) => {
        const textX = column.align === 'right' ? x + column.width - 6 : x;
        document.text(column.label, textX, y + 6, { align: column.align });
        x += column.width;
      });
      document.setFont('helvetica', 'normal');
      y += 13;
    };

    drawHeader();
    event.transactions.forEach((transaction) => {
      const description = document.splitTextToSize(transaction.description || '-', 49);
      const category = document.splitTextToSize(transaction.category_name || 'Uncategorized', 32);
      const rowHeight = Math.max(description.length, category.length, 1) * 4 + 7;
      if (y + rowHeight > pageHeight - 14) {
        addPageFooter();
        document.addPage();
        y = 18;
        drawHeader();
      }
      document.setFontSize(8);
      document.setTextColor(55, 65, 81);
      const values = [
        formatStatementDate(transaction.transaction_date),
        description,
        category,
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        `INR ${Number(transaction.amount).toFixed(2)}`,
      ];
      let x = margin + 3;
      values.forEach((value, index) => {
        const column = columns[index];
        const textX = column.align === 'right' ? x + column.width - 6 : x;
        document.text(value, textX, y + 4, { align: column.align });
        x += columns[index].width;
      });
      document.setDrawColor(229, 231, 235);
      document.line(margin, y + rowHeight, tableRight, y + rowHeight);
      y += rowHeight;
    });

    addPageFooter();
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