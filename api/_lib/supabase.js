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
  async rpc(fn,body){ return request(`rpc/${fn}`,{method:'POST',body:JSON.stringify(body)}); }
};
export async function getSettings(){ try { const rows=await db.select('settings','select=*&id=eq.1&limit=1'); if(rows?.[0]) return rows[0]; } catch(err){ console.warn('[AI Studio] Supabase not configured or unreachable, using default settings'); } return { id:1, reveal_price:59, match_price:99, question_price:29, reveal_enabled:true, match_enabled:true, chat_enabled:true, offer_enabled:false, offer_percent:0, offer_label:'' }; }
export function pricing(settings){ const discount=settings.offer_enabled?Math.max(0,Math.min(90,Number(settings.offer_percent)||0)):0; const p=k=>Math.max(1,Math.round(Number(settings[k]||0)*(1-discount/100))); return {currency:'INR',prices:{reveal:p('reveal_price'),match:p('match_price'),question:p('question_price')},basePrices:{reveal:Number(settings.reveal_price),match:Number(settings.match_price),question:Number(settings.question_price)},features:{reveal:!!settings.reveal_enabled,match:!!settings.match_enabled,chat:!!settings.chat_enabled},offer:{enabled:discount>0,label:settings.offer_label||'',percent:discount}}; }
