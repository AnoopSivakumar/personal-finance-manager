const pool = require('../config/db');
const { encryptAmount, decryptTransaction } = require('../config/encryption');

async function validateCategory(categoryId, type, userId) {
  if (categoryId === null || categoryId === undefined || categoryId === '') return true;
  const result = await pool.query(
    'SELECT 1 FROM categories WHERE id = $1 AND user_id = $2 AND type = $3',
    [categoryId, userId, type]
  );
  return result.rows.length > 0;
}

async function validateEvent(eventId, userId) {
  if (eventId === null || eventId === undefined || eventId === '') return true;
  const result = await pool.query(
    'SELECT 1 FROM events WHERE id = $1 AND user_id = $2',
    [eventId, userId]
  );
  return result.rows.length > 0;
}

// POST /api/transactions
async function addTransaction(req, res) {
  const { type, amount, category_id, event_id, description, transaction_date } = req.body;

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type must be "income" or "expense".' });
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'A valid positive amount is required.' });
  }

  try {
    if (!(await validateCategory(category_id, type, req.user.id))) {
      return res.status(400).json({ message: 'Category is invalid for this transaction.' });
    }
    if (!(await validateEvent(event_id, req.user.id))) {
      return res.status(400).json({ message: 'Event is invalid for this transaction.' });
    }
    const result = await pool.query(
      `INSERT INTO transactions (user_id, category_id, event_id, type, amount, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE))
       RETURNING *`,
      [
        req.user.id,
        category_id || null,
        event_id || null,
        type,
        encryptAmount(amount, req.user.id),
        description || null,
        transaction_date || null,
      ]
    );
    res.status(201).json(decryptTransaction(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating transaction.' });
  }
}

// GET /api/transactions?type=&category_id=&startDate=&endDate=&page=&limit=
async function getTransactions(req, res) {
  const { type, category_id, event_id, startDate, endDate, page = 1, limit = 20 } = req.query;
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedPage) || parsedPage < 1 || !Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return res.status(400).json({ message: 'Page must be a positive integer and limit must be between 1 and 100.' });
  }
  if (type && !['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type must be "income" or "expense".' });
  }

  try {
    const conditions = ['t.user_id = $1'];
    const params = [req.user.id];
    let idx = 2;

    if (type) {
      conditions.push(`t.type = $${idx++}`);
      params.push(type);
    }
    if (category_id) {
      conditions.push(`t.category_id = $${idx++}`);
      params.push(category_id);
    }
    if (event_id) {
      if (!(await validateEvent(event_id, req.user.id))) {
        return res.status(404).json({ message: 'Event not found.' });
      }
      conditions.push(`t.event_id = $${idx++}`);
      params.push(event_id);
    }
    if (startDate) {
      conditions.push(`t.transaction_date >= $${idx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`t.transaction_date <= $${idx++}`);
      params.push(endDate);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (parsedPage - 1) * parsedLimit;

    const dataQuery = `
      SELECT t.*, c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereClause}
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(parsedLimit, offset);

    const countQuery = `SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`;
    const countParams = params.slice(0, idx - 3); // exclude limit/offset

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, params),
      pool.query(countQuery, countParams),
    ]);

    // Summary (income vs expense totals) matching the same filters, excluding pagination
    const summaryQuery = `
      SELECT t.type, t.amount, t.user_id
      FROM transactions t
      WHERE ${whereClause}
    `;
    const summaryResult = await pool.query(summaryQuery, countParams);
    const summary = { income: 0, expense: 0 };
    summaryResult.rows.forEach((row) => {
      summary[row.type] += decryptTransaction(row).amount;
    });

    const transactions = dataResult.rows.map(decryptTransaction);

    res.json({
      transactions,
      total: Number(countResult.rows[0].count),
      page: parsedPage,
      limit: parsedLimit,
      summary: {
        income: summary.income,
        expense: summary.expense,
        balance: summary.income - summary.expense,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching transactions.' });
  }
}

// PUT /api/transactions/:id
async function updateTransaction(req, res) {
  const { type, amount, category_id, event_id, description, transaction_date } = req.body;
  const { id } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const current = existing.rows[0];
    const updated = {
      type: type || current.type,
      amount: amount !== undefined ? amount : decryptTransaction(current).amount,
      category_id: category_id !== undefined ? category_id : current.category_id,
      event_id: event_id !== undefined ? event_id : current.event_id,
      description: description !== undefined ? description : current.description,
      transaction_date: transaction_date || current.transaction_date,
    };

    if (!['income', 'expense'].includes(updated.type)) {
      return res.status(400).json({ message: 'Type must be "income" or "expense".' });
    }
    if (isNaN(updated.amount) || Number(updated.amount) <= 0) {
      return res.status(400).json({ message: 'A valid positive amount is required.' });
    }
    if (!(await validateCategory(updated.category_id, updated.type, req.user.id))) {
      return res.status(400).json({ message: 'Category is invalid for this transaction.' });
    }
    if (!(await validateEvent(updated.event_id, req.user.id))) {
      return res.status(400).json({ message: 'Event is invalid for this transaction.' });
    }

    const result = await pool.query(
      `UPDATE transactions
      SET type = $1, amount = $2, category_id = $3, event_id = $4, description = $5, transaction_date = $6, updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        updated.type,
        encryptAmount(updated.amount, req.user.id),
        updated.category_id,
        updated.event_id || null,
        updated.description,
        updated.transaction_date,
        id,
        req.user.id,
      ]
    );

    res.json(decryptTransaction(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating transaction.' });
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting transaction.' });
  }
}

module.exports = { addTransaction, getTransactions, updateTransaction, deleteTransaction };
