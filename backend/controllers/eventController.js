const pool = require('../config/db');
const { decryptTransaction } = require('../config/encryption');

function summarize(rows) {
  const summary = { income: 0, expense: 0 };
  rows.forEach((row) => {
    summary[row.type] += decryptTransaction(row).amount;
  });
  return { ...summary, balance: summary.income - summary.expense };
}

async function getEvents(req, res) {
  try {
    const result = await pool.query(
      `SELECT e.*, COUNT(t.id)::int AS transaction_count
       FROM events e
       LEFT JOIN transactions t ON t.event_id = e.id
       WHERE e.user_id = $1
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    const transactionResult = await pool.query(
      'SELECT event_id, type, amount, user_id FROM transactions WHERE user_id = $1 AND event_id IS NOT NULL',
      [req.user.id]
    );
    const summaries = new Map();
    transactionResult.rows.forEach((row) => {
      if (!summaries.has(row.event_id)) summaries.set(row.event_id, []);
      summaries.get(row.event_id).push(row);
    });
    res.json(result.rows.map((event) => ({
      ...event,
      summary: summarize(summaries.get(event.id) || []),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
}

async function createEvent(req, res) {
  const { name, description, start_date, end_date } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Event name is required.' });
  if (start_date && end_date && start_date > end_date) {
    return res.status(400).json({ message: 'End date must be on or after the start date.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO events (user_id, name, description, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name.trim(), description || null, start_date || null, end_date || null]
    );
    res.status(201).json({ ...result.rows[0], summary: { income: 0, expense: 0, balance: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating event.' });
  }
}

async function getEvent(req, res) {
  try {
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!eventResult.rows.length) return res.status(404).json({ message: 'Event not found.' });
    const transactionResult = await pool.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.event_id = $1 AND t.user_id = $2
       ORDER BY t.transaction_date DESC, t.id DESC`,
      [req.params.id, req.user.id]
    );
    res.json({
      ...eventResult.rows[0],
      transactions: transactionResult.rows.map(decryptTransaction),
      summary: summarize(transactionResult.rows),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching event.' });
  }
}

async function deleteEvent(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting event.' });
  }
}

module.exports = { getEvents, createEvent, getEvent, deleteEvent };