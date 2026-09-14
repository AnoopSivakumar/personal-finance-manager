const crypto = require('crypto');

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getMasterKey() {
  const value = process.env.ENCRYPTION_KEY;
  if (!value) {
    throw new Error('ENCRYPTION_KEY is required to protect transaction amounts.');
  }
  return crypto.createHash('sha256').update(value).digest();
}

function getUserKey(userId) {
  return crypto.createHmac('sha256', getMasterKey()).update(String(userId)).digest();
}

function encryptAmount(amount, userId) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getUserKey(userId), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(amount)),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':');
}

function decryptAmount(value, userId) {
  if (typeof value !== 'string' || !value.startsWith(`${VERSION}:`)) {
    return Number(value);
  }

  const [, ivValue, tagValue, encryptedValue] = value.split(':');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getUserKey(userId),
    Buffer.from(ivValue, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

  return Number(Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8'));
}

function decryptTransaction(row) {
  return { ...row, amount: decryptAmount(row.amount, row.user_id) };
}

async function migrateLegacyAmounts(pool) {
  const result = await pool.query(
    "SELECT id, user_id, amount FROM transactions WHERE amount NOT LIKE 'v1:%'"
  );

  for (const row of result.rows) {
    await pool.query(
      'UPDATE transactions SET amount = $1, updated_at = NOW() WHERE id = $2',
      [encryptAmount(row.amount, row.user_id), row.id]
    );
  }

  if (result.rows.length > 0) {
    console.log(`Encrypted ${result.rows.length} existing transaction amount(s).`);
  }
}

module.exports = { encryptAmount, decryptTransaction, migrateLegacyAmounts };
