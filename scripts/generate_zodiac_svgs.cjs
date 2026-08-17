const fs = require('fs');
const path = require('path');

// 12 Classical bas-relief celestial medallion SVGs matching the Virgo/Aries dark-navy night sky + gold/silver bas-relief aesthetic
const ZODIAC_SVGS = {
  aries: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_ar" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/>
      <stop offset="70%" stop-color="#080e1c"/>
      <stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_ar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_ar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#c9d2db"/>
      <stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_ar" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/>
    </filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_ar)"/>
  <!-- Constellation stars -->
  <g fill="#e2e8f0" opacity="0.65">
    <circle cx="45" cy="55" r="1.5"/><circle cx="155" cy="45" r="1.2"/><circle cx="160" cy="140" r="1.8"/>
    <circle cx="35" cy="130" r="1.2"/><circle cx="95" cy="30" r="1"/><circle cx="130" cy="165" r="1.4"/>
    <polygon points="50,45 52,49 56,50 52,51 50,55 48,51 44,50 48,49" fill="#fce7b0" opacity="0.8"/>
  </g>
  <!-- Outer Gold Borders -->
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_ar)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_ar)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_ar)" stroke-width="1.2" opacity="0.7"/>
  <!-- Aries Ram Horns & Majestic Bas-Relief Profile -->
  <g filter="url(#glow_ar)">
    <!-- Powerful Ram Horns -->
    <path d="M100,75 C85,45 42,42 40,76 C38,102 68,112 82,96 C90,87 91,78 84,72 C76,65 60,70 60,82 C60,90 70,95 76,88 C80,83 75,76 71,78" fill="none" stroke="url(#gold_ar)" stroke-width="7" stroke-linecap="round"/>
    <path d="M100,75 C115,45 158,42 160,76 C162,102 132,112 118,96 C110,87 109,78 116,72 C124,65 140,70 140,82 C140,90 130,95 124,88 C120,83 125,76 129,78" fill="none" stroke="url(#gold_ar)" stroke-width="7" stroke-linecap="round"/>
    <!-- Ram Head & Noble Crest -->
    <path d="M92,80 L108,80 L106,120 C106,132 103,142 100,146 C97,142 94,132 94,120 Z" fill="url(#silver_ar)"/>
    <path d="M88,88 C94,95 106,95 112,88 L108,118 C105,128 95,128 92,118 Z" fill="url(#gold_ar)" opacity="0.4"/>
    <!-- Central Golden Star & Astrological Glyph -->
    <circle cx="100" cy="132" r="3" fill="url(#gold_ar)"/>
    <path d="M100,148 L100,165" stroke="url(#gold_ar)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="100" cy="170" r="2.5" fill="url(#gold_ar)"/>
  </g>
  <!-- Sacred Sanskrit & English Name Subtext -->
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_ar)" letter-spacing="2">MESHA · ARIES</text>
</svg>`,

  taurus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_ta" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_ta" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_ta" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_ta" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_ta)"/>
  <g fill="#e2e8f0" opacity="0.65"><circle cx="40" cy="50" r="1.5"/><circle cx="165" cy="65" r="1.2"/><circle cx="150" cy="145" r="1.8"/><circle cx="45" cy="140" r="1.2"/><circle cx="100" cy="28" r="1"/></g>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_ta)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_ta)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_ta)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_ta)">
    <!-- Majestic Taurus Bull Horns & Head -->
    <path d="M48,46 C54,82 82,92 100,92 C118,92 146,82 152,46 C140,54 125,62 100,62 C75,62 60,54 48,46 Z" fill="url(#gold_ta)"/>
    <!-- Celestial Bull Head Circle -->
    <circle cx="100" cy="115" r="28" fill="url(#silver_ta)" stroke="url(#gold_ta)" stroke-width="3"/>
    <circle cx="100" cy="115" r="18" fill="url(#bg_ta)" stroke="url(#gold_ta)" stroke-width="1.5"/>
    <polygon points="100,105 103,112 110,115 103,118 100,125 97,118 90,115 97,112" fill="url(#gold_ta)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_ta)" letter-spacing="2">VRISHABHA · TAURUS</text>
</svg>`,

  gemini: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_ge" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_ge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_ge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_ge" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_ge)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_ge)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_ge)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_ge)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_ge)">
    <!-- Gemini Roman Pillar & Twin Stars Castor & Pollux -->
    <path d="M60,54 C80,64 120,64 140,54" stroke="url(#gold_ge)" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M60,146 C80,136 120,136 140,146" stroke="url(#gold_ge)" stroke-width="5" stroke-linecap="round" fill="none"/>
    <line x1="82" y1="58" x2="82" y2="142" stroke="url(#silver_ge)" stroke-width="6" stroke-linecap="round"/>
    <line x1="118" y1="58" x2="118" y2="142" stroke="url(#silver_ge)" stroke-width="6" stroke-linecap="round"/>
    <!-- Twin Star Crowns -->
    <circle cx="82" cy="74" r="5" fill="url(#gold_ge)"/>
    <circle cx="118" cy="74" r="5" fill="url(#gold_ge)"/>
    <circle cx="100" cy="100" r="6" fill="none" stroke="url(#gold_ge)" stroke-width="2"/>
    <polygon points="100,94 102,99 107,100 102,101 100,106 98,101 93,100 98,99" fill="url(#gold_ge)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_ge)" letter-spacing="2">MITHUNA · GEMINI</text>
</svg>`,

  cancer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_ca" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_ca" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_ca" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_ca" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_ca)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_ca)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_ca)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_ca)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_ca)">
    <!-- Sacred Lunar Crab & Yin-Yang Claws -->
    <g transform="translate(100,100)">
      <!-- Top Loop -->
      <circle cx="-24" cy="-18" r="16" fill="url(#silver_ca)" stroke="url(#gold_ca)" stroke-width="3"/>
      <path d="M-8,-18 C15,-18 36,-30 40,-4" fill="none" stroke="url(#gold_ca)" stroke-width="6" stroke-linecap="round"/>
      <!-- Bottom Loop -->
      <circle cx="24" cy="18" r="16" fill="url(#silver_ca)" stroke="url(#gold_ca)" stroke-width="3"/>
      <path d="M8,18 C-15,18 -36,30 -40,4" fill="none" stroke="url(#gold_ca)" stroke-width="6" stroke-linecap="round"/>
      <!-- Center Pearl of Moon -->
      <circle cx="0" cy="0" r="7" fill="url(#gold_ca)"/>
      <circle cx="0" cy="0" r="4" fill="#ffffff"/>
    </g>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_ca)" letter-spacing="2">KARKA · CANCER</text>
</svg>`,

  leo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_le" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_le" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_le" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_le" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_le)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_le)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_le)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_le)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_le)">
    <!-- Solar Crown Lion Mane & Tail -->
    <path d="M68,110 C55,110 50,96 58,84 C68,70 82,60 100,60 C125,60 138,80 132,100 C125,120 110,132 118,145 C124,154 136,152 144,142 C146,138 152,142 148,148 C138,162 118,164 108,150 C98,136 112,118 118,102 C122,88 115,74 98,74 C86,74 76,82 72,92 C80,92 84,98 84,104 C84,110 76,114 68,110 Z" fill="url(#gold_le)"/>
    <!-- Solar Radiance Core -->
    <circle cx="68" cy="98" r="6" fill="url(#silver_le)"/>
    <circle cx="68" cy="98" r="3" fill="url(#gold_le)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_le)" letter-spacing="2">SIMHA · LEO</text>
