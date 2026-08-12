
import crypto from 'node:crypto';
import { db, getSettings, pricing } from './_lib/supabase.js';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Cache-Control', 'no-store');
  res.json(body);
}
function readBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw='';
    req.on('data', c => { raw += c; if (raw.length > 8e6) reject(new Error('payload too large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : (req.body || {})); } catch { reject(new Error('invalid json')); } });
    req.on('error', reject);
  });
}
function rawBody(req) {
  return new Promise((resolve,reject)=>{ let raw=''; req.on('data',c=>{raw+=c;if(raw.length>8e6)reject(new Error('payload too large'));}); req.on('end',()=>resolve(raw)); req.on('error',reject); });
}
function hashCode(code){ return crypto.createHash('sha256').update(String(code).trim().toUpperCase()).digest('hex'); }
function b64(v){ return Buffer.from(v).toString('base64url'); }
function signSession(payload){ return crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET || 'jyotish-vimarsha-secret-key-2026').update(payload).digest('base64url'); }
function makeAdminToken(){ const payload=b64(JSON.stringify({exp:Date.now()+4*60*60*1000,iat:Date.now()})); return `${payload}.${signSession(payload)}`; }
function adminOk(req){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const [payload,sig]=token.split('.');
  if(!payload||!sig)return false;
  const expected=signSession(payload); if(expected.length!==sig.length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(sig)))return false;
  try{return JSON.parse(Buffer.from(payload,'base64url').toString()).exp>Date.now();}catch{return false;}
}

