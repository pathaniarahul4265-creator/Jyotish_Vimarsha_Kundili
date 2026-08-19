/**
 * Master Express Server & Entrypoint for Jyotish Vimarsha
 * Compatible with Vercel Serverless Builds and Local Development
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/[...path].js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON and form payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Serve static assets from public/ and root directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Mount serverless API handler
app.all('/api/*', async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('[API Handler Error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
});

// Root frontend routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  JYOTISH VIMARSHA SERVER RUNNING ON PORT ${PORT}`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

export default app;
