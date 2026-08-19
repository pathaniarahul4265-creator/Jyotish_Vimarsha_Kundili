/**
 * Master Serverless API Handler for Jyotish Vimarsha
 * Handles Gemini Multi-Key Rotation, Quotas, SSE Streaming, Payments & Admin
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Razorpay from 'razorpay';
import { db, getSettings, pricing } from './_lib/supabase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}
ensureDataDir();

function loadJsonFile(filename, defaultValue) {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {}
  return defaultValue;
}

function saveJsonFile(filename, data) {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

function getEnv(name, fallback = '') {
  const val = process.env[name];
  if (val === undefined || val === null || val === '') return fallback;
  return String(val).trim().replace(/^["']|["']$/g, '');
}

// Global Module Scope: normalizeModel accessible by all route handlers
export function normalizeModel(m) {
  if (!m) return 'gemini-1.5-flash';
  let cleanStr = String(m).trim().toLowerCase().replace(/^models\//, '');
  if (cleanStr.includes('1.5-pro') || cleanStr.includes('pro')) return 'gemini-1.5-pro';
  if (cleanStr.includes('1.5-flash') || cleanStr.includes('flash')) return 'gemini-1.5-flash';
  if (cleanStr.includes('2.0-flash') || cleanStr.includes('2.0')) return 'gemini-2.0-flash';
  return cleanStr || 'gemini-1.5-flash';
}

function getRazorpayKeyId() {
  return getEnv('RAZORPAY_KEY_ID', '');
}

function getRazorpayKeySecret() {
  return getEnv('RAZORPAY_KEY_SECRET', '');
}

function getRazorpayWebhookSecret() {
  return getEnv('RAZORPAY_WEBHOOK_SECRET', '');
}

function getRazorpay() {
  const key_id = getRazorpayKeyId();
  const key_secret = getRazorpayKeySecret();
  if (!key_id || !key_secret) return null;
  try {
    return new Razorpay({ key_id, key_secret });
  } catch (err) {
    console.error('[Razorpay Init Error]', err);
    return null;
  }
}

function json(res, status, body) {
  res.status(status);
  res.setHeader('Cache-Control', 'no-store');
  res.json(body);
}

function readBody(req) {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.on !== 'function') return Promise.resolve(req.body || {});
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 8e6) reject(new Error('Payload too large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : (req.body || {})); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function rawBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 8e6) reject(new Error('Payload too large')); });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function hashCode(code) { return crypto.createHash('sha256').update(String(code).trim().toUpperCase()).digest('hex'); }
function b64(v) { return Buffer.from(v).toString('base64url'); }

function signSession(payload) {
  const rawSecret = process.env.ADMIN_SESSION_SECRET || 'jyotish-vimarsha-secret-key-2026';
  const cleanSecret = String(rawSecret).trim().replace(/^["']|["']$/g, '');
  return crypto.createHmac('sha256', cleanSecret || 'jyotish-vimarsha-secret-key-2026').update(payload).digest('base64url');
}

function makeAdminToken() {
  const payload = b64(JSON.stringify({ exp: Date.now() + 4 * 60 * 60 * 1000, iat: Date.now() }));
  return `${payload}.${signSession(payload)}`;
}

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || '127.0.0.1';
}

const loginAttempts = new Map();
const auditLogs = [
  { id: 'aud_init', timestamp: new Date().toISOString(), ip: '127.0.0.1', action: 'SYSTEM_BOOT', details: 'Admin Security System active', status: 'SUCCESS' }
];

function logAudit(ip, action, details, status = 'SUCCESS') {
  const item = { id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), timestamp: new Date().toISOString(), ip, action, details, status };
  auditLogs.unshift(item);
  if (auditLogs.length > 500) auditLogs.pop();
  return item;
}

function adminOk(req) {
  let token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const idx = c.indexOf('=');
      if (idx > 0) acc[c.substring(0, idx).trim()] = c.substring(idx + 1).trim();
      return acc;
    }, {});
    token = cookies['admin_session'] || '';
  }
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = signSession(payload);
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

const inMemoryReports = loadJsonFile('reports.json', []);
const inMemoryFeedback = loadJsonFile('feedback.json', []);
const inMemoryPayments = loadJsonFile('payments.json', []);
const inMemoryVipCodes = loadJsonFile('vip_codes.json', []);
const inMemorySettings = loadJsonFile('settings.json', {
  reveal_price: '59',
  match_price: '99',
  question_price: '29',
  reveal_enabled: '1',
  match_enabled: '1',
  chat_enabled: '1',
  offer_enabled: '0',
  offer_percent: '0',
  offer_label: ''
});

function clean(s, n = 200) { return String(s || '').slice(0, n); }

async function createOrder(amount, plan, receiptCustom) {
  if (isNaN(amount) || amount < 100) {
    const err = new Error('Amount must be at least 100 paise (₹1).');
    err.statusCode = 400;
    throw err;
  }
  const rzp = getRazorpay();
  const receipt = receiptCustom || `jv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  if (!rzp) {
    return { id: `order_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, order_id: `order_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, amount, currency: 'INR', receipt, isDemo: true };
  }
  try {
    const order = await rzp.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: String(receipt).slice(0, 40),
      notes: { plan: plan || 'standard' }
    });
    return { ...order, order_id: order.id };
  } catch (err) {
    const status = err.statusCode || (err.error?.code === 'BAD_REQUEST_ERROR' ? 400 : 500);
    const errorObj = new Error(err.error?.description || err.message || 'Failed to create Razorpay order.');
    errorObj.statusCode = status;
    throw errorObj;
  }
}

const QUOTA_STORAGE_FILE = 'gemini_quota.json';
const geminiQuotaStore = loadJsonFile(QUOTA_STORAGE_FILE, {});

function getTodayUtcKey() {
  return new Date().toISOString().split('T')[0];
}

function getGeminiKeyPool(extraKey) {
  const pool = [];
  const addKey = (k) => {
    if (!k) return;
    const str = String(k).trim().replace(/^["']|["']$/g, '');
    if (str && !pool.includes(str)) pool.push(str);
  };
  addKey(extraKey);
  addKey(getEnv('GEMINI_API_KEY'));
  addKey(getEnv('GEMINI_API_KEY_1'));
  addKey(getEnv('GEMINI_API_KEY_2'));
  addKey(getEnv('GEMINI_API_KEY_3'));
  addKey(getEnv('API_KEY'));
  addKey(getEnv('GOOGLE_API_KEY'));
  const multiKeys = getEnv('GEMINI_API_KEYS');
  if (multiKeys) multiKeys.split(',').forEach(addKey);
  return pool;
}

function maskApiKey(key) {
  if (!key || key.length < 8) return '****';
  return key.slice(0, 6) + '...' + key.slice(-4);
}

function getKeyStats(key, index) {
  const today = getTodayUtcKey();
  const keyId = `key_${index + 1}_${key.slice(0, 6)}`;
  if (!geminiQuotaStore[keyId]) {
    geminiQuotaStore[keyId] = {
      index,
      label: index === 0 ? 'Primary (Key 1)' : index === 1 ? 'Secondary (Key 2)' : index === 2 ? 'Tertiary (Key 3)' : `Key ${index + 1}`,
      masked: maskApiKey(key),
      day: today,
      requestsToday: 0,
      recentTimestamps: [],
      estimatedTokensToday: 0,
      totalSuccess: 0,
      totalFailures: 0,
      exhaustedUntil: 0,
      exhaustionReason: '',
      lastUsed: null
    };
  }

  const stats = geminiQuotaStore[keyId];
  if (stats.day !== today) {
    stats.day = today;
    stats.requestsToday = 0;
    stats.estimatedTokensToday = 0;
    stats.exhaustedUntil = 0;
    stats.exhaustionReason = '';
  }

  const now = Date.now();
  stats.recentTimestamps = (stats.recentTimestamps || []).filter(t => (now - t) < 60000);
  return stats;
}

function saveQuotaStats() {
  saveJsonFile(QUOTA_STORAGE_FILE, geminiQuotaStore);
}

let activeKeyPoolIndex = 0;

function selectNextAvailableKeyIndex(pool) {
  if (!pool || pool.length === 0) return 0;
  if (pool.length === 1) return 0;

  const now = Date.now();
  const candidates = pool.map((key, idx) => {
    const stats = getKeyStats(key, idx);
    const rpm = stats.recentTimestamps.length;
    const isCoolingDown = stats.exhaustedUntil > now;
    const isRpmNearLimit = rpm >= 14;
    const isRpdNearLimit = stats.requestsToday >= 1480;
    const isHealthy = !isCoolingDown && !isRpmNearLimit && !isRpdNearLimit;
    return { idx, key, stats, rpm, isCoolingDown, isHealthy, exhaustedUntil: stats.exhaustedUntil };
  });

  if (candidates[activeKeyPoolIndex] && candidates[activeKeyPoolIndex].isHealthy) {
    return activeKeyPoolIndex;
  }

  for (let step = 1; step < pool.length; step++) {
    const nextIdx = (activeKeyPoolIndex + step) % pool.length;
    if (candidates[nextIdx] && candidates[nextIdx].isHealthy) {
      activeKeyPoolIndex = nextIdx;
      return nextIdx;
    }
  }

  candidates.sort((a, b) => a.exhaustedUntil - b.exhaustedUntil || a.rpm - b.rpm);
  activeKeyPoolIndex = candidates[0].idx;
  return activeKeyPoolIndex;
}

function recordKeyRequest(key, index, promptChars) {
  const stats = getKeyStats(key, index);
  stats.recentTimestamps.push(Date.now());
  stats.requestsToday = (stats.requestsToday || 0) + 1;
  stats.lastUsed = new Date().toISOString();
  stats.estimatedTokensToday = (stats.estimatedTokensToday || 0) + Math.ceil((promptChars || 0) / 4);
  saveQuotaStats();
}

function recordKeySuccess(key, index, responseChars) {
  const stats = getKeyStats(key, index);
  stats.totalSuccess = (stats.totalSuccess || 0) + 1;
  stats.estimatedTokensToday = (stats.estimatedTokensToday || 0) + Math.ceil((responseChars || 0) / 4);
  if (stats.exhaustedUntil <= Date.now()) stats.exhaustionReason = '';
  saveQuotaStats();
}

function recordKeyFailure(key, index, status, errorMessage) {
  const stats = getKeyStats(key, index);
  const now = Date.now();
  stats.totalFailures = (stats.totalFailures || 0) + 1;
  const msg = String(errorMessage || '').toLowerCase();
  const is429 = status === 429 || msg.includes('quota') || msg.includes('rate limit');
  const isAuth = status === 400 || status === 401 || status === 403 || msg.includes('api key');

  if (is429) {
    stats.exhaustedUntil = now + (msg.includes('daily') || stats.requestsToday >= 1450 ? 24 * 60 * 60 * 1000 : 12 * 1000);
    stats.exhaustionReason = 'Rate limit (429)';
  } else if (isAuth) {
    stats.exhaustedUntil = now + 60 * 60 * 1000;
    stats.exhaustionReason = 'Authentication / Permission error';
  } else if (status === 504 || status === 503) {
    stats.exhaustedUntil = now + 8 * 1000;
    stats.exhaustionReason = `Gateway timeout (${status})`;
  }
  saveQuotaStats();
}

async function aiCall({ model, systemText, userText, maxTokens, purpose = 'general' }) {
  const pool = getGeminiKeyPool();
  if (pool.length === 0) {
    const err = new Error('AI service is not configured. Please supply GEMINI_API_KEY.');
    err.status = 503;
    throw err;
  }

  const primaryModel = normalizeModel(getEnv('GEMINI_PRIMARY_MODEL', model || 'gemini-1.5-flash'));
  const fallbackModel = normalizeModel(getEnv('GEMINI_FALLBACK_MODEL', 'gemini-1.5-flash'));
  const promptChars = (systemText?.length || 0) + (userText?.length || 0);

  let lastErr = null;
  const attemptsMax = Math.max(pool.length * 2, 4);
  let attemptCount = 0;

  while (attemptCount < attemptsMax) {
    attemptCount++;
    const keyIdx = selectNextAvailableKeyIndex(pool);
    const chosenKey = pool[keyIdx];
    let targetModel = (attemptCount > 1 && primaryModel !== fallbackModel) ? fallbackModel : primaryModel;
    const requestedTokens = Number(maxTokens) || (purpose === 'report' ? 3000 : 2500);

    recordKeyRequest(chosenKey, keyIdx, promptChars);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), purpose === 'report' ? 50000 : 30000);

    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chosenKey },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents: [{ role: 'user', parts: [{ text: userText }] }],
          generationConfig: {
            maxOutputTokens: requestedTokens,
            temperature: purpose === 'report' ? 0.8 : 0.7
          }
        })
      });
      clearTimeout(timeout);

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const errMsg = j?.error?.message || `Gemini API returned HTTP ${r.status}`;
        recordKeyFailure(chosenKey, keyIdx, r.status, errMsg);
        activeKeyPoolIndex = (keyIdx + 1) % pool.length;
        if (attemptCount < attemptsMax) {
          await new Promise(res => setTimeout(res, Math.min(attemptCount * 500, 1500)));
          continue;
        }
        const e = new Error(errMsg); e.status = r.status; throw e;
      }

      const text = j?.candidates?.[0]?.content?.parts?.map(x => x.text || '').join('') || '';
      if (!text) throw new Error('No narrative generated by AI.');
      recordKeySuccess(chosenKey, keyIdx, text.length);
      return text;
    } catch (err) {
      clearTimeout(timeout);
      lastErr = err;
      const status = err.name === 'AbortError' ? 504 : (err.status || 500);
      recordKeyFailure(chosenKey, keyIdx, status, err.message);
      if (attemptCount < attemptsMax) {
        activeKeyPoolIndex = (keyIdx + 1) % pool.length;
        await new Promise(res => setTimeout(res, Math.min(attemptCount * 600, 1800)));
        continue;
      }
    }
  }
  throw lastErr || new Error('AI request could not be completed after rotating key pool.');
}

function writeSse(res, event, data) {
  try {
    if (res.writableEnded) return false;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch (e) {
    return false;
  }
}

async function streamGeminiOnce({ key, keyIdx, model, systemText, userText, maxTokens, purpose, res, continuationText = '' }) {
  const prompt = continuationText
    ? `${userText}\n\nCONTINUATION STATE:\nContinue from the end of the existing draft below. Do not repeat.\n\nEXISTING DRAFT:\n${continuationText.slice(-12000)}`
    : userText;
  const requestedTokens = Math.min(8192, Math.max(1600, Number(maxTokens) || 5200));
  recordKeyRequest(key, keyIdx, (systemText?.length || 0) + prompt.length);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), purpose === 'report' ? 180000 : 90000);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
  let reader = null;
  let buffer = '';
  let fullText = '';

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: requestedTokens }
      })
    });

    if (!r.ok) {
      const raw = await r.text().catch(() => '');
      let j = {}; try { j = JSON.parse(raw); } catch {}
      const msg = j?.error?.message || raw || `Gemini API returned HTTP ${r.status}`;
      recordKeyFailure(key, keyIdx, r.status, msg);
      const e = new Error(msg); e.status = r.status; throw e;
    }

    reader = r.body.getReader();
    const decoder = new TextDecoder();

    const processLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':') || !trimmed.startsWith('data:')) return;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') return;
      let obj; try { obj = JSON.parse(payload); } catch { return; }
      const parts = obj?.candidates?.[0]?.content?.parts || [];
      const chunk = parts.map(p => p?.text || '').join('');
      if (chunk) {
        fullText += chunk;
        writeSse(res, 'chunk', { text: chunk });
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) processLine(line);
    }
    buffer += decoder.decode();
    if (buffer.trim()) processLine(buffer);

    recordKeySuccess(key, keyIdx, fullText.length);
    return { text: fullText, completed: true };
  } catch (err) {
    const status = err?.name === 'AbortError' ? 504 : Number(err?.status) || 500;
    recordKeyFailure(key, keyIdx, status, err?.message || 'stream failure');
    err.status = status;
    err.partialText = fullText;
    throw err;
  } finally {
    clearTimeout(timeout);
    try { if (reader) await reader.cancel(); } catch {}
  }
}

async function streamAiCall({ model, systemText, userText, maxTokens, purpose = 'general', res }) {
  const pool = getGeminiKeyPool();
  if (!pool.length) { const e = new Error('AI service is not configured.'); e.status = 503; throw e; }

  const primary = normalizeModel(model || getEnv('GEMINI_PRIMARY_MODEL', 'gemini-1.5-flash'));
  const fallback = normalizeModel(getEnv('GEMINI_FALLBACK_MODEL', 'gemini-1.5-flash'));

  let lastError = null;
  let continuation = '';

  for (let attempt = 0; attempt < Math.max(2, pool.length); attempt++) {
    const idx = selectNextAvailableKeyIndex(pool);
    const key = pool[idx];
    const targetModel = attempt === 0 ? primary : fallback;
    try {
      writeSse(res, 'status', { state: 'connecting', keyIndex: idx + 1, attempt: attempt + 1 });
      const result = await streamGeminiOnce({ key, keyIdx: idx, model: targetModel, systemText, userText, maxTokens, purpose, res, continuationText: continuation });
      writeSse(res, 'complete', { text: result.text, keyIndex: idx + 1 });
      return result.text;
    } catch (err) {
      lastError = err;
      if (err.partialText) continuation = err.partialText;
      const status = Number(err.status) || 500;
      const retryable = status === 429 || status === 408 || status === 500 || status === 502 || status === 503 || status === 504;
      if (!retryable || attempt + 1 >= Math.max(2, pool.length)) break;
      activeKeyPoolIndex = (idx + 1) % pool.length;
      await new Promise(r => setTimeout(r, Math.min(1000 * (attempt + 1), 2500)));
    }
  }
  writeSse(res, 'error', { message: lastError?.message || 'AI streaming failed.', status: Number(lastError?.status) || 500 });
  throw lastError || new Error('AI streaming failed.');
}

export const maxDuration = 300;

export default async function handler(req, res) {
  let rawPath = req.path || (req.url ? req.url.split('?')[0] : '');
  rawPath = rawPath.replace(/^\/api\/?/, '').replace(/^\/+/, '');
  const pathParts = Array.isArray(req.query?.path) ? req.query.path : (rawPath ? rawPath.split('/').filter(Boolean) : []);
  const path = '/' + pathParts.join('/');

  try {
    if (req.method === 'GET' && path === '/health') {
      return json(res, 200, { ok: true, service: 'jyotish-vimarsha', time: new Date().toISOString() });
    }

    if (req.method === 'GET' && path === '/config') {
      const s = await getSettings();
      return json(res, 200, pricing(s));
    }

    if (req.method === 'POST' && path === '/ai-stream') {
      const b = await readBody(req);
      const pool = getGeminiKeyPool(b?.key);
      if (pool.length === 0) return json(res, 503, { error: 'AI service is not configured on the server.' });
      if (!b.systemText || !b.userText) return json(res, 400, { error: 'AI request is incomplete.' });
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Connection', 'keep-alive');
      if (typeof res.flushHeaders === 'function') res.flushHeaders();
      try {
        await streamAiCall({ model: b.model, systemText: b.systemText, userText: b.userText, maxTokens: b.maxTokens, purpose: b.purpose || 'general', res });
      } catch (e) {} finally {
        try { res.end(); } catch {}
      }
      return;
    }

    if (req.method === 'POST' && path === '/ai') {
      const b = await readBody(req);
      const pool = getGeminiKeyPool(b?.key);
      if (pool.length === 0) return json(res, 503, { error: 'AI service is not configured on the server.' });
      if (!b.systemText || !b.userText) return json(res, 400, { error: 'AI request is incomplete.' });
      try {
        const text = await aiCall(b);
        return json(res, 200, { text });
      } catch (e) {
        const status = Number(e.status) || 500;
        return json(res, status, { error: e.message || 'AI request failed' });
      }
    }

    if (req.method === 'POST' && path === '/create-order') {
      try {
        const b = await readBody(req);
        let plan = b.plan ? clean(b.plan, 20) : 'reveal';
        let amount = b.amount ? Number(b.amount) : 0;
        const receipt = b.receipt ? clean(b.receipt, 40) : '';

        if (!amount) {
          const map = { reveal: ['reveal_price', 'reveal_enabled'], match: ['match_price', 'match_enabled'], question: ['question_price', 'chat_enabled'], dakshina: ['reveal_price', 'reveal_enabled'] };
          if (!map[plan]) return json(res, 400, { error: 'Invalid plan specified.' });
          const s = await getSettings();
          
          // Bug Fix: Exact check for feature flag disabled status ('0' or false)
          const isFeatureEnabled = s[map[plan]] === '1' || s[map[plan]] === true;
          if (map[plan] && !isFeatureEnabled) {
            return json(res, 403, { error: 'This feature is currently unavailable.' });
          }
          const cfg = pricing(s);
          amount = Math.max(100, Math.round((cfg.prices[plan] || 59) * 100));
        }

        const order = await createOrder(amount, plan, receipt);
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const payRecord = {
          session_token: sessionToken,
          order_id: order.order_id || order.id,
          plan,
          amount: order.amount || amount,
          status: 'created'
        };
        inMemoryPayments.unshift(payRecord);
        saveJsonFile('payments.json', inMemoryPayments);
        try { await db.insert('payments', payRecord); } catch {}

        const activeKeyId = getRazorpayKeyId();
        return json(res, 200, {
          order_id: order.order_id || order.id,
          orderId: order.order_id || order.id,
          amount: order.amount || amount,
          currency: order.currency || 'INR',
          receipt: order.receipt || receipt,
          key_id: activeKeyId,
          keyId: activeKeyId,
          sessionToken,
          isDemo: Boolean(order.isDemo)
        });
      } catch (err) {
        return json(res, err.statusCode || 500, { error: err.message || 'Could not create payment order.' });
      }
    }

    if (req.method === 'POST' && path === '/verify-payment') {
      const b = await readBody(req);
      const razorpay_order_id = b.razorpay_order_id || b.order_id;
      const razorpay_payment_id = b.razorpay_payment_id || b.payment_id;
      const razorpay_signature = b.razorpay_signature || b.signature;
      const plan = b.plan || 'reveal';
      const sessionToken = b.sessionToken;
      const activeSecret = getRazorpayKeySecret();

      if (!razorpay_order_id || !razorpay_payment_id) {
        return json(res, 400, { success: false, verified: false, error: 'Missing required payment verification fields.' });
      }

      let row = inMemoryPayments.find(p => p.order_id === razorpay_order_id || (sessionToken && p.session_token === sessionToken));
      try {
        const rows = await db.select('payments', `select=*&order_id=eq.${encodeURIComponent(razorpay_order_id)}&limit=1`);
        if (rows?.[0]) row = rows[0];
      } catch {}

      if (razorpay_order_id.startsWith('order_mock_') || !activeSecret) {
        if (row) {
          row.status = 'verified';
          row.payment_id = razorpay_payment_id;
          saveJsonFile('payments.json', inMemoryPayments);
        }
        return json(res, 200, { success: true, verified: true, plan, order_id: razorpay_order_id, payment_id: razorpay_payment_id, isDemo: true });
      }

      if (!razorpay_signature) {
        return json(res, 400, { success: false, verified: false, error: 'Missing razorpay_signature field.' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', activeSecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const receivedBuf = Buffer.from(String(razorpay_signature), 'utf8');

      if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
        return json(res, 400, { success: false, verified: false, error: 'Payment signature verification mismatch.' });
      }

      if (row) {
        row.status = 'verified';
        row.payment_id = razorpay_payment_id;
        row.signature = razorpay_signature;
        row.verified_at = new Date().toISOString();
        saveJsonFile('payments.json', inMemoryPayments);
      }
      try {
        await db.update('payments', {
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          status: 'verified',
          verified_at: new Date().toISOString()
        }, `order_id=eq.${encodeURIComponent(razorpay_order_id)}`);
      } catch {}

      return json(res, 200, { success: true, verified: true, plan, order_id: razorpay_order_id, payment_id: razorpay_payment_id });
    }

    if (req.method === 'POST' && path === '/vip/verify') {
      const b = await readBody(req);
      const h = hashCode(b.code || '');
      try {
        const data = await db.rpc('consume_vip_code', { p_hash: h });
        if (data?.[0]?.valid) return json(res, 200, { valid: true, access: 'all' });
      } catch {}
      const memCode = inMemoryVipCodes.find(x => x.code_hash === h && x.active && x.uses < x.max_uses);
      if (memCode) {
        memCode.uses += 1;
        saveJsonFile('vip_codes.json', inMemoryVipCodes);
        return json(res, 200, { valid: true, access: 'all' });
      }
      return json(res, 403, { valid: false, error: 'Invalid or inactive VIP code.' });
    }

    if (req.method === 'POST' && path === '/feedback') {
      const b = await readBody(req);
      const name = clean(b.name || '');
      const email = clean(b.email || '');
      const message = clean(b.message || '', 5000);
      const phone = clean(b.phone || '', 60);

      if (!name || !email || !message) {
        return json(res, 400, { error: 'Please provide your name, email, and message.' });
      }
      const fb = { id: 'fb_' + Date.now(), name, email, phone, message, created_at: new Date().toISOString() };
      inMemoryFeedback.unshift(fb);
      saveJsonFile('feedback.json', inMemoryFeedback);
      try { await db.insert('feedback', { name: fb.name, email: fb.email, phone: fb.phone, message: fb.message }); } catch {}
      return json(res, 200, { ok: true, success: true, id: fb.id });
    }

    if (req.method === 'POST' && path === '/admin/login') {
      const clientIp = getClientIp(req);
      const b = await readBody(req);
      const inputPass = String(b.password ?? '').trim();
      const adminPass = process.env.ADMIN_PASSWORD || 'JyotishAdmin2026';

      if (inputPass !== adminPass) {
        logAudit(clientIp, 'LOGIN_FAILED', 'Invalid password attempt', 'FAILED');
        return json(res, 401, { error: 'Invalid admin credentials.' });
      }

      const token = makeAdminToken();
      logAudit(clientIp, 'LOGIN_SUCCESS', 'Admin authenticated', 'SUCCESS');
      res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=14400`);
      return json(res, 200, { ok: true, token, expiresIn: 14400 });
    }

    if (path.startsWith('/admin/')) {
      if (!adminOk(req)) return json(res, 401, { error: 'Unauthorized admin session' });
      const clientIp = getClientIp(req);

      if (req.method === 'GET' && path === '/admin/gemini-quota') {
        const pool = getGeminiKeyPool();
        const primaryModel = normalizeModel(getEnv('GEMINI_PRIMARY_MODEL', 'gemini-1.5-flash'));
        const fallbackModel = normalizeModel(getEnv('GEMINI_FALLBACK_MODEL', 'gemini-1.5-flash'));

        const keysSummary = pool.map((key, idx) => {
          const stats = getKeyStats(key, idx);
          return {
            index: idx + 1,
            label: stats.label,
            masked: stats.masked,
            isActive: idx === activeKeyPoolIndex,
            rpmCurrent: (stats.recentTimestamps || []).length,
            requestsToday: stats.requestsToday || 0,
            status: stats.exhaustedUntil > Date.now() ? 'COOLING_DOWN' : 'HEALTHY'
          };
        });

        return json(res, 200, {
          totalConfiguredKeys: pool.length,
          activeKeyIndex: activeKeyPoolIndex + 1,
          primaryModel,
          fallbackModel,
          keys: keysSummary
        });
      }

      if (req.method === 'GET' && path === '/admin/reports') return json(res, 200, { reports: inMemoryReports });
      if (req.method === 'GET' && path === '/admin/feedback') return json(res, 200, { feedback: inMemoryFeedback });
      if (req.method === 'GET' && path === '/admin/payments') return json(res, 200, { payments: inMemoryPayments });
      if (req.method === 'GET' && path === '/admin/vip') return json(res, 200, { codes: inMemoryVipCodes });

      if (req.method === 'POST' && path === '/admin/vip') {
        const b = await readBody(req);
        const maxUses = Number(b.maxUses) || 1;
        const assignedTo = clean(b.assignedTo || '', 100);
        const count = Math.min(100, Math.max(1, Number(b.count) || 1));
        const codes = [];

        for (let i = 0; i < count; i++) {
          const plain = b.customCode ? clean(b.customCode, 30).toUpperCase() : 'JV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
          const item = { id: 'vip_' + Date.now() + '_' + i, code_hash: hashCode(plain), display_code: plain, assigned_to: assignedTo, active: true, uses: 0, max_uses: maxUses, created_at: new Date().toISOString() };
          inMemoryVipCodes.unshift(item);
          codes.push(plain);
        }
        saveJsonFile('vip_codes.json', inMemoryVipCodes);
        return json(res, 200, { ok: true, codes });
      }

      if (req.method === 'GET' && path === '/admin/settings') {
        const s = await getSettings();
        return json(res, 200, { settings: s });
      }

      if (req.method === 'POST' && path === '/admin/settings') {
        const b = await readBody(req);
        for (const k of Object.keys(b)) inMemorySettings[k] = String(b[k]);
        saveJsonFile('settings.json', inMemorySettings);
        return json(res, 200, { ok: true });
      }
    }

    return json(res, 404, { error: 'API route not found' });
  } catch (e) {
    return json(res, e.status || 500, { error: e.message || 'Unexpected server error.' });
  }
}
