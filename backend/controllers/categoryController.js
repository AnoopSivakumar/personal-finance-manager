const pool = require('../config/db');

// GET /api/categories?type=income|expense
async function getCategories(req, res) {
  const { type } = req.query;
  if (type && !['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type must be "income" or "expense".' });
  }
  try {
    let query = 'SELECT * FROM categories WHERE user_id = $1';
    const params = [req.user.id];

    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }
    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching categories.' });
  }
}

// POST /api/categories
async function createCategory(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const { type } = req.body;

  if (!name || !type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Valid name and type (income/expense) are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, name, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'This category already exists.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error creating category.' });
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting category.' });
  }
}

module.exports = { getCategories, createCategory, deleteCategory };
