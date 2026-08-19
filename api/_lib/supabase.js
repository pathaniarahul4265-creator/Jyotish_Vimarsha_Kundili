/**
 * Supabase Client & Local Persistence Fallback for Jyotish Vimarsha
 */

import fs from 'node:fs';
import path from 'node:path';

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

export const db = {
  async select(table, queryParams = '') {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return loadJsonFile(`${table}.json`, []);
    try {
      const endpoint = `${url}/rest/v1/${table}${queryParams ? `?${queryParams}` : ''}`;
      const res = await fetch(endpoint, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return loadJsonFile(`${table}.json`, []);
  },

  async insert(table, record) {
    const list = loadJsonFile(`${table}.json`, []);
    list.unshift(record);
    saveJsonFile(`${table}.json`, list);

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return record;
    try {
      const endpoint = `${url}/rest/v1/${table}`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(record)
      });
    } catch (e) {}
    return record;
  },

  async update(table, patch, filter) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return;
    try {
      const endpoint = `${url}/rest/v1/${table}?${filter}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patch)
      });
    } catch (e) {}
  },

  async delete(table, filter) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return;
    try {
      const endpoint = `${url}/rest/v1/${table}?${filter}`;
      await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
    } catch (e) {}
  },

  async rpc(funcName, params) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    try {
      const endpoint = `${url}/rest/v1/rpc/${funcName}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }
};

export async function getSettings() {
  try {
    const rows = await db.select('settings', 'id=eq.1&limit=1');
    if (rows && rows[0]) return rows[0];
  } catch (e) {}
  return inMemorySettings;
}

export function pricing(s = {}) {
  const basePrices = {
    reveal: Number(s.reveal_price) || 59,
    match: Number(s.match_price) || 99,
    question: Number(s.question_price) || 29
  };
  const isOffer = s.offer_enabled === '1' && Number(s.offer_percent) > 0;
  const pct = isOffer ? Math.min(90, Math.max(0, Number(s.offer_percent))) : 0;
  const discount = (p) => isOffer ? Math.max(1, Math.round(p * (1 - pct / 100))) : p;
  return {
    prices: {
      reveal: discount(basePrices.reveal),
      match: discount(basePrices.match),
      question: discount(basePrices.question)
    },
    basePrices,
    offer: {
      enabled: isOffer,
      percent: pct,
      label: s.offer_label || ''
    },
    features: {
      reveal: s.reveal_enabled !== '0',
      match: s.match_enabled !== '0',
      chat: s.chat_enabled !== '0'
    }
  };
}

export default { db, getSettings, pricing };