</svg>`,

  virgo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_vi" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_vi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_vi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_vi" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_vi)"/>
  <g fill="#e2e8f0" opacity="0.65"><circle cx="45" cy="65" r="1.5"/><circle cx="155" cy="55" r="1.3"/><circle cx="160" cy="135" r="1.8"/><circle cx="40" cy="125" r="1.2"/></g>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_vi)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_vi)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_vi)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_vi)">
    <!-- Virgo Celestial Maiden with Golden Wheat / Laurel Branch (Exact match to uploaded style) -->
    <!-- Maiden Face & Profile Silhouette -->
    <path d="M102,60 C92,60 84,68 84,78 C84,88 92,94 98,96 L98,108 C88,114 74,124 72,142 L132,142 C130,124 116,114 106,108 L106,96 C112,94 120,88 120,78 C120,68 112,60 102,60 Z" fill="url(#silver_vi)"/>
    <!-- Flowing Hair & Crown -->
    <path d="M102,58 C115,58 128,68 132,84 C136,100 126,112 134,128 C136,132 132,136 128,132 C122,122 126,108 122,96 C118,84 110,72 98,72 C92,72 86,76 82,82" stroke="url(#gold_vi)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Golden Wheat / Laurel Sheaf in Hand -->
    <g transform="translate(62, 85) rotate(-25)">
      <path d="M10,45 Q12,20 15,0" stroke="url(#gold_vi)" stroke-width="2.5" fill="none"/>
      <ellipse cx="10" cy="10" rx="4" ry="7" fill="url(#gold_vi)" transform="rotate(-30 10 10)"/>
      <ellipse cx="18" cy="12" rx="4" ry="7" fill="url(#gold_vi)" transform="rotate(30 18 12)"/>
      <ellipse cx="11" cy="22" rx="4" ry="7" fill="url(#gold_vi)" transform="rotate(-30 11 22)"/>
      <ellipse cx="19" cy="24" rx="4" ry="7" fill="url(#gold_vi)" transform="rotate(30 19 24)"/>
      <ellipse cx="15" cy="0" rx="3.5" ry="6" fill="url(#gold_vi)"/>
    </g>
    <!-- Maiden Earring & Starlight -->
    <circle cx="108" cy="85" r="2.5" fill="url(#gold_vi)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_vi)" letter-spacing="2">KANYA · VIRGO</text>
</svg>`,

  libra: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_li" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_li" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_li" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_li" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_li)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_li)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_li)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_li)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_li)">
    <!-- Celestial Scales of Cosmic Justice -->
    <path d="M52,142 L148,142" stroke="url(#gold_li)" stroke-width="5" stroke-linecap="round"/>
    <path d="M52,112 L84,112 C88,96 100,84 100,84 C100,84 112,96 116,112 L148,112" fill="none" stroke="url(#gold_li)" stroke-width="5" stroke-linecap="round"/>
    <!-- Central Fulcrum & Star -->
    <line x1="100" y1="58" x2="100" y2="82" stroke="url(#silver_li)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="100" cy="56" r="6" fill="url(#gold_li)"/>
    <!-- Left & Right Hanging Pans -->
    <path d="M68,112 L60,126 L76,126 Z" fill="url(#silver_li)" opacity="0.8"/>
    <path d="M132,112 L124,126 L140,126 Z" fill="url(#silver_li)" opacity="0.8"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_li)" letter-spacing="2">TULA · LIBRA</text>
