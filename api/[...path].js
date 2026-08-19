// Candidate model priority list for automatic 404 recovery
const SUPPORTED_MODELS_WATERFALL = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash'
];

export function normalizeModel(m) {
  if (!m) return 'gemini-2.0-flash';
  // Strip any leading 'models/' or URL encoding
  let cleanStr = String(m).trim().toLowerCase().replace(/^models[\/_]/i, '').replace(/%2f/gi, '');
  
  if (cleanStr.includes('2.0') || cleanStr.includes('2.0-flash')) return 'gemini-2.0-flash';
  if (cleanStr.includes('1.5-pro') || cleanStr.includes('pro')) return 'gemini-1.5-pro-latest';
  if (cleanStr.includes('1.5-flash') || cleanStr.includes('flash')) return 'gemini-2.0-flash';
  if (cleanStr.includes('2.5')) return 'gemini-2.5-flash';
  
  return cleanStr || 'gemini-2.0-flash';
}

async function streamGeminiOnce({ key, keyIdx, model, systemText, userText, maxTokens, purpose, res, continuationText = '' }) {
  const prompt = continuationText
    ? `${userText}\n\nCONTINUATION STATE:\nContinue from the end of the existing draft below. Do not repeat.\n\nEXISTING DRAFT:\n${continuationText.slice(-12000)}`
    : userText;
  const requestedTokens = Math.min(8192, Math.max(1600, Number(maxTokens) || 5200));
  recordKeyRequest(key, keyIdx, (systemText?.length || 0) + prompt.length);

  // Clean model identifier: ensure no 'models/' prefix
  const cleanModelName = String(model || 'gemini-2.0-flash').replace(/^models\//i, '').trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), purpose === 'report' ? 180000 : 90000);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModelName)}:streamGenerateContent?alt=sse`;
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
      const e = new Error(msg); 
      e.status = r.status;
      e.isModelNotFound = r.status === 404 || msg.includes('not found') || msg.includes('not supported');
      throw e;
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

  let currentModel = normalizeModel(model || getEnv('GEMINI_PRIMARY_MODEL', 'gemini-2.0-flash'));
  let modelWaterfallIdx = 0;
  let lastError = null;
  let continuation = '';

  for (let attempt = 0; attempt < Math.max(3, pool.length); attempt++) {
    const idx = selectNextAvailableKeyIndex(pool);
    const key = pool[idx];

    try {
      writeSse(res, 'status', { state: 'connecting', keyIndex: idx + 1, attempt: attempt + 1, model: currentModel });
      const result = await streamGeminiOnce({ key, keyIdx: idx, model: currentModel, systemText, userText, maxTokens, purpose, res, continuationText: continuation });
      writeSse(res, 'complete', { text: result.text, keyIndex: idx + 1 });
      return result.text;
    } catch (err) {
      lastError = err;
      if (err.partialText) continuation = err.partialText;
      
      // Automatic Model Waterfall: If 404 Not Found, switch to next supported model
      if (err.isModelNotFound || err.status === 404 || String(err.message).includes('not found')) {
        modelWaterfallIdx++;
        currentModel = SUPPORTED_MODELS_WATERFALL[modelWaterfallIdx % SUPPORTED_MODELS_WATERFALL.length];
        writeSse(res, 'retry', { message: `Model updated to ${currentModel}. Retrying…` });
        await new Promise(r => setTimeout(r, 400));
        continue;
      }

      const status = Number(err.status) || 500;
      const retryable = status === 429 || status === 408 || status === 500 || status === 502 || status === 503 || status === 504;
      if (!retryable || attempt + 1 >= Math.max(3, pool.length)) break;
      activeKeyPoolIndex = (idx + 1) % pool.length;
      await new Promise(r => setTimeout(r, Math.min(1000 * (attempt + 1), 2500)));
    }
  }
  writeSse(res, 'error', { message: lastError?.message || 'AI streaming failed.', status: Number(lastError?.status) || 500 });
  throw lastError || new Error('AI streaming failed.');
}
