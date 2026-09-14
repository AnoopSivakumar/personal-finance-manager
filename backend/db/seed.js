/**
 * Optional helper: (re)creates the schema.
 * Run with: npm run seed
 */
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
 
async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Schema created successfully.');
  } catch (err) {
    console.log('----- SCHEMA CREATION FAILED -----');
    console.log('Error code:', err.code);
    console.log('Error message:', err.message);
    console.log('Full error object:');
    console.log(err);
    console.log('-----------------------------------');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
 
run();