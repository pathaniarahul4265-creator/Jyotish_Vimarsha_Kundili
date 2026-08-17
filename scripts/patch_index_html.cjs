const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

const embeddedJs = fs.readFileSync(path.join(process.cwd(), 'scripts', 'embedded_zodiac_svgs.js'), 'utf8');

// 1. Ensure zodiacModalImg has onerror handler
html = html.replace(
  '<img id="zodiacModalImg" src="/images/zodiac/aries.png" class="rashifal-gold-logo" style="width:58px;height:58px;margin-bottom:0;" alt="Zodiac" />',
  '<img id="zodiacModalImg" src="/images/zodiac/aries.png" class="rashifal-gold-logo" style="width:58px;height:58px;margin-bottom:0;" alt="Zodiac" onerror="handleZodiacImgError(this, \'aries\')" />'
);

// 2. Ensure rashi-pillar-img has onerror
html = html.replace(
  '<img src="/images/zodiac/aries.png" class="rashi-pillar-img" alt="Rashis" />',
  '<img src="/images/zodiac/aries.png" class="rashi-pillar-img" alt="Rashis" onerror="handleZodiacImgError(this, \'aries\')" />'
);

// 3. Ensure all rashifal-pill images have onerror handlers
const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
signs.forEach(s => {
  const oldPillImg = `<img src="/images/zodiac/${s}.png" class="rashifal-pill-img" alt="${s.charAt(0).toUpperCase() + s.slice(1)}" width="28" height="28" />`;
  const newPillImg = `<img src="/images/zodiac/${s}.png" class="rashifal-pill-img" alt="${s.charAt(0).toUpperCase() + s.slice(1)}" width="28" height="28" onerror="handleZodiacImgError(this, '${s}')" />`;
  html = html.replace(oldPillImg, newPillImg);
});

// 4. Inject embedded SVGs right before const ZODIAC = [
const zodiacToken = 'const ZODIAC = [\'♈\',\'♉\',\'♊\',\'♋\',\'♌\',\'♍\',\'♎\',\'♏\',\'♐\',\'♑\',\'♒\',\'♓\'];';
if (html.includes(zodiacToken) && !html.includes('window.ZODIAC_EMBEDDED_SVGS')) {
  html = html.replace(zodiacToken, `${embeddedJs}\n  ${zodiacToken}`);
}

// 5. Update getZodiacSvgUrl and handleZodiacImgError
const oldFuncs = `function getZodiacSvgUrl(signStr) {
  const key = getZodiacSignKey(signStr);
  return \`/images/zodiac/\${key}.png\`;
}
function handleZodiacImgError(imgEl, signKey) {
  if (!imgEl) return;
  const key = getZodiacSignKey(signKey || imgEl.alt || 'aries');
  const count = parseInt(imgEl.dataset.retryCount || '0', 10);
  imgEl.dataset.retryCount = String(count + 1);
  if (count === 0) {
    imgEl.src = \`/public/images/zodiac/\${key}.png\`;
  } else if (count === 1) {
    imgEl.src = \`/images/zodiac/\${key}.png\`;
  }
}`;

const newFuncs = `function getZodiacSvgUrl(signStr) {
  const key = getZodiacSignKey(signStr);
  if (window.ZODIAC_EMBEDDED_SVGS && window.ZODIAC_EMBEDDED_SVGS[key]) {
    return window.ZODIAC_EMBEDDED_SVGS[key];
  }
  return \`/images/zodiac/\${key}.svg\`;
}
function handleZodiacImgError(imgEl, signKey) {
  if (!imgEl) return;
  const key = getZodiacSignKey(signKey || imgEl.getAttribute('data-sign') || imgEl.alt || 'aries');
  if (window.ZODIAC_EMBEDDED_SVGS && window.ZODIAC_EMBEDDED_SVGS[key]) {
    imgEl.src = window.ZODIAC_EMBEDDED_SVGS[key];
    imgEl.onerror = null;
    return;
  }
  const count = parseInt(imgEl.dataset.retryCount || '0', 10);
  imgEl.dataset.retryCount = String(count + 1);
  if (count === 0) {
    imgEl.src = \`/images/zodiac/\${key}.svg\`;
  } else if (count === 1) {
    imgEl.src = \`/images/zodiac/\${key}.png\`;
  } else {
    imgEl.onerror = null;
  }
}
function initializeAllZodiacImages() {
  if (!window.ZODIAC_EMBEDDED_SVGS) return;
  document.querySelectorAll('img.rashifal-pill-img, img.rashi-pillar-img, img.hero-z-img, #zodiacModalImg, img.rashifal-gold-logo, img.sky-planet-zodiac-img').forEach(img => {
    const parentPill = img.closest('[data-sign]');
    const signKey = parentPill ? parentPill.dataset.sign : (img.getAttribute('data-sign') || img.alt || '');
    if (signKey) {
      const key = getZodiacSignKey(signKey);
      if (window.ZODIAC_EMBEDDED_SVGS[key]) {
        img.src = window.ZODIAC_EMBEDDED_SVGS[key];
      }
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllZodiacImages);
} else {
  initializeAllZodiacImages();
}`;

if (html.includes(oldFuncs)) {
  html = html.replace(oldFuncs, newFuncs);
}

// 6. Update renderDailyRashifal imgSrc and openSpecificZodiacModal imgSrc
html = html.replace(
  'const imgSrc = `/images/zodiac/${sign.key}.png`;\n\n  container.innerHTML = `',
  'const imgSrc = getZodiacSvgUrl(sign.key);\n\n  container.innerHTML = `'
);

html = html.replace(
  'const dateIso = `${yStr}-${mStr}-${dStr}`;\n  const imgSrc = `/images/zodiac/${sign.key}.png`;',
  'const dateIso = `${yStr}-${mStr}-${dStr}`;\n  const imgSrc = getZodiacSvgUrl(sign.key);'
);

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Successfully patched index.html with embedded SVGs and resilient error handlers!');
