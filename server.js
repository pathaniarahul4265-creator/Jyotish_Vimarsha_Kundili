import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import handler from './api/[...path].js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets with explicit mappings
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(process.cwd()));

// Direct handler for zodiac images - serve high quality PNG medallions
app.get(['/images/zodiac/:sign.:ext', '/images/zodiac_gold/:sign.:ext', '/public/images/zodiac/:sign.:ext', '/public/images/zodiac_gold/:sign.:ext'], (req, res, next) => {
  const sign = req.params.sign.toLowerCase().replace(/[^a-z]/g, '');
  const ext = (req.params.ext || 'png').toLowerCase();
  
  // Preferred search paths: PNG gold medallions first
  const candidates = [
    path.join(process.cwd(), 'public', 'images', 'zodiac_gold', `${sign}.png`),
    path.join(process.cwd(), 'public', 'images', 'zodiac', `${sign}.png`),
    path.join(process.cwd(), 'public', 'images', 'zodiac', `${sign}.svg`)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const mime = candidate.endsWith('.png') ? 'image/png' : candidate.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(candidate);
    }
  }
  next();
});

// Handle API routes
app.all(/^\/api(\/.*)?$/, async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (err) {
    next(err);
  }
});

// Fallback to index.html for SPA routes
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Global Express error handler
app.use((err, req, res, _next) => {
  console.error('[Jyotish Vimarsha Server Error]', err);
  if (res.headersSent) return;
  const status = Number(err.status || err.statusCode) || 500;
  res.status(status).json({ error: err.message || 'Unexpected server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Jyotish Vimarsha] Express server listening on http://0.0.0.0:${PORT}`);
});