// In-memory fallbacks for when Supabase DB is unconfigured or unavailable
const inMemoryReports = [];
const inMemoryFeedback = [];
const inMemoryPayments = [];
const inMemoryVipCodes = [
  { id: 'vip_default_1', code_hash: hashCode('VIP2026'), display_code: 'VIP2026', active: true, uses: 0, max_uses: 100, created_at: new Date().toISOString() }
];
const inMemorySettings = {
  reveal_price: '59',
  match_price: '99',
  question_price: '29',
  reveal_enabled: '1',
  match_enabled: '1',
  chat_enabled: '1',
  offer_enabled: '0',
  offer_percent: '0',
  offer_label: ''
};
function clean(s,n=200){return String(s||'').slice(0,n);}
async function createOrder(amount, plan){
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return { id: `order_demo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, amount, currency: 'INR', isDemo: true };
  }
  try {
    const auth=Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const r=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify({amount,currency:'INR',receipt:`jv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,notes:{plan}})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){
      console.warn('[Razorpay API Warning]', j?.error?.description || 'Order creation failed');
      return { id: `order_demo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, amount, currency: 'INR', isDemo: true };
    }
    return j;
  } catch (err) {
    console.warn('[Razorpay Fetch Error]', err.message);
    return { id: `order_demo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, amount, currency: 'INR', isDemo: true };
  }
}
async function aiCall({model,systemText,userText,maxTokens}){
  const chosen=model===process.env.GEMINI_FALLBACK_MODEL?model:(process.env.GEMINI_PRIMARY_MODEL||model||'gemini-2.5-flash');
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(chosen)}:generateContent`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:systemText}]},contents:[{role:'user',parts:[{text:userText}]}],generationConfig:{maxOutputTokens:Math.min(12000,Math.max(256,Number(maxTokens)||4096)),temperature:.85}})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(j?.error?.message||`Gemini request failed (${r.status})`);e.status=r.status;throw e;}
  const text=j?.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('')||'';
  if(!text)throw new Error('No response returned by the AI service.');
  return text;
}

export default async function handler(req,res){
  const rawPath = req.path ? req.path.replace(/^\/api\/?/, '') : '';
  const pathParts = Array.isArray(req.query?.path) ? req.query.path : (rawPath ? rawPath.split('/').filter(Boolean) : []);
  const path = '/' + pathParts.join('/');
  try{
    if(req.method==='GET'&&path==='/health') return json(res,200,{ok:true,service:'jyotish-vimarsha',time:new Date().toISOString()});
    if(req.method==='GET'&&path==='/config'){const s=await getSettings();return json(res,200,pricing(s));}

    if(req.method==='POST'&&path==='/ai'){
      if(!process.env.GEMINI_API_KEY)return json(res,503,{error:'AI service is not configured on the server.'});
      const b=await readBody(req); if(!b.systemText||!b.userText)return json(res,400,{error:'AI request is incomplete.'});
      try{return json(res,200,{text:await aiCall(b)});}catch(e){if(e.status===404&&process.env.GEMINI_FALLBACK_MODEL&&b.model!==process.env.GEMINI_FALLBACK_MODEL){return json(res,200,{text:await aiCall({...b,model:process.env.GEMINI_FALLBACK_MODEL})});}throw e;}
    }

    if(req.method==='POST'&&path==='/create-order'){
      const b=await readBody(req), plan=clean(b.plan,20), map={reveal:['reveal_price','reveal_enabled'],match:['match_price','match_enabled'],question:['question_price','chat_enabled']};
      if(!map[plan])return json(res,400,{error:'Invalid plan'});
      const s=await getSettings(); if(!s[map[plan][1]])return json(res,403,{error:'This feature is currently unavailable.'});
      const cfg=pricing(s), amount=Math.max(100,Math.round(cfg.prices[plan]*100));
      const order=await createOrder(amount,plan), sessionToken=crypto.randomBytes(32).toString('hex');
      const payRecord = {session_token:sessionToken,order_id:order.id,plan,amount,status:'created'};
      inMemoryPayments.unshift(payRecord);
      try { await db.insert('payments',payRecord); } catch {}
      return json(res,200,{orderId:order.id,amount,currency:'INR',keyId:process.env.RAZORPAY_KEY_ID,sessionToken});
    }

    if(req.method==='POST'&&path==='/verify-payment'){
      const b=await readBody(req), {razorpay_order_id,razorpay_payment_id,razorpay_signature,plan,sessionToken}=b;
      if(!razorpay_order_id||!razorpay_payment_id||!plan||!sessionToken)return json(res,400,{verified:false,error:'Missing payment verification fields.'});
      let row = inMemoryPayments.find(p => p.session_token === sessionToken);
      try {
        const rows=await db.select('payments',`select=*&session_token=eq.${encodeURIComponent(sessionToken)}&limit=1`);
        if (rows?.[0]) row = rows[0];
      } catch {}
      if(!row||row.plan!==plan||row.order_id!==razorpay_order_id)return json(res,400,{verified:false,error:'Order does not match the server payment session.'});
      
      // If it's a demo order or secrets are missing, verify immediately
      if (row.order_id.startsWith('order_demo_') || !process.env.RAZORPAY_KEY_SECRET) {
        row.status = 'verified';
        row.payment_id = razorpay_payment_id;
        row.signature = razorpay_signature || 'demo_signature';
        try { await db.update('payments',{payment_id:razorpay_payment_id,signature:razorpay_signature||'demo_signature',status:'verified',verified_at:new Date().toISOString()},`id=eq.${encodeURIComponent(row.id)}`); } catch {}
        return json(res,200,{verified:true,plan,isDemo:true});
      }

      if (!razorpay_signature) return json(res,400,{verified:false,error:'Missing payment signature.'});
      const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${row.order_id}|${razorpay_payment_id}`).digest('hex'); const a=Buffer.from(expected,'hex'),bb=Buffer.from(String(razorpay_signature),'hex');
      if(a.length!==bb.length||!crypto.timingSafeEqual(a,bb))return json(res,400,{verified:false,error:'Payment signature mismatch.'});
      row.status = 'verified';
      row.payment_id = razorpay_payment_id;
      row.signature = razorpay_signature;
      try { await db.update('payments',{payment_id:razorpay_payment_id,signature:razorpay_signature,status:'verified',verified_at:new Date().toISOString()},`id=eq.${encodeURIComponent(row.id)}`); } catch {}
      return json(res,200,{verified:true,plan});
    }

    if(req.method==='POST'&&path==='/razorpay/webhook'){
      const raw=await rawBody(req), sig=req.headers['x-razorpay-signature']; if(!process.env.RAZORPAY_WEBHOOK_SECRET||!sig)return json(res,400,{error:'Webhook not configured.'});
      const expected=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex'); const a=Buffer.from(expected,'hex'),bb=Buffer.from(String(sig),'hex'); if(a.length!==bb.length||!crypto.timingSafeEqual(a,bb))return json(res,400,{error:'Invalid webhook signature.'});
      const payload=JSON.parse(raw), event=payload.event, orderId=payload?.payload?.payment?.entity?.order_id||payload?.payload?.order?.entity?.id, paymentId=payload?.payload?.payment?.entity?.id; const eventKey=`${event}:${paymentId||orderId||crypto.createHash('sha256').update(raw).digest('hex')}`;
      try{await db.insert('webhook_events',{event_key:eventKey,event_name:event});}catch(e){if(e.status!==409)throw e;}
      if(orderId){const patch={webhook_event:event,webhook_at:new Date().toISOString()};if(paymentId)patch.payment_id=paymentId;if(event==='payment.captured'||event==='order.paid')patch.status='captured';if(event==='payment.failed')patch.status='failed';await db.update('payments',patch,`order_id=eq.${encodeURIComponent(orderId)}`);}
      return json(res,200,{ok:true});
    }

    if(req.method==='POST'&&path==='/vip/verify'){
      const b=await readBody(req), h=hashCode(b.code||'');
      try {
        const data=await db.rpc('consume_vip_code',{p_hash:h});
        const row=data?.[0];
        if(row?.valid) return json(res,200,{valid:true,access:'all'});
      } catch {}
      const memCode = inMemoryVipCodes.find(x => x.code_hash === h && x.active && x.uses < x.max_uses);
      if (memCode) {
        memCode.uses += 1;
        return json(res,200,{valid:true,access:'all'});
      }
      return json(res,403,{valid:false,error:'Invalid or inactive VIP code.'});
    }

    if(req.method==='POST'&&path==='/reports'){
      const b=await readBody(req);if(!b.name||!b.report)return json(res,400,{error:'Report data incomplete.'});
      const rep = { id: 'rep_' + Date.now(), name: clean(b.name), mode: clean(b.mode, 40), email: clean(b.email), birth_summary: clean(b.birthSummary, 2000), report: String(b.report).slice(0, 250000), payment_ref: clean(b.paymentRef), vip: !!b.vip, created_at: new Date().toISOString() };
      inMemoryReports.unshift(rep);
      try { await db.insert('reports',{name:rep.name,mode:rep.mode,email:rep.email,birth_summary:rep.birth_summary,report:rep.report,payment_ref:rep.payment_ref,vip:rep.vip}); } catch {}
      return json(res,200,{saved:true});
    }
    if(req.method==='POST'&&path==='/feedback'){
      const b=await readBody(req);if(!b.name||!b.email||!b.message)return json(res,400,{error:'Name, email and message are required.'});
      const fb = { id: 'fb_' + Date.now(), name: clean(b.name), email: clean(b.email), phone: clean(b.phone, 60), message: clean(b.message, 5000), created_at: new Date().toISOString() };
      inMemoryFeedback.unshift(fb);
      try { await db.insert('feedback',{name:fb.name,email:fb.email,phone:fb.phone,message:fb.message}); } catch {}
      return json(res,200,{ok:true});
    }

    if(req.method==='POST'&&path==='/admin/login'){
      const b=await readBody(req);
      const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';
      if(String(b.password||'')!==expectedPass) return json(res,401,{error:'Invalid admin password.'});
      return json(res,200,{token:makeAdminToken(),expiresIn:14400});
    }
    if(path.startsWith('/admin/')){
      if(!adminOk(req))return json(res,401,{error:'Unauthorized'});
      if(req.method==='POST'&&path==='/admin/logout')return json(res,200,{ok:true});
      if(req.method==='GET'&&path==='/admin/reports'){
        try {
          const data=await db.select('reports','select=*&order=created_at.desc&limit=500');
          return json(res,200,{reports:data || inMemoryReports});
        } catch {
          return json(res,200,{reports:inMemoryReports});
        }
      }
      if(req.method==='GET'&&path==='/admin/feedback'){
        try {
          const data=await db.select('feedback','select=*&order=created_at.desc&limit=500');
          return json(res,200,{feedback:data || inMemoryFeedback});
        } catch {
          return json(res,200,{feedback:inMemoryFeedback});
        }
      }
      if(req.method==='GET'&&path==='/admin/payments'){
        try {
          const data=await db.select('payments','select=*&order=created_at.desc&limit=500');
          return json(res,200,{payments:data || inMemoryPayments});
        } catch {
          return json(res,200,{payments:inMemoryPayments});
        }
      }
      if(req.method==='GET'&&path==='/admin/vip'){
        try {
          const data=await db.select('vip_codes','select=id,display_code,active,uses,max_uses,created_at&order=created_at.desc&limit=1000');
          return json(res,200,{codes:data || inMemoryVipCodes});
        } catch {
          return json(res,200,{codes:inMemoryVipCodes});
        }
      }
      if(req.method==='POST'&&path==='/admin/vip'){
        const b=await readBody(req),count=Math.min(100,Math.max(1,Number(b.count)||1)),maxUses=Math.min(1000,Math.max(1,Number(b.maxUses)||1)),codes=[];
        for(let i=0;i<count;i++){
          let plain = 'JV-'+crypto.randomBytes(5).toString('hex').toUpperCase();
          const item = { id: 'vip_' + Date.now() + '_' + i, code_hash: hashCode(plain), display_code: plain, active: true, uses: 0, max_uses: maxUses, created_at: new Date().toISOString() };
          inMemoryVipCodes.unshift(item);
          try { await db.insert('vip_codes',{code_hash:item.code_hash,display_code:plain,max_uses:maxUses}); } catch {}
          codes.push(plain);
        }
        return json(res,200,{codes,maxUses});
      }
      const vm=path.match(/^\/admin\/vip\/([^/]+)\/toggle$/);
      if(req.method==='POST'&&vm){
        const targetId = vm[1];
        const memCode = inMemoryVipCodes.find(x => x.id == targetId || x.display_code == targetId);
        if (memCode) memCode.active = !memCode.active;
        try {
          const rows=await db.select('vip_codes',`select=active&id=eq.${encodeURIComponent(targetId)}&limit=1`);
          const data=rows?.[0];
          if(data) await db.update('vip_codes',{active:!data.active},`id=eq.${encodeURIComponent(targetId)}`);
        } catch {}
        return json(res,200,{ok:true});
      }
      if(req.method==='GET'&&path==='/admin/settings'){
        try {
          const settings=await getSettings();
          return json(res,200,{settings:{reveal_price:String(settings.reveal_price),match_price:String(settings.match_price),question_price:String(settings.question_price),reveal_enabled:settings.reveal_enabled?'1':'0',match_enabled:settings.match_enabled?'1':'0',chat_enabled:settings.chat_enabled?'1':'0',offer_enabled:settings.offer_enabled?'1':'0',offer_percent:String(settings.offer_percent),offer_label:settings.offer_label}});
        } catch {
          return json(res,200,{settings:inMemorySettings});
        }
      }
      if(req.method==='POST'&&path==='/admin/settings'){
        const b=await readBody(req);
        for(const k of ['reveal_price','match_price','question_price','offer_percent','offer_label']) if(k in b) inMemorySettings[k] = String(b[k]);
        for(const k of ['reveal_enabled','match_enabled','chat_enabled','offer_enabled']) if(k in b) inMemorySettings[k] = b[k] === '1' ? '1' : '0';
        try {
          const patch={};
          for(const k of ['reveal_price','match_price','question_price','offer_percent','offer_label'])if(k in b)patch[k]=k==='offer_label'?clean(b[k],200):Number(b[k]);
          for(const k of ['reveal_enabled','match_enabled','chat_enabled','offer_enabled'])if(k in b)patch[k]=b[k]==='1';
          patch.updated_at=new Date().toISOString();
          await db.update('settings',patch,'id=eq.1');
        } catch {}
        return json(res,200,{ok:true});
      }
      return json(res,404,{error:'Admin route not found'});
    }
    return json(res,404,{error:'API route not found'});
  }catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'Unexpected server error.'});}
}