</svg>`,

  scorpio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_sc" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_sc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_sc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_sc" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_sc)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_sc)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_sc)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_sc)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_sc)">
    <!-- Mystic Scorpio Stinger & M-Glyph -->
    <path d="M50,132 L50,86 C50,68 66,68 70,86 L70,132" fill="none" stroke="url(#silver_sc)" stroke-width="6" stroke-linecap="round"/>
    <path d="M70,86 C70,68 86,68 90,86 L90,132" fill="none" stroke="url(#silver_sc)" stroke-width="6" stroke-linecap="round"/>
    <path d="M90,86 C90,68 106,68 112,86 L112,130 C112,148 132,150 144,136 L154,124" fill="none" stroke="url(#gold_sc)" stroke-width="6" stroke-linecap="round"/>
    <!-- Stinger Arrowhead -->
    <polygon points="154,116 160,132 144,128" fill="url(#gold_sc)"/>
    <circle cx="100" cy="56" r="4" fill="url(#gold_sc)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_sc)" letter-spacing="2">VRISCHIKA · SCORPIO</text>
</svg>`,

  sagittarius: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_sa" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_sa" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_sa" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_sa" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_sa)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_sa)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_sa)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_sa)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_sa)">
    <!-- Celestial Archer Arrow & Crossbow of Truth -->
    <line x1="56" y1="144" x2="144" y2="56" stroke="url(#gold_sa)" stroke-width="6" stroke-linecap="round"/>
    <line x1="110" y1="126" x2="126" y2="110" stroke="url(#silver_sa)" stroke-width="6" stroke-linecap="round"/>
    <!-- Arrowhead Spear -->
    <polygon points="144,48 152,72 128,80" fill="url(#gold_sa)"/>
    <!-- Glowing Bow Arc -->
    <path d="M60,60 C90,80 120,110 140,140" fill="none" stroke="url(#silver_sa)" stroke-width="2.5" stroke-dasharray="3,3"/>
    <circle cx="100" cy="100" r="5" fill="url(#gold_sa)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_sa)" letter-spacing="2">DHANU · SAGITTARIUS</text>
