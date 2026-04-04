/**
 * OpenClaw Usage Analyzer — API Server
 * Reads local session data and serves it to the dashboard
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { parseAllSessions, getSessionDetail } from './parser.js';

const app = express();
const PORT = process.env.PORT || 3099;

app.use(cors());
app.use(express.json());

// Cache parsed data (re-parse every 60s max)
let cachedData = null;
let lastParsed = 0;
const CACHE_TTL = 60_000;

async function getData() {
  const now = Date.now();
  if (!cachedData || now - lastParsed > CACHE_TTL) {
    const sessionsDir = process.env.OPENCLAW_SESSIONS_DIR || undefined;
    cachedData = await parseAllSessions(sessionsDir);
    lastParsed = now;
  }
  return cachedData;
}

// --- API Routes ---

// Full dashboard data
app.get('/api/usage', async (req, res) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Summary only (lightweight)
app.get('/api/usage/summary', async (req, res) => {
  try {
    const data = await getData();
    res.json(data.summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Session detail
app.get('/api/usage/session/:id', async (req, res) => {
  try {
    const sessionsDir = process.env.OPENCLAW_SESSIONS_DIR || undefined;
    const detail = await getSessionDetail(req.params.id, sessionsDir);
    if (!detail) return res.status(404).json({ error: 'Session not found' });
    res.json(detail);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Force refresh
app.post('/api/usage/refresh', async (req, res) => {
  cachedData = null;
  lastParsed = 0;
  const data = await getData();
  res.json({ ok: true, sessions: data.summary.totalSessions });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`⚡ OpenClaw Usage API running on http://localhost:${PORT}`);
});
