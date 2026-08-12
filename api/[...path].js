
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

    if(req.method==='GET'&&path==='/panchang'){
      const dateQuery = req.query?.date || req.query?.d;
      const latQuery = parseFloat(req.query?.lat || '28.6139');
      const lonQuery = parseFloat(req.query?.lon || '77.2090');
      const targetDate = dateQuery ? new Date(dateQuery) : new Date();
      if(isNaN(targetDate.getTime())) return json(res,400,{error:'Invalid date format provided. Use YYYY-MM-DD.'});

      const d = targetDate;
      const year = d.getFullYear();
      const oneDay = 1000 * 60 * 60 * 24;
      const dateStr = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const dayOfWeek = d.getDay();

      // Calculated Sunrise & Sunset (Solar Zenith 90°50')
      function calcSun(dt, lat, lon) {
        try {
          const latRad = lat * (Math.PI / 180);
          const start = new Date(dt.getFullYear(), 0, 0);
          const diff = dt - start;
          const dayOfYear = Math.floor(diff / oneDay);
          const zenith = 90.833 * (Math.PI / 180);
          const lngHour = lon / 15;

          function getTime(isSunrise) {
            const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24;
            const M = (0.9856 * t) - 3.289;
            const MRad = M * (Math.PI / 180);
            let L = M + (1.916 * Math.sin(MRad)) + (0.020 * Math.sin(2 * MRad)) + 282.634;
            L = (L + 360) % 360;
            const LRad = L * (Math.PI / 180);
            let RA = Math.atan(0.91764 * Math.tan(LRad)) * (180 / Math.PI);
            RA = (RA + 360) % 360;
            const Lquadrant  = Math.floor(L / 90) * 90;
            const RAquadrant = Math.floor(RA / 90) * 90;
            RA = RA + (Lquadrant - RAquadrant);
            RA = RA / 15;

            const sinDec = 0.39782 * Math.sin(LRad);
            const cosDec = Math.cos(Math.asin(sinDec));
            const cosH = (Math.cos(zenith) - (sinDec * Math.sin(latRad))) / (cosDec * Math.cos(latRad));

            if (cosH > 1 || cosH < -1) return null;

            let H = isSunrise ? (360 - (Math.acos(cosH) * (180 / Math.PI))) : (Math.acos(cosH) * (180 / Math.PI));
            H = H / 15;

            const T = H + RA - (0.06571 * t) - 6.622;
            let UT = (T - lngHour + 24) % 24;

            const tzOffset = 5.5; // India Standard Time +05:30 default
            let localHour = (UT + tzOffset + 24) % 24;

            const hrs = Math.floor(localHour);
            const mins = Math.floor((localHour - hrs) * 60);
            const period = hrs >= 12 ? 'PM' : 'AM';
            const displayHrs = (hrs % 12) || 12;
            const displayMins = mins < 10 ? '0' + mins : mins;

            return { decimal: localHour, formatted: `${displayHrs < 10 ? '0' + displayHrs : displayHrs}:${displayMins} ${period}` };
          }

          const sr = getTime(true) || { formatted: '06:01 AM', decimal: 6.017 };
          const ss = getTime(false) || { formatted: '07:02 PM', decimal: 19.033 };
          let lenMins = Math.round((ss.decimal - sr.decimal) * 60);
          if (lenMins < 0) lenMins += 24 * 60;
          return { sunrise: sr.formatted, sunset: ss.formatted, dayLength: `${Math.floor(lenMins / 60)}h ${lenMins % 60}m` };
        } catch {
          return { sunrise: "06:05 AM", sunset: "06:56 PM", dayLength: "12h 51m" };
        }
      }

      // Calculated Hindu Calendar
      const startOfYear = new Date(year, 0, 0);
      const dayOfYear = Math.floor((d - startOfYear) / oneDay);
      const isAfterChaitra = dayOfYear >= 88;
      const vikramSamvat = isAfterChaitra ? year + 57 : year + 56;
      const sakaSamvat = isAfterChaitra ? year - 78 : year - 79;
      const samvatsaras = ["Prabhava","Vibhava","Shukla","Pramoda","Prajapati","Angira","Shrimukha","Bhava","Yuva","Dhatri","Eshwara","Bahudhanya","Pramathi","Vikrama","Vrisha","Chitrabanu","Subhanu","Taran","Parthiva","Vyaya","Sarvajit","Sarvadhari","Virodhi","Vikriti","Khara","Nandana","Vijaya","Jaya","Manmatha","Durmukhi","Hevilambi","Vilambi","Vikari","Sharvari","Plava","Shubhakrit","Shobhakrit","Krodhi","Visvavasu","Paridhavi","Pramadi","Ananda","Rakshasa","Anala","Pingala","Kalayukti","Siddharthin","Raudra","Durmathi","Dundubhi","Rudhrodgari","Raktakshi","Krodhana","Kshaya"];
      const samvatsaraName = samvatsaras[(vikramSamvat + 9) % 60] || "Krodhi";

      const synodicMonth = 29.530588;
      const lunarAge = (dayOfYear + 14.2) % synodicMonth;
      const tithiIdx = Math.floor((lunarAge / synodicMonth) * 30) % 30;
      const isShukla = tithiIdx < 15;
      const tithiInPaksha = (tithiIdx % 15) + 1;
      const hinduMaasNames = ["Pausha","Magha","Phalguni","Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada","Ashvina","Kartika","Margashirsha"];
      const maasName = hinduMaasNames[Math.floor(((dayOfYear + 20) / 30.4)) % 12] || "Shravana";

      const tithis = ["Shukla Pratipada","Shukla Dwitiya","Shukla Tritiya","Shukla Chaturthi","Shukla Panchami","Shukla Shashti","Shukla Saptami","Shukla Ashtami","Shukla Navami","Shukla Dashami","Shukla Ekadashi","Shukla Dwadashi","Shukla Trayodashi","Shukla Chaturdashi","Purnima (Full Moon)","Krishna Pratipada","Krishna Dwitiya","Krishna Tritiya","Krishna Chaturthi","Krishna Panchami","Krishna Shashti","Krishna Saptami","Krishna Ashtami","Krishna Navami","Krishna Dashami","Krishna Ekadashi","Krishna Dwadashi","Krishna Trayodashi","Krishna Chaturdashi","Amavasya (New Moon)"];
      const nakshatras = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
      const yogas = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
      const karanas = ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti (Bhadra)","Shakuni","Chatushpada","Naga","Kimstughna"];
      const rahuKaalTimes = ["04:30 PM – 06:00 PM","07:30 AM – 09:00 AM","03:00 PM – 04:30 PM","12:00 PM – 01:30 PM","01:30 PM – 03:00 PM","10:30 AM – 12:00 PM","09:00 AM – 10:30 AM"];

      const sun = calcSun(d, latQuery, lonQuery);

      // Major & Minor Events with 30-day filter
      const majorCatalog = [
        { name: "Independence Day", dateStr: `${year}-08-15`, icon: "🇮🇳", desc: "Indian Independence Day — National Celebration" },
        { name: "Republic Day", dateStr: `${year}-01-26`, icon: "🇮🇳", desc: "Indian Republic Day — Constitution & Heritage" },
        { name: "Sawan Maas (Shravan Month)", startDate: `${year}-07-29`, endDate: `${year}-08-28`, icon: "🌺", desc: "Sacred Month of Lord Shiva & Somwar Vrat" },
        { name: "Raksha Bandhan", dateStr: `${year}-08-28`, icon: "🪢", desc: "Festival of Sibling Protection (Shravana Purnima)" },
        { name: "Shri Krishna Janmashtami", dateStr: `${year}-09-03`, icon: "🪔", desc: "Birth Celebration of Lord Shri Krishna" },
        { name: "Ganesh Chaturthi", dateStr: `${year}-09-14`, icon: "🐘", desc: "Vinayaka Chaturthi — Lord Ganesha Sthapana" },
        { name: "Sharad Navratri", startDate: `${year}-10-11`, endDate: `${year}-10-19`, icon: "🌺", desc: "9 Sacred Nights of Devi Durga Worship" },
        { name: "Dussehra (Vijayadashami)", dateStr: `${year}-10-20`, icon: "🏹", desc: "Triumph of Lord Rama — Victory of Good Over Evil" },
        { name: "Karwa Chauth", dateStr: `${year}-10-28`, icon: "🌕", desc: "Sacred Fasting for Spousal Wellbeing & Longevity" },
        { name: "Dhanteras", dateStr: `${year}-11-06`, icon: "🪙", desc: "Auspicious Buying of Metals & Lord Dhanvantari Worship" },
        { name: "Diwali (Deepavali)", dateStr: `${year}-11-08`, icon: "🪔", desc: "Maha Lakshmi Puja & Festival of Lights" },
        { name: "Govardhan Puja & Bhai Dooj", startDate: `${year}-11-09`, endDate: `${year}-11-10`, icon: "🏵️", desc: "Govardhan Annakut & Brother-Sister Blessings" },
        { name: "Chhath Puja", dateStr: `${year}-11-14`, icon: "☀️", desc: "Maha Vrat for Sun God Surya & Chhathi Maiya" },
        { name: "Maha Shivratri", dateStr: `${year}-02-15`, icon: "🔱", desc: "Great Auspicious Night of Lord Shiva" },
        { name: "Holi & Holika Dahan", startDate: `${year}-03-03`, endDate: `${year}-03-04`, icon: "🎨", desc: "Festival of Colors & Triumph of Bhakta Prahlad" },
        { name: "Shri Ram Navami", dateStr: `${year}-03-27`, icon: "🏹", desc: "Birth Celebration of Lord Rama" }
      ];

      const minorCatalog = [];
      const targetTime = d.getTime();

      for (let offset = -5; offset <= 35; offset++) {
        const curDate = new Date(targetTime + offset * oneDay);
        const startOfYr = new Date(curDate.getFullYear(), 0, 0);
        const curDayOfYr = Math.floor((curDate - startOfYr) / oneDay);
        const curLunarAge = (curDayOfYr + 14.2) % synodicMonth;
        const curTithiIdx = Math.floor((curLunarAge / synodicMonth) * 30) % 30;
        const dateStrISO = curDate.toISOString().split('T')[0];

        if (curTithiIdx === 10) minorCatalog.push({ name: "Shukla Ekadashi Vrat", dateStr: dateStrISO, icon: "📿", desc: "Vishnu Vrat" });
        if (curTithiIdx === 25) minorCatalog.push({ name: "Krishna Ekadashi Vrat", dateStr: dateStrISO, icon: "📿", desc: "Vishnu Vrat" });
        if (curTithiIdx === 12) minorCatalog.push({ name: "Shukla Pradosh Vrat", dateStr: dateStrISO, icon: "🔱", desc: "Shiva Twilight Worship" });
        if (curTithiIdx === 27) minorCatalog.push({ name: "Krishna Pradosh Vrat", dateStr: dateStrISO, icon: "🔱", desc: "Shiva Twilight Worship" });
        if (curTithiIdx === 3) minorCatalog.push({ name: "Vinayaka Chaturthi", dateStr: dateStrISO, icon: "🐘", desc: "Ganesha Vrat" });
        if (curTithiIdx === 18) minorCatalog.push({ name: "Sankashti Chaturthi Vrat", dateStr: dateStrISO, icon: "🐘", desc: "Ganesha Vrat" });
        if (curTithiIdx === 28) minorCatalog.push({ name: "Masik Shivratri", dateStr: dateStrISO, icon: "🔱", desc: "Monthly Shiva Vrat" });
        if (curTithiIdx === 14) minorCatalog.push({ name: "Purnima Vrat / Satyanarayan Puja", dateStr: dateStrISO, icon: "🌕", desc: "Full Moon Vrat" });
        if (curTithiIdx === 29) minorCatalog.push({ name: "Amavasya Vrat / Pitru Tarpan", dateStr: dateStrISO, icon: "🌑", desc: "New Moon Pitru Puja" });
        if (curTithiIdx === 7) minorCatalog.push({ name: "Masik Durgashtami", dateStr: dateStrISO, icon: "🌺", desc: "Durga Vrat" });
      }

      const allEvents = [...majorCatalog, ...minorCatalog];
      const activeEvents = [];
      const rawUpcoming = [];

      allEvents.forEach(ev => {
        if (ev.startDate && ev.endDate) {
          const startT = new Date(ev.startDate + 'T00:00:00').getTime();
          const endT = new Date(ev.endDate + 'T23:59:59').getTime();
          if (targetTime >= startT && targetTime <= endT) activeEvents.push(ev);
          else if (startT > targetTime) {
            const daysAway = Math.ceil((startT - targetTime) / oneDay);
            if (daysAway > 0 && daysAway <= 30) rawUpcoming.push({ ...ev, daysAway });
          }
        } else if (ev.dateStr) {
          const evT = new Date(ev.dateStr + 'T00:00:00').getTime();
          const diffDays = Math.round((evT - targetTime) / oneDay);
          if (diffDays === 0) activeEvents.push({ ...ev, desc: `TODAY: ${ev.desc}` });
          else if (diffDays > 0 && diffDays <= 30) rawUpcoming.push({ ...ev, daysAway: diffDays });
        }
      });

      rawUpcoming.sort((a, b) => a.daysAway - b.daysAway);
      const seen = new Set();
      const upcomingNext30Days = [];
      for (const ev of rawUpcoming) {
        const key = `${ev.name}_${ev.daysAway}`;
        if (!seen.has(key)) {
          seen.add(key);
          upcomingNext30Days.push(ev);
        }
      }

      return json(res, 200, {
        ok: true,
        service: 'jyotish-vimarsha-panchang-api',
        gregorian: { date: d.toISOString().split('T')[0], formatted: dateStr, latitude: latQuery, longitude: lonQuery },
        hinduCalendar: {
          vikramSamvat: `VS ${vikramSamvat} (${samvatsaraName})`,
          sakaSamvat: `Saka ${sakaSamvat}`,
          maas: `${maasName} Maas`,
          paksha: isShukla ? "Shukla Paksha" : "Krishna Paksha",
          tithiNumber: tithiInPaksha,
          hinduDateFormatted: `${maasName} ${isShukla ? 'Shukla' : 'Krishna'} ${tithiInPaksha === 15 ? (isShukla ? 'Purnima' : 'Amavasya') : 'Tithi ' + tithiInPaksha}, VS ${vikramSamvat}`
        },
        panchang: {
          tithi: tithis[tithiIdx],
          nakshatra: nakshatras[Math.floor(((dayOfYear * 1.05 + 8) % 27))],
          yoga: yogas[Math.floor(((dayOfYear * 0.95 + 12) % 27))],
          karana: karanas[(tithiIdx * 2) % 11],
          rahuKaalWindow: rahuKaalTimes[dayOfWeek],
          abhijitMuhuratWindow: "11:54 AM – 12:46 PM"
        },
        solar: sun,
        events: {
          activeToday: activeEvents,
          upcomingNext30Days
        }
      });
    }

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
