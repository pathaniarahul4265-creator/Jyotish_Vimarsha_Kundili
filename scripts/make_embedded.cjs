const fs = require('fs');
const path = require('path');

const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const svgMap = {};

signs.forEach(s => {
  const file = path.join(process.cwd(), 'public', 'images', 'zodiac', `${s}.svg`);
  const content = fs.readFileSync(file, 'utf8').trim();
  const encoded = encodeURIComponent(content).replace(/'/g, "%27");
  svgMap[s] = `data:image/svg+xml;charset=utf-8,${encoded}`;
});

const outJs = `window.ZODIAC_EMBEDDED_SVGS = ${JSON.stringify(svgMap, null, 2)};`;
fs.writeFileSync(path.join(process.cwd(), 'scripts', 'embedded_zodiac_svgs.js'), outJs);
console.log('Done creating embedded_zodiac_svgs.js');
