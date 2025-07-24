const express = require('express');
const db = require('./db');
const { nanoid } = require('nanoid');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3050;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API: Shorten URL
app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
        return res.status(400).json({ error: 'URL tidak valid' });
    }
    // Cek apakah URL sudah pernah disimpan
    const found = db.prepare('SELECT code FROM links WHERE url = ?').get(url);
    if (found) return res.json({ code: found.code, shortUrl: req.protocol + '://' + req.get('host') + '/' + found.code });

    const code = nanoid(7);
    db.prepare('INSERT INTO links (code, url) VALUES (?, ?)').run(code, url);
    res.json({ code, shortUrl: req.protocol + '://' + req.get('host') + '/' + code });
});

// Redirect
app.get('/:code', (req, res) => {
    const { code } = req.params;
    const row = db.prepare('SELECT url FROM links WHERE code = ?').get(code);
    if (row) {
        res.redirect(row.url);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// (Optional) Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});
