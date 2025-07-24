const express = require('express');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway PostgreSQL URL ada di process.env.DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // set di Railway env var!
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

pool.query(`
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`, () => { });

app.post('/api/shorten', async (req, res) => {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
        return res.status(400).json({ error: 'URL tidak valid' });
    }
    const found = await pool.query('SELECT code FROM links WHERE url = $1', [url]);
    if (found.rows[0]) {
        return res.json({ code: found.rows[0].code, shortUrl: req.protocol + '://' + req.get('host') + '/' + found.rows[0].code });
    }

    const code = nanoid(7);
    await pool.query('INSERT INTO links (code, url) VALUES ($1, $2)', [code, url]);
    res.json({ code, shortUrl: req.protocol + '://' + req.get('host') + '/' + code });
});

app.get('/:code', async (req, res) => {
    const { code } = req.params;
    const row = await pool.query('SELECT url FROM links WHERE code = $1', [code]);
    if (row.rows[0]) {
        res.redirect(row.rows[0].url);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});
