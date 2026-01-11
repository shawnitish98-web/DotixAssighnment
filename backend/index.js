const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'jobs.db');

// Promisify db methods
const db = new sqlite3.Database(DB_PATH);

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const dbExec = (sql) => new Promise((resolve, reject) => {
  db.exec(sql, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

// Initialize database
async function initDb() {
  await dbExec(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskName TEXT NOT NULL,
    payload TEXT,
    priority TEXT,
    status TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    completedAt TEXT
  )`);

  await dbExec(`CREATE TABLE IF NOT EXISTS webhook_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jobId INTEGER,
    url TEXT,
    requestBody TEXT,
    responseStatus INTEGER,
    responseBody TEXT,
    createdAt TEXT
  )`);
  await dbExec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
}

const WEBHOOK_URL = process.env.WEBHOOK_URL || ''; // set to https://webhook.site/<id>

function now() { return new Date().toISOString(); }

app.get('/', (req, res) => {
  res.json({ message: 'Dotix Job Scheduler API', version: '1.0.0', endpoints: ['/jobs', '/webhook-logs'] });
});

app.post('/jobs', async (req, res) => {
  try {
    const { taskName, payload, priority } = req.body;
    if (!taskName) return res.status(400).json({ error: 'taskName required' });
    const createdAt = now();
    const status = 'pending';
    const result = await dbRun(
      `INSERT INTO jobs (taskName,payload,priority,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
      [taskName, JSON.stringify(payload || {}), priority || 'Low', status, createdAt, createdAt]
    );
    const job = await dbGet('SELECT * FROM jobs WHERE id = ?', [result.lastID]);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/jobs', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let sql = 'SELECT * FROM jobs';
    const conditions = [];
    const params = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (priority) { conditions.push('priority = ?'); params.push(priority); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY id DESC';
    const rows = await dbAll(sql, params);
    // parse payload JSON
    const parsed = rows.map(r => ({ ...r, payload: safeParse(r.payload) }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/jobs/:id', async (req, res) => {
  try {
    const job = await dbGet('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Not found' });
    job.payload = safeParse(job.payload);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/run-job/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const job = await dbGet('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) return res.status(404).json({ error: 'Not found' });

    // set running
    await dbRun('UPDATE jobs SET status = ?, updatedAt = ? WHERE id = ?', ['running', now(), id]);
    const runningJob = await dbGet('SELECT * FROM jobs WHERE id = ?', [id]);
    runningJob.payload = safeParse(runningJob.payload);
    res.json({ message: 'Job started', job: runningJob });

    // simulate background processing
    setTimeout(async () => {
      const completedAt = now();
      await dbRun('UPDATE jobs SET status = ?, completedAt = ?, updatedAt = ? WHERE id = ?', ['completed', completedAt, completedAt, id]);
      const completedJob = await dbGet('SELECT * FROM jobs WHERE id = ?', [id]);
      completedJob.payload = safeParse(completedJob.payload);

      // trigger webhook if configured
      // prefer stored webhook URL in DB, but fall back to env var
      let webhookUrl = WEBHOOK_URL;
      try {
        const s = await dbGet('SELECT value FROM settings WHERE key = ?', ['webhook_url']);
        if (s && s.value) webhookUrl = s.value;
      } catch (err) {
        console.error('Failed to read webhook setting:', err.message);
      }

      if (webhookUrl) {
        try {
          const body = {
            jobId: completedJob.id,
            taskName: completedJob.taskName,
            priority: completedJob.priority,
            payload: completedJob.payload,
            completedAt: completedJob.completedAt
          };
        const resp = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const text = await resp.text();
          await dbRun(
            'INSERT INTO webhook_logs (jobId,url,requestBody,responseStatus,responseBody,createdAt) VALUES (?,?,?,?,?,?)',
            [completedJob.id, WEBHOOK_URL, JSON.stringify(body), resp.status, text, now()]
          );
          console.log('Webhook sent', WEBHOOK_URL, 'status', resp.status);
        } catch (err) {
          console.error('Webhook error', err.message);
          await dbRun(
            'INSERT INTO webhook_logs (jobId,url,requestBody,responseStatus,responseBody,createdAt) VALUES (?,?,?,?,?,?)',
            [completedJob.id, WEBHOOK_URL, JSON.stringify({ error: err.message }), 0, err.message, now()]
          );
        }
      } else {
        console.log('WEBHOOK_URL not set; skipping webhook for job', id);
      }
    }, 3000);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook-test', (req, res) => {
  console.log('Received webhook-test:', req.body);
  res.json({ received: true, body: req.body });
});

// Settings endpoints (persist webhook URL)
app.post('/settings/webhook', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    await dbRun('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', ['webhook_url', url]);
    res.json({ ok: true, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/settings/webhook', async (req, res) => {
  try {
    const row = await dbGet('SELECT value FROM settings WHERE key = ?', ['webhook_url']);
    res.json({ url: row ? row.value : '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/webhook-logs', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM webhook_logs ORDER BY id DESC');
    res.json(rows.map(r => ({ ...r, requestBody: safeParse(r.requestBody), responseBody: r.responseBody })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function safeParse(s) {
  try { return JSON.parse(s); } catch { return s; }
}

const PORT = process.env.PORT || 4000;

// Start server after db init
initDb().then(() => {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
