import express from 'express';
import path from 'node:path';
import handler from './api/[...path].js';

const app = express();
const PORT = 3000;

// Serve static files from current directory
app.use(express.static(process.cwd()));

// Static alias route for zodiac images
const ZODIAC_IMAGE_MAP = {
  aries: 'zodiac_aries_gold_1786427406985.jpg',
  taurus: 'zodiac_taurus_gold_1786427430892.jpg',
  gemini: 'zodiac_gemini_gold_1786427447560.jpg',
  cancer: 'zodiac_cancer_gold_1786427465388.jpg',
  leo: 'zodiac_leo_gold_1786427482212.jpg',
  virgo: 'zodiac_virgo_gold_1786427501477.jpg',
  libra: 'zodiac_libra_gold_1786427519372.jpg',
  scorpio: 'zodiac_scorpio_gold_1786427534881.jpg',
  sagittarius: 'zodiac_sagittarius_gold_1786427554200.jpg',
  capricorn: 'zodiac_capricorn_gold_1786427572321.jpg',
  aquarius: 'zodiac_aquarius_gold_1786427591478.jpg',
  pisces: 'zodiac_pisces_gold_1786427610651.jpg'
};

app.get('/images/zodiac/:sign.jpg', (req, res, next) => {
  const sign = req.params.sign.toLowerCase();
  const file = ZODIAC_IMAGE_MAP[sign];
  if (file) {
    return res.sendFile(path.join(process.cwd(), 'src', 'assets', 'images', file));
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

