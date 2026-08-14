import fs from 'node:fs';
import path from 'node:path';

const signs = [
  { key: "aries", glyph: "♈", sanskrit: "मेष", english: "ARIES", lord: "Mangal (Mars)", element: "Fire" },
  { key: "taurus", glyph: "♉", sanskrit: "वृषभ", english: "TAURUS", lord: "Shukra (Venus)", element: "Earth" },
  { key: "gemini", glyph: "♊", sanskrit: "मिथुन", english: "GEMINI", lord: "Budha (Mercury)", element: "Air" },
  { key: "cancer", glyph: "♋", sanskrit: "कर्क", english: "CANCER", lord: "Chandra (Moon)", element: "Water" },
  { key: "leo", glyph: "♌", sanskrit: "सिंह", english: "LEO", lord: "Surya (Sun)", element: "Fire" },
  { key: "virgo", glyph: "♍", sanskrit: "कन्या", english: "VIRGO", lord: "Budha (Mercury)", element: "Earth" },
  { key: "libra", glyph: "♎", sanskrit: "तुला", english: "LIBRA", lord: "Shukra (Venus)", element: "Air" },
  { key: "scorpio", glyph: "♏", sanskrit: "वृश्चिक", english: "SCORPIO", lord: "Mangal / Ketu", element: "Water" },
  { key: "sagittarius", glyph: "♐", sanskrit: "धनु", english: "SAGITTARIUS", lord: "Guru (Jupiter)", element: "Fire" },
  { key: "capricorn", glyph: "♑", sanskrit: "मकर", english: "CAPRICORN", lord: "Shani (Saturn)", element: "Earth" },
  { key: "aquarius", glyph: "♒", sanskrit: "कुम्भ", english: "AQUARIUS", lord: "Shani / Rahu", element: "Air" },
  { key: "pisces", glyph: "♓", sanskrit: "मीन", english: "PISCES", lord: "Guru (Jupiter)", element: "Water" }
];

function generateGoldenSvg(s) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <!-- Cosmic Nebula Background -->
    <radialGradient id="bgGrad_${s.key}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#361a4f"/>
      <stop offset="50%" stop-color="#1b0c2e"/>
      <stop offset="85%" stop-color="#0e051a"/>
      <stop offset="100%" stop-color="#05020a"/>
    </radialGradient>

    <!-- 24K Royal Gold Gradient -->
    <linearGradient id="gold24k_${s.key}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbe0"/>
      <stop offset="25%" stop-color="#fed561"/>
      <stop offset="50%" stop-color="#d49b29"/>
      <stop offset="75%" stop-color="#fce79a"/>
      <stop offset="100%" stop-color="#9e6d11"/>
    </linearGradient>

    <!-- Radial Gold Sheen -->
    <radialGradient id="goldSheen_${s.key}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff8d6" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="#e8b84b" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>

    <!-- Drop Shadow Filter for Glyph & Emblem -->
    <filter id="goldGlow_${s.key}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feFlood flood-color="#f7d070" flood-opacity="0.6" result="glowColor"/>
      <feComposite in="glowColor" in2="blur" operator="in" result="softGlow"/>
      <feMerge>
        <feMergeNode in="softGlow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Outer Background Disc -->
  <circle cx="70" cy="70" r="66" fill="url(#bgGrad_${s.key})" stroke="url(#gold24k_${s.key})" stroke-width="3"/>
  <circle cx="70" cy="70" r="66" fill="url(#goldSheen_${s.key})"/>

  <!-- Ornate 12-Ray Sacred Mandala Star Background -->
  <g stroke="url(#gold24k_${s.key})" stroke-width="0.75" opacity="0.35">
    <line x1="70" y1="5" x2="70" y2="135"/>
    <line x1="5" y1="70" x2="135" y2="70"/>
    <line x1="24" y1="24" x2="116" y2="116"/>
    <line x1="116" y1="24" x2="24" y2="116"/>
    <circle cx="70" cy="70" r="60" fill="none" stroke-dasharray="2 4"/>
    <circle cx="70" cy="70" r="54" fill="none" stroke-dasharray="4 2"/>
  </g>

  <!-- Inner Ornate Gold Border -->
  <circle cx="70" cy="70" r="57" fill="none" stroke="url(#gold24k_${s.key})" stroke-width="1.2" opacity="0.9"/>
  <circle cx="70" cy="70" r="51" fill="none" stroke="url(#gold24k_${s.key})" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.75"/>

  <!-- 4 Cardinal Gold Stars -->
  <g fill="url(#gold24k_${s.key})" opacity="0.85">
    <circle cx="70" cy="11" r="1.8"/>
    <circle cx="70" cy="129" r="1.8"/>
    <circle cx="11" cy="70" r="1.8"/>
    <circle cx="129" cy="70" r="1.8"/>
  </g>

  <!-- Central Radiant Zodiac Glyph Symbol -->
  <text x="70" y="62"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="46"
        font-weight="900"
        fill="url(#gold24k_${s.key})"
        text-anchor="middle"
        dominant-baseline="central"
        filter="url(#goldGlow_${s.key})">${s.glyph}</text>

  <!-- Sanskrit Devanagari Name -->
  <text x="70" y="99"
        font-family="'Marcellus', 'Yatra One', 'Noto Serif Devanagari', 'Cinzel', serif"
        font-size="14.5"
        font-weight="800"
        fill="#fff4d0"
        letter-spacing="1.5"
        text-anchor="middle"
        filter="drop-shadow(0 0 3px rgba(245,200,80,0.8))">${s.sanskrit}</text>

  <!-- English Name with Star Accents -->
  <text x="70" y="116"
        font-family="'Cinzel', 'Marcellus', sans-serif"
        font-size="9"
        font-weight="800"
        fill="#dfba6d"
        letter-spacing="2.2"
        text-anchor="middle">✦ ${s.english} ✦</text>
</svg>`;
}

const targets = [
  path.join(process.cwd(), "public", "images", "zodiac_svg"),
  path.join(process.cwd(), "images", "zodiac_svg"),
  path.join(process.cwd(), "public", "images", "zodiac"),
  path.join(process.cwd(), "images", "zodiac")
];

targets.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

signs.forEach(s => {
  const svgContent = generateGoldenSvg(s);
  // Write to all target folders
  fs.writeFileSync(path.join(process.cwd(), "public", "images", "zodiac_svg", `${s.key}.svg`), svgContent);
  fs.writeFileSync(path.join(process.cwd(), "images", "zodiac_svg", `${s.key}.svg`), svgContent);
  fs.writeFileSync(path.join(process.cwd(), "public", "images", "zodiac", `${s.key}.svg`), svgContent);
  fs.writeFileSync(path.join(process.cwd(), "images", "zodiac", `${s.key}.svg`), svgContent);
});

console.log("Successfully generated all 12 Golden Zodiac SVGs!");
