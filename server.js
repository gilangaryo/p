import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const links = {};

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
        return res.status(400).json({ error: 'URL tidak valid' });
    }
    for (const [code, storedUrl] of Object.entries(links)) {
        if (storedUrl === url) {
            return res.json({ code, shortUrl: req.protocol + '://' + req.get('host') + '/' + code });
        }
    }
    const code = nanoid(4);
    links[code] = url;
    res.json({ code, shortUrl: req.protocol + '://' + req.get('host') + '/' + code });
});

app.get('/:code', (req, res) => {
    const { code } = req.params;
    const url = links[code];
    if (url) {
        res.redirect(url);
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
