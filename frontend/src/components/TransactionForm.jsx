import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  type: 'expense',
  amount: '',
  category_id: '',
  event_id: '',
  description: '',
  transaction_date: new Date().toISOString().slice(0, 10),
};

export default function TransactionForm({ editingTransaction, onSaved, onCancel, eventId = null }) {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        category_id: editingTransaction.category_id || '',
        event_id: editingTransaction.event_id || '',
        description: editingTransaction.description || '',
        transaction_date: editingTransaction.transaction_date?.slice(0, 10) || emptyForm.transaction_date,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingTransaction]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await api.get('/categories', { params: { type: form.type } });
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, [form.type]);

  useEffect(() => {
    if (eventId !== null) return;
    async function fetchEvents() {
      try {
        const { data } = await api.get('/events');
        setEvents(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, [eventId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        amount: Number(form.amount),
      };
      payload.event_id = eventId !== null ? eventId : (form.event_id || null);

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setForm(emptyForm);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream p-5 rounded-xl shadow-sm border border-line space-y-4">
      <h3 className="font-semibold text-ink">
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h3>

      {error && <p className="text-sm text-terracotta bg-[#fdf0e7] px-3 py-2 rounded-md">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Category</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Date</label>
          <input
            type="date"
            name="transaction_date"
            value={form.transaction_date}
            onChange={handleChange}
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {eventId === null && (
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Event</label>
            <select
              name="event_id"
              value={form.event_id}
              onChange={handleChange}
              className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink/70 mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Grocery shopping"
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {submitting ? 'Saving...' : editingTransaction ? 'Update' : 'Submit'}
        </button>
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-line text-ink/70 hover:bg-paper transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
