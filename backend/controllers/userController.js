const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const MAX_PROFILE_PICTURE_LENGTH = 3_000_000;

// GET /api/users/profile
async function getProfile(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, profile_picture, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
}

// PUT /api/users/profile
async function updateProfile(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const profilePicture = typeof req.body.profile_picture === 'string' ? req.body.profile_picture.trim() : '';
  const { password } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (email) {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Email already in use.' });
      }
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (profilePicture || req.body.profile_picture === '') {
      const isUrl = /^https?:\/\/[^\s]{1,2048}$/i.test(profilePicture);
      const isImageData = /^data:image\/(jpeg|png|gif|webp);base64,[a-z0-9+/=]+$/i.test(profilePicture);
      if (profilePicture && (!isUrl && !isImageData || profilePicture.length > MAX_PROFILE_PICTURE_LENGTH)) {
        return res.status(400).json({ message: 'Profile picture must be a valid image URL or an image smaller than 2 MB.' });
      }
      fields.push(`profile_picture = $${idx++}`);
      values.push(profilePicture || null);
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(passwordHash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Nothing to update.' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, profile_picture, created_at`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
}

module.exports = { getProfile, updateProfile };
