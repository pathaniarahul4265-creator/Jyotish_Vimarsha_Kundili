import fs from 'node:fs';
import path from 'node:path';

const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
function headers(extra={}) { return { apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json', ...extra }; }
async function request(path, opts={}) {
  if(!base || !key) throw new Error('Supabase is not configured on the server.');
  const r=await fetch(`${base}/rest/v1/${path}`, { ...opts, headers:headers(opts.headers||{}) });
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null;}catch{}
  if(!r.ok){const e=new Error(data?.message||data?.error_description||`Supabase request failed (${r.status})`);e.status=r.status;throw e;}
  return data;
}
export const db={
  async select(table, query='select=*'){ return request(`${table}?${query}`,{method:'GET'}); },
  async insert(table,row,returning=false){ return request(table,{method:'POST',headers:returning?{'Prefer':'return=representation'}:{},body:JSON.stringify(row)}); },
  async update(table,patch,query){ return request(`${table}?${query}`,{method:'PATCH',headers:{'Prefer':'return=minimal'},body:JSON.stringify(patch)}); },
  async delete(table,query){ return request(`${table}?${query}`,{method:'DELETE',headers:{'Prefer':'return=minimal'}}); },
  async rpc(fn,body){ return request(`rpc/${fn}`,{method:'POST',body:JSON.stringify(body)}); }
};

const DATA_DIR = path.join(process.cwd(), 'data');
function loadLocalSettings() {
  try {
    const filePath = path.join(DATA_DIR, 'settings.json');
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        id: 1,
        reveal_price: Number(parsed.reveal_price ?? 59),
        match_price: Number(parsed.match_price ?? 99),
        question_price: Number(parsed.question_price ?? 29),
        reveal_enabled: parsed.reveal_enabled === '1' || parsed.reveal_enabled === true,
        match_enabled: parsed.match_enabled === '1' || parsed.match_enabled === true,
        chat_enabled: parsed.chat_enabled === '1' || parsed.chat_enabled === true,
        offer_enabled: parsed.offer_enabled === '1' || parsed.offer_enabled === true,
        offer_percent: Number(parsed.offer_percent ?? 0),
        offer_label: String(parsed.offer_label || '')
      };
    }
  } catch (e) {}
  return null;
}

export async function getSettings(){ 
  const local = loadLocalSettings();
  try { 
    const rows = await db.select('settings','select=*&id=eq.1&limit=1'); 
    if (rows?.[0]) {
      return {
        id: 1,
        reveal_price: Number(rows[0].reveal_price ?? local?.reveal_price ?? 59),
        match_price: Number(rows[0].match_price ?? local?.match_price ?? 99),
        question_price: Number(rows[0].question_price ?? local?.question_price ?? 29),
        reveal_enabled: Boolean(rows[0].reveal_enabled ?? local?.reveal_enabled ?? true),
        match_enabled: Boolean(rows[0].match_enabled ?? local?.match_enabled ?? true),
        chat_enabled: Boolean(rows[0].chat_enabled ?? local?.chat_enabled ?? true),
        offer_enabled: Boolean(rows[0].offer_enabled ?? local?.offer_enabled ?? false),
        offer_percent: Number(rows[0].offer_percent ?? local?.offer_percent ?? 0),
        offer_label: String(rows[0].offer_label ?? local?.offer_label ?? '')
      };
    }
  } catch(err){ 
    // Supabase not configured or unreachable, use local/defaults
  } 
  return local || { id:1, reveal_price:59, match_price:99, question_price:29, reveal_enabled:true, match_enabled:true, chat_enabled:true, offer_enabled:false, offer_percent:0, offer_label:'' }; 
}

export function pricing(settings){ 
  const isOfferOn = settings.offer_enabled === true || settings.offer_enabled === '1';
  const discount = isOfferOn ? Math.max(0, Math.min(90, Number(settings.offer_percent) || 0)) : 0; 
  const p = k => Math.max(1, Math.round(Number(settings[k] || 0) * (1 - discount / 100))); 
  return {
    currency: 'INR',
    prices: {
      reveal: p('reveal_price'),
      match: p('match_price'),
      question: p('question_price')
    },
    basePrices: {
      reveal: Number(settings.reveal_price || 59),
      match: Number(settings.match_price || 99),
      question: Number(settings.question_price || 29)
    },
    features: {
      reveal: settings.reveal_enabled !== false && settings.reveal_enabled !== '0',
      match: settings.match_enabled !== false && settings.match_enabled !== '0',
      chat: settings.chat_enabled !== false && settings.chat_enabled !== '0'
    },
    offer: {
      enabled: discount > 0,
      label: settings.offer_label || '',
      percent: discount
    }
  }; 
}

