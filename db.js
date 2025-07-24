// db.js
const Database = require('better-sqlite3');
const db = new Database('shortener.db');

// Buat tabel jika belum ada
db.exec(`
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