</svg>`,

  capricorn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_cp" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_cp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_cp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_cp" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_cp)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_cp)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_cp)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_cp)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_cp)">
    <!-- Sea-Goat Horns & Spiral Tail -->
    <path d="M52,78 C52,60 68,54 78,70 L98,110 L118,72 C128,54 144,60 144,78 C144,98 126,116 116,134 C108,148 120,158 132,150 C140,144 140,132 130,130 C122,128 116,136 122,142" fill="none" stroke="url(#gold_cp)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="78" cy="70" r="5" fill="url(#silver_cp)"/>
    <circle cx="100" cy="48" r="4" fill="url(#gold_cp)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_cp)" letter-spacing="2">MAKARA · CAPRICORN</text>
</svg>`,

  aquarius: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_aq" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_aq" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_aq" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_aq" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_aq)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_aq)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_aq)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_aq)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_aq)">
    <!-- Electric Cosmic Waves of Wisdom / Water-Bearer Stream -->
    <path d="M50,82 L65,70 L80,82 L95,70 L110,82 L125,70 L140,82 L150,74" fill="none" stroke="url(#gold_aq)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M50,116 L65,104 L80,116 L95,104 L110,116 L125,104 L140,116 L150,108" fill="none" stroke="url(#silver_aq)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="100" cy="46" r="4" fill="url(#gold_aq)"/>
    <circle cx="100" cy="142" r="4" fill="url(#gold_aq)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_aq)" letter-spacing="2">KUMBHA · AQUARIUS</text>
</svg>`,

  pisces: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_pi" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14213d"/><stop offset="70%" stop-color="#080e1c"/><stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="gold_pi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0bd"/><stop offset="35%" stop-color="#d4af37"/><stop offset="70%" stop-color="#aa7c11"/><stop offset="100%" stop-color="#fdf3cd"/>
    </linearGradient>
    <linearGradient id="silver_pi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#c9d2db"/><stop offset="100%" stop-color="#7a889b"/>
    </linearGradient>
    <filter id="glow_pi" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f0c242" flood-opacity="0.45"/></filter>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#bg_pi)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gold_pi)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gold_pi)" stroke-width="0.8" stroke-dasharray="2,3"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold_pi)" stroke-width="1.2" opacity="0.7"/>
  <g filter="url(#glow_pi)">
    <!-- Dual Cosmic Fishes Bound by Cord of Samsara -->
    <path d="M68,54 C52,74 52,126 68,146" fill="none" stroke="url(#gold_pi)" stroke-width="7" stroke-linecap="round"/>
    <path d="M132,54 C148,74 148,126 132,146" fill="none" stroke="url(#gold_pi)" stroke-width="7" stroke-linecap="round"/>
    <line x1="52" y1="100" x2="148" y2="100" stroke="url(#silver_pi)" stroke-width="5" stroke-linecap="round"/>
    <!-- Golden Fish Tails & Crowns -->
    <polygon points="68,54 58,46 76,44" fill="url(#silver_pi)"/>
    <polygon points="132,146 122,156 140,154" fill="url(#silver_pi)"/>
    <circle cx="100" cy="100" r="5" fill="url(#gold_pi)"/>
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="'Cinzel',serif" font-size="10" font-weight="700" fill="url(#gold_pi)" letter-spacing="2">MEENA · PISCES</text>
</svg>`
};

// Write SVGs to public/images/zodiac and images/zodiac
const outDirs = [
  path.join(process.cwd(), 'public', 'images', 'zodiac'),
  path.join(process.cwd(), 'images', 'zodiac')
];

outDirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

Object.entries(ZODIAC_SVGS).forEach(([sign, svgContent]) => {
  outDirs.forEach(dir => {
    fs.writeFileSync(path.join(dir, `${sign}.svg`), svgContent.trim());
  });
});

console.log('Successfully generated all 12 bas-relief celestial zodiac SVGs!');
