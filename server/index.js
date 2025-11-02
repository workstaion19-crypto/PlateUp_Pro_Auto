const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const SOURCE_FILE = path.join(__dirname, 'data', 'source.json');
const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET || 'change_me_secret';

app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/articles', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const j = JSON.parse(raw);
      return res.json(j);
    } catch (e) {
      return res.status(500).json({ error: 'failed_read_cache' });
    }
  }
  return res.json({ ts: 0, list: [] });
});

app.post('/api/automation/generate', (req, res) => {
  const secret = req.headers['x-automation-secret'] || req.query.secret;
  if (!secret || secret !== AUTOMATION_SECRET) return res.status(403).json({ error: 'forbidden' });
  exec('node server/scripts/generateArticles.js', { cwd: path.join(__dirname) }, (err, stdout, stderr) => {
    if (err) {
      console.error('Generator error', err);
      return res.status(500).json({ error: 'generator_failed', detail: err.message, stderr });
    }
    return res.json({ ok: true, out: stdout });
  });
});

app.listen(PORT, () => console.log('PlateUp worker listening on', PORT));
module.exports = app;
