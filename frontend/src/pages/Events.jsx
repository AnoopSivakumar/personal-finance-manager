import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const emptyForm = { name: '', description: '', start_date: '', end_date: '' };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/events', form);
      setForm(emptyForm);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create event.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event and its transactions?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete event.');
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Events</h1>
          <p className="text-sm text-ink/60 mt-1">Keep trip, party, and activity finances together.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-cream p-5 rounded-xl border border-line space-y-4">
          <h2 className="font-semibold text-ink">Create an event</h2>
          {error && <p className="text-sm text-terracotta bg-[#fdf0e7] px-3 py-2 rounded-md">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <input required name="name" value={form.name} onChange={handleChange} placeholder="Event name, e.g. Goa Trip" className="border border-line rounded-lg px-3 py-2" />
            <input name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" className="border border-line rounded-lg px-3 py-2" />
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="border border-line rounded-lg px-3 py-2" aria-label="Event start date" />
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="border border-line rounded-lg px-3 py-2" aria-label="Event end date" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg">Create event</button>
        </form>

        {loading ? <p className="text-ink/50 text-sm">Loading...</p> : events.length === 0 ? (
          <div className="bg-cream p-8 rounded-xl border border-line text-center text-ink/50">No events yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((event) => (
              <article key={event.id} className="bg-cream p-5 rounded-xl border border-line">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink">{event.name}</h2>
                    <p className="text-sm text-ink/60 mt-1">{event.description || 'No description'}</p>
                  </div>
                  <button onClick={() => handleDelete(event.id)} className="text-xs text-terracotta hover:underline">Delete</button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
                  <div><p className="text-ink/50">Income</p><p className="font-medium text-primary-600">₹{Number(event.summary.income).toFixed(2)}</p></div>
                  <div><p className="text-ink/50">Expenses</p><p className="font-medium text-terracotta">₹{Number(event.summary.expense).toFixed(2)}</p></div>
                  <div><p className="text-ink/50">Balance</p><p className="font-medium text-ink">₹{Number(event.summary.balance).toFixed(2)}</p></div>
                </div>
                <Link to={`/events/${event.id}`} className="inline-block mt-5 text-sm font-medium text-terracotta hover:underline">Open event →</Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}