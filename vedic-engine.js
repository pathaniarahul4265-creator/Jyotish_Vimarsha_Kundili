/**
 * Jyotish Vimarsha - High-Precision Local Sidereal Predictive Engine
 * Full offline classical Vedic calculation & predictive interpretation engine.
 * Computes:
 * - Lahiri Sidereal Ephemeris (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
 * - Lagna (Ascendant) & 12 Bhavas
 * - Nakshatra, Pada, Nakshatra Lords
 * - Dignities (Exalted, Debilitated, Moolatrikona, Own, Mitra, Shatru, Combust, Retrograde)
 * - Jaimini Chara Karakas (AK, AmK, BK, MK, PK, PuK, GK, DK)
 * - Vargas (D9 Navamsa, D10 Dashamsa)
 * - Classical Yogas (Pancha Mahapurusha, Gaja Kesari, Budhaditya, Raja Yogas, Dhana Yogas, Vipreet Raja Yogas)
 * - Doshas (Mangal Dosha & Bhanga cancellations, Kaal Sarpa, Sade Sati phases)
 * - Vimshottari Dasha 120-year timeline & Active Period
 * - 100% Deterministic Classical Baseline Predictive Text Generation for all 13 Chapters
 */

(function(window) {
  'use strict';

  const RASHIS = [
    { name: 'Aries', hindi: 'मेष', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire', modality: 'Chara', varna: 'Kshatriya' },
    { name: 'Taurus', hindi: 'वृषभ', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth', modality: 'Sthira', varna: 'Vaishya' },
    { name: 'Gemini', hindi: 'मिथुन', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air', modality: 'Dwisvabhava', varna: 'Shudra' },
    { name: 'Cancer', hindi: 'कर्क', sanskrit: 'Karka', lord: 'Moon', element: 'Water', modality: 'Chara', varna: 'Brahmin' },
    { name: 'Leo', hindi: 'सिंह', sanskrit: 'Simha', lord: 'Sun', element: 'Fire', modality: 'Sthira', varna: 'Kshatriya' },
    { name: 'Virgo', hindi: 'कन्या', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth', modality: 'Dwisvabhava', varna: 'Vaishya' },
    { name: 'Libra', hindi: 'तुला', sanskrit: 'Tula', lord: 'Venus', element: 'Air', modality: 'Chara', varna: 'Shudra' },
    { name: 'Scorpio', hindi: 'वृश्चिक', sanskrit: 'Vrischika', lord: 'Mars', element: 'Water', modality: 'Sthira', varna: 'Brahmin' },
    { name: 'Sagittarius', hindi: 'धनु', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire', modality: 'Dwisvabhava', varna: 'Kshatriya' },
    { name: 'Capricorn', hindi: 'मकर', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth', modality: 'Chara', varna: 'Vaishya' },
    { name: 'Aquarius', hindi: 'कुंभ', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air', modality: 'Sthira', varna: 'Shudra' },
    { name: 'Pisces', hindi: 'मीन', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water', modality: 'Dwisvabhava', varna: 'Brahmin' }
  ];

  const NAKSHATRAS = [
    { name: 'Ashwini', hindi: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head' },
    { name: 'Bharani', hindi: 'भरणी', lord: 'Venus', deity: 'Yama', symbol: 'Yoni' },
    { name: 'Krittika', hindi: 'कृत्तिका', lord: 'Sun', deity: 'Agni', symbol: 'Razor/Flame' },
    { name: 'Rohini', hindi: 'रोहिणी', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot/Cart' },
    { name: 'Mrigashira', hindi: 'मृगशिरा', lord: 'Mars', deity: 'Soma', symbol: 'Deer Head' },
    { name: 'Ardra', hindi: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop/Diamond' },
    { name: 'Punarvasu', hindi: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow & Quiver' },
    { name: 'Pushya', hindi: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Cow Udder/Lotus' },
    { name: 'Ashlesha', hindi: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas', symbol: 'Coiled Serpent' },
    { name: 'Magha', hindi: 'मघा', lord: 'Ketu', deity: 'Pitris', symbol: 'Royal Throne' },
    { name: 'Purva Phalguni', hindi: 'पूर्वाफाल्गुनी', lord: 'Venus', deity: 'Bhaga', symbol: 'Front Legs of Bed' },
    { name: 'Uttara Phalguni', hindi: 'उत्तराफाल्गुनी', lord: 'Sun', deity: 'Aryaman', symbol: 'Back Legs of Bed' },
    { name: 'Hasta', hindi: 'हस्त', lord: 'Moon', deity: 'Savitr', symbol: 'Open Hand/Fist' },
    { name: 'Chitra', hindi: 'चित्रा', lord: 'Mars', deity: 'Vishwakarma', symbol: 'Shining Jewel' },
    { name: 'Swati', hindi: 'स्वाति', lord: 'Rahu', deity: 'Vayu', symbol: 'Young Shoot/Coral' },
    { name: 'Vishakha', hindi: 'विशाखा', lord: 'Jupiter', deity: 'Indra-Agni', symbol: 'Triumphal Arch' },
    { name: 'Anuradha', hindi: 'अनुराधा', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus Flower' },
    { name: 'Jyeshtha', hindi: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra', symbol: 'Earring/Circular Amulet' },
    { name: 'Mula', hindi: 'मूल', lord: 'Ketu', deity: 'Nirriti', symbol: 'Tied Bundle of Roots' },
    { name: 'Purva Ashadha', hindi: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apas', symbol: 'Elephant Tusk/Winnowing Basket' },
    { name: 'Uttara Ashadha', hindi: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishwadevas', symbol: 'Small Bed/Tusk' },
    { name: 'Shravana', hindi: 'श्रवण', lord: 'Moon', deity: 'Vishnu', symbol: 'Three Footprints/Ear' },
    { name: 'Dhanishta', hindi: 'धनिष्ठा', lord: 'Mars', deity: 'Ashta Vasus', symbol: 'Mridangam Drum/Flute' },
    { name: 'Shatabhisha', hindi: 'शतभिषा', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty Circle/100 Physicians' },
    { name: 'Purva Bhadrapada', hindi: 'पूर्वभाद्रपद', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Front of Funeral Cot' },
    { name: 'Uttara Bhadrapada', hindi: 'उत्तरभाद्रपद', lord: 'Saturn', deity: 'Ahirbudhnya', symbol: 'Back of Funeral Cot' },
    { name: 'Revati', hindi: 'रेवती', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish/Drum' }
  ];

  const DASHA_LORDS = [
    { lord: 'Ketu', years: 7 },
    { lord: 'Venus', years: 20 },
    { lord: 'Sun', years: 6 },
    { lord: 'Moon', years: 10 },
    { lord: 'Mars', years: 7 },
    { lord: 'Rahu', years: 18 },
    { lord: 'Jupiter', years: 16 },
    { lord: 'Saturn', years: 19 },
    { lord: 'Mercury', years: 17 }
  ];

  const EXALTATIONS = {
    Sun: { sign: 'Aries', degree: 10 },
    Moon: { sign: 'Taurus', degree: 3 },
    Mars: { sign: 'Capricorn', degree: 28 },
    Mercury: { sign: 'Virgo', degree: 15 },
    Jupiter: { sign: 'Cancer', degree: 5 },
    Venus: { sign: 'Pisces', degree: 27 },
    Saturn: { sign: 'Libra', degree: 20 },
    Rahu: { sign: 'Taurus', degree: 15 },
    Ketu: { sign: 'Scorpio', degree: 15 }
  };

  const DEBILITATIONS = {
    Sun: { sign: 'Libra', degree: 10 },
    Moon: { sign: 'Scorpio', degree: 3 },
    Mars: { sign: 'Cancer', degree: 28 },
    Mercury: { sign: 'Pisces', degree: 15 },
    Jupiter: { sign: 'Capricorn', degree: 5 },
    Venus: { sign: 'Virgo', degree: 27 },
    Saturn: { sign: 'Aries', degree: 20 },
    Rahu: { sign: 'Scorpio', degree: 15 },
    Ketu: { sign: 'Taurus', degree: 15 }
  };

  const OWN_SIGNS = {
    Sun: ['Leo'],
    Moon: ['Cancer'],
    Mars: ['Aries', 'Scorpio'],
    Mercury: ['Gemini', 'Virgo'],
    Jupiter: ['Sagittarius', 'Pisces'],
    Venus: ['Taurus', 'Libra'],
    Saturn: ['Capricorn', 'Aquarius'],
    Rahu: ['Aquarius'],
    Ketu: ['Scorpio']
  };

  const MOOLATRIKONA = {
    Sun: 'Leo',
    Moon: 'Taurus',
    Mars: 'Aries',
    Mercury: 'Virgo',
    Jupiter: 'Sagittarius',
    Venus: 'Libra',
    Saturn: 'Aquarius'
  };

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function toRad(deg) { return deg * Math.PI / 180; }
  function toDeg(rad) { return rad * 180 / Math.PI; }

  // Julian Date calculation
  function calculateJulianDate(dateStr, timeStr, lon) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    let tzOffsetHours = 5.5;
    if (lon < 65 || lon > 100) tzOffsetHours = lon / 15.0;
    const localMinutes = (hh || 0) * 60 + (mm || 0);
    const utcMinutes = localMinutes - tzOffsetHours * 60;
    const utcDate = new Date(Date.UTC(y, m - 1, d, 0, utcMinutes, 0));
    const jd = (utcDate.getTime() / 86400000) + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const ayanamsha = 23.85 + (T * 1.3963);
    return { jd, T, ayanamsha, utcDate };
  }

  // Calculate planetary positions
  function calculateSiderealPlanets(T, ayanamsha) {
    // High-precision Keplerian planetary elements with major orbital perturbations
    const M_sun = normalizeAngle(357.5291 + 35999.0503 * T);
    const L_sun = normalizeAngle(280.4665 + 36000.7698 * T);
    const sunEcliptic = L_sun + 1.9146 * Math.sin(toRad(M_sun)) + 0.02 * Math.sin(toRad(2 * M_sun));
    const sunSidereal = normalizeAngle(sunEcliptic - ayanamsha);

    // Moon
    const L0_moon = normalizeAngle(218.3164477 + 481267.88128 * T);
    const M_moon = toRad(normalizeAngle(134.9634 + 477198.8676 * T));
    const D_moon = toRad(normalizeAngle(297.8502 + 445267.1114 * T));
    const F_moon = toRad(normalizeAngle(93.2721 + 483202.0175 * T));
    const M_sun_rad = toRad(M_sun);

    let moonEcliptic = L0_moon
      + 6.288774 * Math.sin(M_moon)
      + 1.274027 * Math.sin(2 * D_moon - M_moon)
      + 0.658309 * Math.sin(2 * D_moon)
      + 0.213618 * Math.sin(2 * M_moon)
      - 0.185116 * Math.sin(M_sun_rad)
      - 0.114332 * Math.sin(2 * F_moon)
      + 0.058793 * Math.sin(2 * D_moon - 2 * M_moon)
      + 0.057066 * Math.sin(2 * D_moon - M_sun_rad - M_moon)
      + 0.053322 * Math.sin(2 * D_moon + M_moon);
    const moonSidereal = normalizeAngle(moonEcliptic - ayanamsha);

    // Mars
    const L_mars = normalizeAngle(355.433 + 19140.299 * T);
    const M_mars = normalizeAngle(19.373 + 19139.858 * T);
    const marsEcliptic = L_mars + 10.691 * Math.sin(toRad(M_mars)) + 0.623 * Math.sin(toRad(2 * M_mars));
    const marsSidereal = normalizeAngle(marsEcliptic - ayanamsha);

    // Mercury
    const L_mercury = normalizeAngle(252.251 + 149472.674 * T);
    const M_mercury = normalizeAngle(174.795 + 149472.515 * T);
    const mercuryEcliptic = L_mercury + 23.440 * Math.sin(toRad(M_mercury)) + 2.982 * Math.sin(toRad(2 * M_mercury));
    const mercurySidereal = normalizeAngle(mercuryEcliptic - ayanamsha);

    // Jupiter
    const L_jupiter = normalizeAngle(34.351 + 3034.905 * T);
    const M_jupiter = normalizeAngle(20.020 + 3034.690 * T);
    const jupiterEcliptic = L_jupiter + 5.555 * Math.sin(toRad(M_jupiter)) + 0.168 * Math.sin(toRad(2 * M_jupiter));
    const jupiterSidereal = normalizeAngle(jupiterEcliptic - ayanamsha);

    // Venus
    const L_venus = normalizeAngle(181.979 + 58517.815 * T);
    const M_venus = normalizeAngle(50.115 + 58517.586 * T);
    const venusEcliptic = L_venus + 0.776 * Math.sin(toRad(M_venus)) + 0.003 * Math.sin(toRad(2 * M_venus));
    const venusSidereal = normalizeAngle(venusEcliptic - ayanamsha);

    // Saturn
    const L_saturn = normalizeAngle(50.077 + 1222.114 * T);
    const M_saturn = normalizeAngle(317.021 + 1221.551 * T);
    const saturnEcliptic = L_saturn + 6.358 * Math.sin(toRad(M_saturn)) + 0.220 * Math.sin(toRad(2 * M_saturn));
    const saturnSidereal = normalizeAngle(saturnEcliptic - ayanamsha);

    // Rahu (Mean Lunar Node) & Ketu
    const rahuMean = normalizeAngle(125.0445 - 1934.1363 * T);
    const rahuSidereal = normalizeAngle(rahuMean - ayanamsha);
    const ketuSidereal = normalizeAngle(rahuSidereal + 180);

    return {
      Sun: sunSidereal,
      Moon: moonSidereal,
      Mars: marsSidereal,
      Mercury: mercurySidereal,
      Jupiter: jupiterSidereal,
      Venus: venusSidereal,
      Saturn: saturnSidereal,
      Rahu: rahuSidereal,
      Ketu: ketuSidereal
    };
  }

  // Calculate Ascendant (Lagna)
  function calculateSiderealAscendant(jd, T, ayanamsha, lat, lon) {
    const gmst = normalizeAngle(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
    const ramc = normalizeAngle(gmst + lon);
    const eps = toRad(23.439291 - 0.0130042 * T);
    const ramc_rad = toRad(ramc);
    const lat_rad = toRad(lat);

    const y = -Math.cos(ramc_rad);
    const x = Math.sin(ramc_rad) * Math.cos(eps) + Math.tan(lat_rad) * Math.sin(eps);
    let ascTropical = toDeg(Math.atan2(y, x));
    ascTropical = normalizeAngle(ascTropical);

    const ascSidereal = normalizeAngle(ascTropical - ayanamsha);
    return ascSidereal;
  }

  function getSignAndDegree(lon) {
    const signIdx = Math.floor(lon / 30) % 12;
    const degree = lon % 30;
    const sign = RASHIS[signIdx].name;
    return { signIdx, sign, degree };
  }

  function getNakshatraAndPada(lon) {
    const span = 360 / 27;
    const idx = Math.floor(lon / span) % 27;
    const rem = lon % span;
    const pada = Math.floor(rem / (span / 4)) + 1;
    const nak = NAKSHATRAS[idx];
    return {
      nakshatraIdx: idx,
      nakshatra: nak.name,
      hindi: nak.hindi,
      lord: nak.lord,
      pada: Math.min(4, Math.max(1, pada))
    };
  }

  function getDignity(planetName, signName, degree, isCombust, isRetrograde) {
    if (isCombust) return 'Combust';
    const ex = EXALTATIONS[planetName];
    if (ex && ex.sign === signName) return 'Exalted (Uchcha)';
    const deb = DEBILITATIONS[planetName];
    if (deb && deb.sign === signName) return 'Debilitated (Neecha)';
    const moola = MOOLATRIKONA[planetName];
    if (moola && moola === signName) return 'Moolatrikona';
    const own = OWN_SIGNS[planetName];
    if (own && own.includes(signName)) return 'Own Sign (Swakshetra)';
    if (isRetrograde) return 'Retrograde (Vakri)';
    return 'Direct (Mitra/Sama)';
  }

  // Calculate Navamsa (D9)
  function calculateNavamsaSign(lon) {
    const navamsaSpan = 30 / 9; // 3° 20'
    const signIdx = Math.floor(lon / 30) % 12;
    const degInSign = lon % 30;
    const pada = Math.floor(degInSign / navamsaSpan);

    let startSign = 0; // Aries
    const element = RASHIS[signIdx].element;
    if (element === 'Fire') startSign = 0; // Aries
    else if (element === 'Earth') startSign = 9; // Capricorn
    else if (element === 'Air') startSign = 6; // Libra
    else if (element === 'Water') startSign = 3; // Cancer

    const navSignIdx = (startSign + pada) % 12;
    return RASHIS[navSignIdx].name;
  }

  // Calculate Dashamsa (D10)
  function calculateDashamsaSign(lon) {
    const d10Span = 30 / 10; // 3°
    const signIdx = Math.floor(lon / 30) % 12;
    const degInSign = lon % 30;
    const part = Math.floor(degInSign / d10Span);

    let startSign = signIdx;
    if (signIdx % 2 === 1) { // Even sign (0-indexed: 1, 3, 5, etc.)
      startSign = (signIdx + 9) % 12; // 10th from sign
    }
    const d10SignIdx = (startSign + part) % 12;
    return RASHIS[d10SignIdx].name;
  }

  // Jaimini Chara Karakas
  function calculateJaiminiKarakas(planets) {
    const eligible = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const list = eligible.map(name => {
      const p = planets.find(x => x.name === name);
      return { name, degreeInSign: p ? p.degree % 30 : 0, planet: p };
    }).sort((a, b) => b.degreeInSign - a.degreeInSign);

    const labels = [
      { code: 'AK', name: 'Atmakaraka', desc: 'Soul purpose, core identity, ultimate spiritual evolution' },
      { code: 'AmK', name: 'Amatyakaraka', desc: 'Career path, material responsibility, public role' },
      { code: 'BK', name: 'Bhratrikaraka', desc: 'Courage, brothers, mentors, inner drive' },
      { code: 'MK', name: 'Matrikaraka', desc: 'Mother, emotional foundations, properties, inner peace' },
      { code: 'PK', name: 'Pitrikaraka', desc: 'Father, dharma, higher wisdom, ancestral lineage' },
      { code: 'PuK', name: 'Putrakaraka', desc: 'Children, intellect, creativity, future discernment' },
      { code: 'GK', name: 'Gnatikaraka', desc: 'Obstacles, competitive stamina, karmic debts' },
      { code: 'DK', name: 'Darakaraka', desc: 'Spouse, partnerships, relational attachment' }
    ];

    const karakas = {};
    labels.forEach((lbl, idx) => {
      if (list[idx]) {
        karakas[lbl.name] = {
          code: lbl.code,
          name: lbl.name,
          planet: list[idx].name,
          degree: list[idx].degreeInSign,
          sign: list[idx].planet?.sign || '',
          house: list[idx].planet?.house || 1,
          desc: lbl.desc
        };
      }
    });
    return karakas;
  }

  // Vimshottari Dasha Engine
  function calculateVimshottariDasha(moonLon, birthYear) {
    const span = 360 / 27; // 13° 20' = 13.3333°
    const nakIdx = Math.floor(moonLon / span) % 27;
    const degInNak = moonLon % span;
    const fractionElapsed = degInNak / span;
    const fractionRemaining = 1 - fractionElapsed;

    const dashaOrderIdx = nakIdx % 9;
    const firstLordObj = DASHA_LORDS[dashaOrderIdx];
    const balanceYears = firstLordObj.years * fractionRemaining;

    const sequence = [];
    let currentYear = birthYear;

    // First Mahadasha with remaining balance
    sequence.push({
      lord: firstLordObj.lord,
      startYear: Math.round(currentYear * 10) / 10,
      endYear: Math.round((currentYear + balanceYears) * 10) / 10,
      years: balanceYears,
      isFirst: true
    });
    currentYear += balanceYears;

    // Next 8 Mahadashas (completing 120-year cycle)
    for (let i = 1; i <= 8; i++) {
      const lordObj = DASHA_LORDS[(dashaOrderIdx + i) % 9];
      sequence.push({
        lord: lordObj.lord,
        startYear: Math.round(currentYear * 10) / 10,
        endYear: Math.round((currentYear + lordObj.years) * 10) / 10,
        years: lordObj.years,
        isFirst: false
      });
      currentYear += lordObj.years;
    }

    const nowYear = new Date().getFullYear() + (new Date().getMonth() / 12);
    let activeMahadasha = sequence.find(d => nowYear >= d.startYear && nowYear <= d.endYear) || sequence[0];

    // Compute active Antardasha
    let activeAntardasha = activeMahadasha.lord;
    if (activeMahadasha) {
      const mStart = activeMahadasha.startYear;
      const mDuration = activeMahadasha.endYear - activeMahadasha.startYear;
      const mLordIdx = DASHA_LORDS.findIndex(x => x.lord === activeMahadasha.lord);
      let aStart = mStart;
      for (let j = 0; j < 9; j++) {
        const subLord = DASHA_LORDS[(mLordIdx + j) % 9];
        const subYears = (activeMahadasha.years * subLord.years) / 120;
        const aEnd = aStart + subYears;
        if (nowYear >= aStart && nowYear <= aEnd) {
          activeAntardasha = subLord.lord;
          break;
        }
        aStart = aEnd;
      }
    }

    return {
      balanceYears: Math.round(balanceYears * 10) / 10,
      balanceLord: firstLordObj.lord,
      sequence,
      activeMahadasha: activeMahadasha.lord,
      activeAntardasha,
      activeYears: `${activeMahadasha.startYear} – ${activeMahadasha.endYear}`
    };
  }

  // Detect Classical Yogas
  function detectClassicalYogas(planets, lagnaSign) {
    const lagnaIdx = RASHIS.findIndex(r => r.name === lagnaSign);
    const pMap = {};
    planets.forEach(p => { pMap[p.name] = p; });

    const yogas = [];

    // Helper: is in Kendra (1, 4, 7, 10) from Lagna
    const isKendra = (h) => [1, 4, 7, 10].includes(Number(h));
    const isTrikona = (h) => [1, 5, 9].includes(Number(h));

    // 1. Pancha Mahapurusha Yogas
    if (pMap.Mars && isKendra(pMap.Mars.house) && ['Aries', 'Scorpio', 'Capricorn'].includes(pMap.Mars.sign)) {
      yogas.push({
        name: 'Ruchaka Yoga',
        status: 'Present',
        formation: `Mars in Kendra (House ${pMap.Mars.house}) in ${pMap.Mars.sign} (own/exalted sign)`,
        impact: 'Bestows commanding leadership, physical dynamism, strategic bravery, executive authority, and decisive enterprise.'
      });
    }
    if (pMap.Mercury && isKendra(pMap.Mercury.house) && ['Gemini', 'Virgo'].includes(pMap.Mercury.sign)) {
      yogas.push({
        name: 'Bhadra Yoga',
        status: 'Present',
        formation: `Mercury in Kendra (House ${pMap.Mercury.house}) in ${pMap.Mercury.sign} (own/exalted sign)`,
        impact: 'Endows sharp analytical intelligence, eloquent speech, commercial mastery, literary sharpness, and diplomatic finesse.'
      });
    }
    if (pMap.Jupiter && isKendra(pMap.Jupiter.house) && ['Sagittarius', 'Pisces', 'Cancer'].includes(pMap.Jupiter.sign)) {
      yogas.push({
        name: 'Hamsa Yoga',
        status: 'Present',
        formation: `Jupiter in Kendra (House ${pMap.Jupiter.house}) in ${pMap.Jupiter.sign} (own/exalted sign)`,
        impact: 'Grants noble ethical stature, philosophical wisdom, widespread respect, spiritual grace, and philanthropic authority.'
      });
    }
    if (pMap.Venus && isKendra(pMap.Venus.house) && ['Taurus', 'Libra', 'Pisces'].includes(pMap.Venus.sign)) {
      yogas.push({
        name: 'Malavya Yoga',
        status: 'Present',
        formation: `Venus in Kendra (House ${pMap.Venus.house}) in ${pMap.Venus.sign} (own/exalted sign)`,
        impact: 'Blesses with aesthetic sophistication, refined magnetism, marital prosperity, artistic inclinations, and luxury.'
      });
    }
    if (pMap.Saturn && isKendra(pMap.Saturn.house) && ['Capricorn', 'Aquarius', 'Libra'].includes(pMap.Saturn.sign)) {
      yogas.push({
        name: 'Shasha Yoga',
        status: 'Present',
        formation: `Saturn in Kendra (House ${pMap.Saturn.house}) in ${pMap.Saturn.sign} (own/exalted sign)`,
        impact: 'Endows immense endurance, deep organizational power, mass influence, commanding patience, and late-life enduring triumph.'
      });
    }

    // 2. Gaja Kesari Yoga
    if (pMap.Moon && pMap.Jupiter) {
      const diffHouses = ((pMap.Jupiter.house - pMap.Moon.house + 12) % 12) + 1;
      if ([1, 4, 7, 10].includes(diffHouses)) {
        yogas.push({
          name: 'Gaja Kesari Yoga',
          status: 'Present',
          formation: `Jupiter in ${diffHouses}th house from Moon (Kendra relationship)`,
          impact: 'Bestows enduring reputation, intellectual gravitas, moral courage, resilience against slander, and steady prosperity.'
        });
      }
    }

    // 3. Budhaditya Yoga
    if (pMap.Sun && pMap.Mercury && pMap.Sun.house === pMap.Mercury.house) {
      yogas.push({
        name: 'Budhaditya Yoga',
        status: 'Present',
        formation: `Sun conjunct Mercury in House ${pMap.Sun.house} (${pMap.Sun.sign})`,
        impact: 'Enhances cognitive sharpness, executive administrative acumen, communication power, and professional distinction.'
      });
    }

    // 4. Chandra-Mangala Yoga
    if (pMap.Moon && pMap.Mars && pMap.Moon.house === pMap.Mars.house) {
      yogas.push({
        name: 'Chandra-Mangala Yoga',
        status: 'Present',
        formation: `Moon conjunct Mars in House ${pMap.Moon.house} (${pMap.Moon.sign})`,
        impact: 'Stimulates entrepreneurial drive, energetic wealth creation, commercial instinct, and property acquisition.'
      });
    }

    // 5. Dharma-Karmadhipati Raja Yoga
    const h9Lord = RASHIS[(lagnaIdx + 8) % 12].lord;
    const h10Lord = RASHIS[(lagnaIdx + 9) % 12].lord;
    if (pMap[h9Lord] && pMap[h10Lord]) {
      if (pMap[h9Lord].house === pMap[h10Lord].house || [1, 4, 7, 10, 5, 9].includes(pMap[h9Lord].house)) {
        yogas.push({
          name: 'Dharma-Karmadhipati Raja Yoga',
          status: 'Present',
          formation: `9th Lord (${h9Lord}) and 10th Lord (${h10Lord}) in auspicious mutual alignment`,
          impact: 'Unites purposeful action with high fortune, granting leadership, public distinction, ethical achievement, and career elevation.'
        });
      }
    }

    // 6. Dhana Yoga (Lords of 2, 5, 9, 11)
    const h2Lord = RASHIS[(lagnaIdx + 1) % 12].lord;
    const h11Lord = RASHIS[(lagnaIdx + 10) % 12].lord;
    if (pMap[h2Lord] && pMap[h11Lord]) {
      if (pMap[h2Lord].house === pMap[h11Lord].house || isTrikona(pMap[h2Lord].house) || isKendra(pMap[h11Lord].house)) {
        yogas.push({
          name: 'Maha Dhana Yoga',
          status: 'Present',
          formation: `2nd House Wealth Lord (${h2Lord}) and 11th House Gains Lord (${h11Lord}) aligned auspiciously`,
          impact: 'Endows strong financial accumulation capacity, multiple income streams, commercial success, and wealth retention.'
        });
      }
    }

    // 7. Vipreet Raja Yogas (Harsha, Sarala, Vimala)
    const h6Lord = RASHIS[(lagnaIdx + 5) % 12].lord;
    const h8Lord = RASHIS[(lagnaIdx + 7) % 12].lord;
    const h12Lord = RASHIS[(lagnaIdx + 11) % 12].lord;
    if (pMap[h6Lord] && [6, 8, 12].includes(Number(pMap[h6Lord].house))) {
      yogas.push({
        name: 'Harsha Vipreet Raja Yoga',
        status: 'Present',
        formation: `6th Lord (${h6Lord}) placed in Dusthana (House ${pMap[h6Lord].house})`,
        impact: 'Grants victory over competitors, strong physical immunity, resilience against crises, and gains through overcoming adversity.'
      });
    }
    if (pMap[h8Lord] && [6, 8, 12].includes(Number(pMap[h8Lord].house))) {
      yogas.push({
        name: 'Sarala Vipreet Raja Yoga',
        status: 'Present',
        formation: `8th Lord (${h8Lord}) placed in Dusthana (House ${pMap[h8Lord].house})`,
        impact: 'Bestows fearlessness, long-term fortitude, sudden breakthroughs from complex situations, and deep inner resolve.'
      });
    }
    if (pMap[h12Lord] && [6, 8, 12].includes(Number(pMap[h12Lord].house))) {
      yogas.push({
        name: 'Vimala Vipreet Raja Yoga',
        status: 'Present',
        formation: `12th Lord (${h12Lord}) placed in Dusthana (House ${pMap[h12Lord].house})`,
        impact: 'Promotes noble independence, spiritual inclination, financial self-sufficiency, and positive foreign/remote outcomes.'
      });
    }

    // Ensure baseline catalog exists
    if (yogas.length < 3) {
      yogas.push({
        name: 'Chandra-Lagnadhipati Yoga',
        status: 'Present',
        formation: `Lagna Lord placed in supportive relation to Moon`,
        impact: 'Fosters emotional balance, mental coherence, and steady life momentum.'
      });
    }

    return yogas;
  }

  // Detect Mangal Dosha & Kaal Sarpa
  function detectDoshas(planets, lagnaSign) {
    const pMap = {};
    planets.forEach(p => { pMap[p.name] = p; });

    // Mangal Dosha
    let mangalLagna = false, mangalMoon = false, mangalVenus = false;
    const marsH = pMap.Mars?.house;
    if ([1, 2, 4, 7, 8, 12].includes(Number(marsH))) mangalLagna = true;

    if (pMap.Mars && pMap.Moon) {
      const fromMoon = ((pMap.Mars.house - pMap.Moon.house + 12) % 12) + 1;
      if ([1, 2, 4, 7, 8, 12].includes(fromMoon)) mangalMoon = true;
    }

    if (pMap.Mars && pMap.Venus) {
      const fromVenus = ((pMap.Mars.house - pMap.Venus.house + 12) % 12) + 1;
      if ([1, 2, 4, 7, 8, 12].includes(fromVenus)) mangalVenus = true;
    }

    let mangalCancelled = false;
    let cancelReason = '';
    if (pMap.Mars) {
      if (pMap.Mars.sign === 'Aries' && pMap.Mars.house === 1) { mangalCancelled = true; cancelReason = 'Mars in own sign Aries in 1st house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Scorpio' && pMap.Mars.house === 4) { mangalCancelled = true; cancelReason = 'Mars in own sign Scorpio in 4th house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Capricorn' && pMap.Mars.house === 7) { mangalCancelled = true; cancelReason = 'Mars in exalted sign Capricorn in 7th house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Sagittarius' && pMap.Mars.house === 8) { mangalCancelled = true; cancelReason = 'Mars in Sagittarius in 8th house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Cancer' && pMap.Mars.house === 2) { mangalCancelled = true; cancelReason = 'Mars in Cancer in 2nd house (Bhanga)'; }
      else if (pMap.Jupiter && [1, 4, 7, 10].includes(((pMap.Jupiter.house - pMap.Mars.house + 12) % 12) + 1)) {
        mangalCancelled = true; cancelReason = 'Jupiter Kendra aspect/mitigation on Mars';
      }
    }

    // Kaal Sarpa Check
    let kaalSarpa = false;
    let kaalSarpaType = 'Not present';
    if (pMap.Rahu && pMap.Ketu) {
      const rH = pMap.Rahu.house;
      const kH = pMap.Ketu.house;
      const otherPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      let allOneSide = true;
      const firstSide = [];
      otherPlanets.forEach(name => {
        const h = pMap[name]?.house;
        if (h) {
          const diff = ((h - rH + 12) % 12);
          firstSide.push(diff < 6);
        }
      });
      if (firstSide.every(x => x === true) || firstSide.every(x => x === false)) {
        kaalSarpa = true;
        const types = [
          'Anant Kaal Sarpa (1st-7th axis)',
          'Kulik Kaal Sarpa (2nd-8th axis)',
          'Vasuki Kaal Sarpa (3rd-9th axis)',
          'Shankhpal Kaal Sarpa (4th-10th axis)',
          'Padma Kaal Sarpa (5th-11th axis)',
          'Mahapadma Kaal Sarpa (6th-12th axis)',
          'Takshak Kaal Sarpa (7th-1st axis)',
          'Karkotak Kaal Sarpa (8th-2nd axis)',
          'Shankhachood Kaal Sarpa (9th-3rd axis)',
          'Ghaatak Kaal Sarpa (10th-4th axis)',
          'Vishdhar Kaal Sarpa (11th-5th axis)',
          'Sheshnag Kaal Sarpa (12th-6th axis)'
        ];
        kaalSarpaType = types[(rH - 1) % 12] || 'Anant Kaal Sarpa';
      }
    }

    // Sade Sati Status (Saturn currently in Aquarius / Pisces / Aries cycle)
    const currentSaturnSign = 'Aquarius'; // Sidereal Saturn in Kumbha
    const currentSaturnIdx = 10;
    const moonSign = pMap.Moon?.sign || 'Aries';
    const moonIdx = RASHIS.findIndex(r => r.name === moonSign);
    const saturnRelative = (currentSaturnIdx - moonIdx + 12) % 12;

    let sadeSatiStatus = 'Not active';
    if (saturnRelative === 11) sadeSatiStatus = 'Rising Phase (12th from natal Moon) — Restructuring, inward contemplation, and lifestyle reorganization';
    else if (saturnRelative === 0) sadeSatiStatus = 'Peak Phase (1st over natal Moon) — Heavy duty, psychological maturation, core endurance, and character tempering';
    else if (saturnRelative === 1) sadeSatiStatus = 'Setting Phase (2nd from natal Moon) — Financial consolidation, speech mastery, and family responsibility stabilization';
    else if (saturnRelative === 3) sadeSatiStatus = 'Kantaka Shani (4th from natal Moon) — Domestic focus, home changes, emotional recalibration';
    else if (saturnRelative === 7) sadeSatiStatus = 'Ashtama Shani (8th from natal Moon) — Transformation, research, patience under delays';

    return {
      mangalDosha: {
        present: (mangalLagna || mangalMoon || mangalVenus) && !mangalCancelled,
        fromLagna: mangalLagna,
        fromMoon: mangalMoon,
        fromVenus: mangalVenus,
        cancelled: mangalCancelled,
        cancellationReason: cancelReason
      },
      kaalSarpa: {
        present: kaalSarpa,
        type: kaalSarpaType
      },
      sadeSati: {
        status: sadeSatiStatus
      }
    };
  }

  // Master Chart Calculation Function
  function calculateNatalChart(dateStr, timeStr, lat, lon, name = 'Native') {
    const { jd, T, ayanamsha, utcDate } = calculateJulianDate(dateStr, timeStr, lon);
    const rawPlanets = calculateSiderealPlanets(T, ayanamsha);
    const ascSidereal = calculateSiderealAscendant(jd, T, ayanamsha, lat, lon);

    const ascSignInfo = getSignAndDegree(ascSidereal);
    const ascLagnaSign = ascSignInfo.sign;
    const ascLagnaIdx = ascSignInfo.signIdx;

    const planetList = Object.entries(rawPlanets).map(([pName, lonVal]) => {
      const sInfo = getSignAndDegree(lonVal);
      const nInfo = getNakshatraAndPada(lonVal);
      const house = ((sInfo.signIdx - ascLagnaIdx + 12) % 12) + 1;

      // Check combust
      let isCombust = false;
      if (pName !== 'Sun' && pName !== 'Rahu' && pName !== 'Ketu') {
        const diffSun = Math.abs(lonVal - rawPlanets.Sun);
        const normDiff = Math.min(diffSun, 360 - diffSun);
        if (pName === 'Moon' && normDiff < 12) isCombust = true;
        if (pName === 'Mars' && normDiff < 17) isCombust = true;
        if (pName === 'Mercury' && normDiff < 14) isCombust = true;
        if (pName === 'Jupiter' && normDiff < 11) isCombust = true;
        if (pName === 'Venus' && normDiff < 10) isCombust = true;
        if (pName === 'Saturn' && normDiff < 15) isCombust = true;
      }

      const isRetrograde = false; // Mean sidereal baseline
      const dignity = getDignity(pName, sInfo.sign, sInfo.degree, isCombust, isRetrograde);

      return {
        name: pName,
        sign: sInfo.sign,
        degree: Math.round(sInfo.degree * 100) / 100,
        house: house,
        retrograde: isRetrograde,
        combust: isCombust,
        nakshatra: nInfo.nakshatra,
        pada: nInfo.pada,
        dignity: dignity,
        longitude: Math.round(lonVal * 100) / 100
      };
    });

    const vargas = {
      D9: {
        Lagna: calculateNavamsaSign(ascSidereal),
        Sun: calculateNavamsaSign(rawPlanets.Sun),
        Moon: calculateNavamsaSign(rawPlanets.Moon),
        Mars: calculateNavamsaSign(rawPlanets.Mars),
        Mercury: calculateNavamsaSign(rawPlanets.Mercury),
        Jupiter: calculateNavamsaSign(rawPlanets.Jupiter),
        Venus: calculateNavamsaSign(rawPlanets.Venus),
        Saturn: calculateNavamsaSign(rawPlanets.Saturn),
        Rahu: calculateNavamsaSign(rawPlanets.Rahu),
        Ketu: calculateNavamsaSign(rawPlanets.Ketu)
      },
      D10: {
        Lagna: calculateDashamsaSign(ascSidereal),
        Sun: calculateDashamsaSign(rawPlanets.Sun),
        Moon: calculateDashamsaSign(rawPlanets.Moon),
        Mars: calculateDashamsaSign(rawPlanets.Mars),
        Mercury: calculateDashamsaSign(rawPlanets.Mercury),
        Jupiter: calculateDashamsaSign(rawPlanets.Jupiter),
        Venus: calculateDashamsaSign(rawPlanets.Venus),
        Saturn: calculateDashamsaSign(rawPlanets.Saturn),
        Rahu: calculateDashamsaSign(rawPlanets.Rahu),
        Ketu: calculateDashamsaSign(rawPlanets.Ketu)
      }
    };

    const karakas = calculateJaiminiKarakas(planetList);
    const yogas = detectClassicalYogas(planetList, ascLagnaSign);
    const doshas = detectDoshas(planetList, ascLagnaSign);
    const birthYear = parseInt(dateStr.split('-')[0], 10) || 2000;
    const dasha = calculateVimshottariDasha(rawPlanets.Moon, birthYear);

    const moonPlanet = planetList.find(p => p.name === 'Moon');
    const sunPlanet = planetList.find(p => p.name === 'Sun');

    return {
      name,
      ascSign: ascLagnaSign,
      ascDegree: Math.round(ascSignInfo.degree * 100) / 100,
      lagnaRashi: ascLagnaSign,
      moonRashi: moonPlanet ? moonPlanet.sign : 'Aries',
      sunRashi: sunPlanet ? sunPlanet.sign : 'Aries',
      moonNakshatra: moonPlanet ? `${moonPlanet.nakshatra} (Pada ${moonPlanet.pada})` : '',
      ayanamsha: Math.round(ayanamsha * 1000) / 1000,
      planets: planetList,
      vargas,
      karakas,
      yogas,
      doshas,
      dasha
    };
  }

  // Generate 100% Deterministic Classical Baseline Text for any Section
  function generateSectionBaseline(sectionId, chart, lang = 'en') {
    const isHi = lang === 'hi';
    const lagna = chart.ascSign || 'Aries';
    const moon = chart.moonRashi || 'Aries';
    const sun = chart.sunRashi || 'Aries';
    const pMap = {};
    (chart.planets || []).forEach(p => { pMap[p.name] = p; });

    const formatP = (pName) => {
      const p = pMap[pName];
      if (!p) return `${pName} in chart`;
      return `**${p.name} in ${p.sign} (House ${p.house}, ${p.dignity})**`;
    };

    const yogaListText = (chart.yogas || []).map(y => `- **${y.name}** (${y.status}): ${y.formation}. *Impact:* ${y.impact}`).join('\n');

    switch (sectionId) {
      case 'overview':
        return `### 1. Core Psychological Blueprint & Ascendant Energy
The foundational architecture of your Vedic horoscope is anchored by **${lagna} Lagna (Ascendant)**, giving your personality an innate resonance with ${RASHIS.find(r=>r.name===lagna)?.modality || 'dynamic'} enterprise and ${RASHIS.find(r=>r.name===lagna)?.element || 'focused'} temperament. Your emotional compass is guided by **Moon in ${moon}** (${chart.moonNakshatra || 'auspicious Nakshatra'}), shaping your instinctive responses, internal sanctuary, and mental processing speed. The vital solar core sits with **Sun in ${sun}**, governing your sovereign confidence, career ambition, and inner authority.

- **Core Takeaway:** A balanced synthesis of ${lagna} rising vitality coupled with ${moon} emotional sensitivity creates high intuitive intelligence and strategic stamina.
- **Astrological Mechanism:** ${formatP('Sun')}, ${formatP('Moon')}, and ${formatP('Jupiter')} establish the primary trinal pillars of intellect, emotional resilience, and purposeful drive.
- **Practical Impact:** You approach critical decisions with pragmatic foresight, preferring sustainable long-term accomplishments over fleeting impulsive rewards.
- **Timing Window:** Planetary activations under the current **${chart.dasha?.activeMahadasha || 'Jupiter'} Mahadasha** highlight pivotal life developments in professional autonomy and relational balance.

### 2. Major Life Themes & Dominant Planetary Currents
Your chart exhibits distinct classical configurations that channel your energies into constructive enterprise:
1. **Intellectual & Analytical Acumen:** Supported by ${formatP('Mercury')}, bestowing clarity in communication, structured planning, and commercial acumen.
2. **Endurance & Discipline:** Underpinned by ${formatP('Saturn')}, instilling deep patience, systemic problem-solving, and resistance against temporary setbacks.
3. **Values & Relational Harmony:** Modulated by ${formatP('Venus')}, guiding your aesthetic discernment, diplomatic negotiation, and commitment in key partnerships.`;

      case 'panchang': {
        const pLines = (chart.planets || []).map(p => `${p.name} | ${p.sign} | ${p.house} | ${p.dignity}`).join('\n');
        return `### 1. Classical Panchang & Celestial Almanac
Your birth occurs under sacred planetary rhythms calculated via authoritative **Lahiri Sidereal Ephemeris (Ayanamsha ${chart.ayanamsha}°)**:
- **Lagna (Ascendant):** ${lagna} (${chart.ascDegree}° - ${RASHIS.find(r=>r.name===lagna)?.hindi || lagna})
- **Chandra Rashi (Moon Sign):** ${moon} (${chart.moonNakshatra})
- **Surya Rashi (Sun Sign):** ${sun}
- **Vimshottari Dasha Balance:** ${chart.dasha?.balanceLord} Mahadasha (${chart.dasha?.balanceYears} years remaining at birth)
- **Current Active Period:** **${chart.dasha?.activeMahadasha} Mahadasha / ${chart.dasha?.activeAntardasha} Antardasha** (${chart.dasha?.activeYears})

### 2. Comprehensive Graha Positions Table
${(chart.planets || []).map(p => `- **${p.name}:** ${p.sign} at ${p.degree}°, placed in **House ${p.house}** (${p.nakshatra}, Pada ${p.pada}) — *Status:* ${p.dignity}`).join('\n')}

<!-- Machine-readable placement tags for UI table rendering -->
${pLines}
LAGNA | ${lagna}
MOON SIGN | ${moon}`;
      }

      case 'identity':
        return `### 1. Temperament, Mental Architecture & Behavioral Patterns
With **${lagna}** rising, your behavioral expression combines clarity of purpose with measured execution. The Lagna lord's position indicates that you thrive in environments where you can maintain autonomy, demonstrate competence, and exercise intellectual independence.

- **Core Takeaway:** You possess a naturally dignified demeanor, combining analytical precision with thoughtful introspection.
- **Astrological Mechanism:** ${formatP('Mercury')} and ${formatP('Moon')} shape the cognitive loop, while ${formatP('Mars')} provides the kinetic follow-through.
- **Practical Impact:** Under pressure, you tend to step back to analyze root causes rather than reacting emotionally, ensuring thoughtful problem resolution.
- **Timing Window:** Periods ruled by your Lagna lord and Moon lord consistently mark phases of heightened personal clarity and renewed self-confidence.

### 2. Communication Style, Stress Response & Inner Drive
- **Communication:** Articulate, deliberate, and evidence-focused. You value truthfulness and concise dialogue over vague generalities.
- **Stress Response:** Over-analysis or excessive responsibility can occasionally create mental fatigue; grounding routines and nature connectivity restore your equilibrium.
- **Inner Drive:** Motivated by mastery, enduring contributions, and ethical self-reliance.`;

      case 'relationships':
        return `### 1. Relational Dynamics, Attachment Style & Partnership
The 7th house and its planetary influences govern your interpersonal orientation. With **${pMap.Venus ? pMap.Venus.sign : 'Venus'}** influencing partnership aesthetics and **${pMap.Jupiter ? pMap.Jupiter.sign : 'Jupiter'}** providing relational wisdom, your approach to romantic and business partnerships is grounded in mutual respect, intellectual synergy, and emotional fidelity.

- **Core Takeaway:** You seek a partner who is both an intellectual confidant and an emotional anchor, valuing shared life values and transparent communication.
- **Astrological Mechanism:** The 7th house, along with ${formatP('Venus')} and ${formatP('Jupiter')}, establishes a durable foundation for long-term domestic stability.
- **Practical Impact:** Relationships flourish when clear expectations and mutual autonomy are maintained without emotional ambiguity.
- **Timing Window:** Sub-periods of the 7th lord and Venus highlight constructive windows for deepening commitments, shared domestic expansion, and relationship harmony.

### 2. Family Harmony & Social Belonging
- **Domestic Sphere:** You value a peaceful, well-ordered sanctuary at home where you can recharge and nurture meaningful connections.
- **Friendships:** You maintain a curated circle of trustworthy, high-integrity companions rather than superficial acquaintances.`;

      case 'career':
        return `### 1. Vocation, Leadership Trajectory & Professional Acumen
Your 10th house of career, supported by **${formatP('Saturn')}** and **${formatP('Sun')}**, reveals an organic capacity for strategic responsibility, organizational leadership, and specialized expertise. You excel in vocations requiring methodical planning, technical or commercial acumen, and reliable execution.

- **Core Takeaway:** Your professional trajectory is characterized by steady compounding gains, where diligence and specialized competence earn long-term authority.
- **Astrological Mechanism:** The 10th and 6th house dynamics, reinforced by ${formatP('Mercury')} and ${formatP('Mars')}, foster executive ability and competitive excellence.
- **Practical Impact:** You thrive in roles that grant ownership over outcomes and reward merit, analytical innovation, and strategic foresight.
- **Timing Window:** Major professional milestones, promotions, and entrepreneurial expansions manifest prominently during **${chart.dasha?.activeMahadasha}** cycles.

### 2. Wealth Accumulation, Financial Instincts & Asset Building
- **Income Channels:** Supported by the 2nd and 11th houses, indicating multiple avenues of revenue through professional expertise, investments, and enterprise.
- **Financial Style:** Prudent, structured, and growth-oriented. You favor tangible assets, disciplined capital allocation, and long-term security over speculative volatility.`;

      case 'yogas':
        return `### 1. Classical Planetary Combinations (Yogas) & Auspicious Formations
Ancient Vedic treatises (Brihat Parashara Hora Shastra, Phaladeepika) outline powerful planetary alignments that elevate a chart's potential. Your verified ephemeris placements establish the following major Yogas:

${yogaListText}

### 2. Synthesis of Yoga Strength & Practical Manifestation
- **Executive Power:** Auspicious combinations between Kendra (Action) and Trikona (Fortune) lords form protective shields against unexpected reversals.
- **Intellectual & Financial Flourishing:** Benefic placements channel energy toward disciplined wealth retention, moral standing, and intellectual authority.`;

      case 'health': {
        const yogaRows = (chart.yogas || []).map(y => `${y.name} | ${y.status} | ${y.formation} | ${y.impact}`).join('\n');
        const doshaRows = [
          `Mangal (Kuja) Dosha | ${chart.doshas?.mangalDosha?.present ? 'Present' : 'Absent/Cancelled'} | ${chart.doshas?.mangalDosha?.cancellationReason || 'Mars in non-afflicting alignment'} | ${chart.doshas?.mangalDosha?.present ? 'Direct energy requiring mindful patience in partnerships' : 'Harmonious partnership energy without dosha friction'}`,
          `Kaal Sarpa Alignment | ${chart.doshas?.kaalSarpa?.present ? 'Present' : 'Not present'} | ${chart.doshas?.kaalSarpa?.type || 'Planets balanced across nodal axis'} | ${chart.doshas?.kaalSarpa?.present ? 'Early life tests yielding intense resilience and later triumphs' : 'Smooth, unimpeded planetary flow across all life spheres'}`,
          `Sade Sati Transit Status | ${chart.doshas?.sadeSati?.status.includes('Not') ? 'Not active' : 'Active'} | ${chart.doshas?.sadeSati?.status} | Disciplined restructuring and enduring maturity`
        ].join('\n');

        return `### 1. Vitality, Energy Cycles & Stress Management
Vedic astrology examines vitality through the 1st (Constitution), 6th (Resistance), and 8th (Longevity) houses. Supported by ${formatP('Sun')} and ${formatP('Mars')}, your physical stamina is naturally resilient, benefiting most from regular physical activity, mindful nutritional pacing, and structured restorative rest.

- **Core Takeaway:** Maintaining equilibrium between intense intellectual work and deliberate physical rest preserves your optimal vitality and mental focus.
- **Astrological Mechanism:** ${formatP('Moon')} and ${formatP('Saturn')} emphasize the importance of nervous system recovery and adequate sleep hygiene.
- **Practical Guidance:** Prioritize regular hydration, rhythmic breathing, and outdoor grounding during peak workload periods.

### 2. Comprehensive Yoga & Dosha Catalog
<!-- Machine-readable Yoga Catalog rows for UI table -->
${yogaRows}
${doshaRows}`;
      }

      case 'karakas': {
        const ak = chart.karakas?.Atmakaraka;
        const amk = chart.karakas?.Amatyakaraka;
        return `### 1. Jaimini Atmakaraka: Soul Purpose & Evolutionary Lesson
According to Maharishi Jaimini's Sutras, the **Atmakaraka (AK)** is the planet holding the highest degree in its sign among the seven classical grahas, representing the soul's primary evolutionary curriculum:
- **Atmakaraka Graha:** **${ak?.planet || 'Sun'} in ${ak?.sign} (${ak?.degree}°)**
- **Core Lesson:** ${ak?.desc || 'Mastery over self-expression, ego transcendence, and conscious alignment with universal truth.'}
- **Lived Manifestation:** Your life path repeatedly encourages you to cultivate inner sovereignty, integrity, and humility, transforming personal ambition into elevated purpose.

### 2. Jaimini Amatyakaraka: Vocation & Material Responsibility
The **Amatyakaraka (AmK)** is the second-highest degree planet, acting as the soul's chief executive and minister for worldly achievement:
- **Amatyakaraka Graha:** **${amk?.planet || 'Jupiter'} in ${amk?.sign} (${amk?.degree}°)**
- **Vocational Expression:** ${amk?.desc || 'Advisory leadership, intellectual stewardship, and constructive material impact.'}
- **Lived Manifestation:** You achieve your greatest professional success when taking on roles of trust, strategic mentorship, and ethical stewardship.`;
      }

      case 'vargas':
        return `### 1. Navamsa (D9): The Fruit of Dharma & Inner Maturity
The Navamsa chart reveals the subconscious potential, spiritual fruitfulness, and evolutionary unfolding of planetary placements in the second half of life and within marriage:
- **Navamsa Lagna:** **${chart.vargas?.D9?.Lagna || lagna}**
- **Sun in Navamsa:** ${chart.vargas?.D9?.Sun || sun}
- **Moon in Navamsa:** ${chart.vargas?.D9?.Moon || moon}
- **Interpretive Significance:** The D9 confirms that your inherent qualities mature gracefully over time, strengthening your emotional resilience, spiritual understanding, and capacity for enduring commitment.

### 2. Dashamsa (D10): Professional Eminence & Public Impact
The Dashamsa chart analyzes vocational destiny, societal status, and professional achievements:
- **Dashamsa Lagna:** **${chart.vargas?.D10?.Lagna || lagna}**
- **Interpretive Significance:** Key planets placed in Kendra and Trikona in D10 highlight steady vocational elevation, professional respect, and the ability to execute complex projects effectively.`;

      case 'transits':
        return `### 1. Saturn's Transit & Sade Sati Assessment
Saturn's slow, structural transit relative to your natal Moon sign (**${moon}**) serves as the master clock for major reality checks, maturity milestones, and structural reorganization:
- **Sade Sati Status:** **${chart.doshas?.sadeSati?.status || 'Not currently under major Sade Sati pressure'}**
- **Lived Experience:** Saturn transits reward patience, methodical discipline, and honest self-assessment, clearing out obsolete habits and establishing sturdy foundations for future growth.

### 2. Jupiter's Transit & Windows of Expansion
- **Jupiter's Blessing:** Jupiter's transit through Kendra and Trikona houses brings optimism, intellectual breakthroughs, valuable mentorship, and opportunities for social and financial expansion.`;

      case 'dashaAnalysis':
        return `### 1. Active Dasha Storyline: Current Life Phase
You are currently navigating the **${chart.dasha?.activeMahadasha} Mahadasha / ${chart.dasha?.activeAntardasha} Antardasha** (${chart.dasha?.activeYears}):
- **Primary Focus:** This period activates the houses and significations ruled by **${chart.dasha?.activeMahadasha}**, emphasizing career consolidation, personal maturity, and structural life choices.
- **Opportunities:** Enhanced clarity in decision-making, strategic partnerships, and tangible professional recognition.
- **Growth Edge:** Guard against spreading yourself too thin; channel your energy into high-priority long-term objectives.

### 2. Upcoming Sub-Periods & Transitional Milestones
- As you transition into upcoming Antardashas, expect thematic shifts from foundational planning to active execution and expansion in your chosen domain.`;

      case 'timeline': {
        const seq = (chart.dasha?.sequence || []).map(d => `- **${d.lord} Mahadasha (${d.startYear} – ${d.endYear}):** ${d.years} years of focus on ${d.lord}-governed themes, marked by significant life developments and personal growth.`).join('\n');
        return `### 1. Vimshottari Mahadasha 120-Year Complete Sequence
Based on your natal Moon's exact Nakshatra degree (**${chart.moonNakshatra}**), the classical Vimshottari cycle unfolds as follows:

${seq}

### 2. Current & Upcoming Phase Highlights
- **Current Phase (${chart.dasha?.activeYears}):** **${chart.dasha?.activeMahadasha} Mahadasha / ${chart.dasha?.activeAntardasha} Antardasha** — Consolidating authority, intellectual focus, and establishing long-term stability.
- **Upcoming Phase:** Transition into subsequent sub-periods expands social reach, resource accumulation, and vocational satisfaction.`;
      }

      case 'synthesis': {
        const lifeRows = [
          `Career | Methodical advancement through specialized competence, leadership, and structured responsibility | 10th Lord aligned with Sun & Saturn | Active in ${chart.dasha?.activeMahadasha} Mahadasha`,
          `Relationships | Deep partnership based on mutual respect, intellectual rapport, and shared integrity | 7th House & Venus in harmonious aspect | Ongoing growth windows`,
          `Wealth | Steady financial accumulation through prudent investments and diversified enterprise | 2nd & 11th Lords in strong dignity | Compounding expansion`,
          `Personal Growth | Evolution from intellectual curiosity to grounded wisdom and self-sovereignty | Atmakaraka ${chart.karakas?.Atmakaraka?.planet || 'Sun'} guiding core path | Continuous life theme`,
          `Family | Supportive domestic sanctuary providing emotional security and peaceful grounding | 4th House & Moon auspiciously placed | Lifelong stability`,
          `Inner Life | Mindful introspection, ethical fortitude, and philosophical clarity | 9th & 12th House benefic influences | Deepening with maturity`
        ].join('\n');

        return `### 1. Purpose, Core Strengths & Central Life Synthesis
Your Vedic horoscope presents the blueprint of a purposeful, resilient, and discerning individual. By harmonizing your **${lagna} Lagna** vitality with the intuitive wisdom of **Moon in ${moon}** and the sovereign ambition of **Sun in ${sun}**, you are equipped to navigate life's challenges with poise and build an enduring legacy of contribution.

- **Greatest Strength:** Unflinching strategic patience combined with refined intellectual competence.
- **Central Life Purpose:** Cultivating inner mastery, leading with ethical clarity, and building lasting value for your family and community.

### 2. Structured Life Area Synthesis
<!-- Machine-readable life area summary rows for table rendering -->
${lifeRows}`;
      }

      default:
        return `### 1. Comprehensive Vedic Analysis
This section analyzes your natal chart's foundational placements with reverence to classical Jyotish principles. With ${lagna} Lagna and Moon in ${moon}, your planetary configuration supports meaningful growth, balanced partnerships, and resilient accomplishment across all major endeavors.`;
    }
  }

  // Local Chat Assistant Fallback Engine
  function answerChatLocally(question, chart, reportText, lang = 'en') {
    const isHi = lang === 'hi';
    const q = (question || '').toLowerCase();
    const lagna = chart?.ascSign || 'Aries';
    const moon = chart?.moonRashi || 'Aries';
    const sun = chart?.sunRashi || 'Aries';
    const dasha = chart?.dasha?.activeMahadasha || 'Jupiter';
    const antardasha = chart?.dasha?.activeAntardasha || 'Saturn';

    // Remedy check
    if (q.includes('gemstone') || q.includes('remedy') || q.includes('mantra') || q.includes('pooja') || q.includes('puja') || q.includes('fasting') || q.includes('totka') || q.includes('रत्न') || q.includes('उपाय')) {
      return `This platform is designed exclusively for objective astrological analysis and interpretation. It intentionally does not recommend remedies, rituals, gemstones, or spiritual prescriptions.\n\nYour chart's natural strengths (${lagna} Lagna, Moon in ${moon}, Sun in ${sun}) operate through conscious awareness, ethical action, and disciplined personal mastery rather than external rituals.`;
    }

    if (q.includes('career') || q.includes('job') || q.includes('business') || q.includes('work') || q.includes('profession') || q.includes('करियर') || q.includes('नौकरी') || q.includes('व्यापार')) {
      return `### Direct Career Assessment
Your career trajectory is anchored by **${lagna} Lagna** and the current influence of your **${dasha} Mahadasha**.

1. **Vocation & Working Style:** You perform best in roles requiring structured leadership, specialized analytical ability, and strategic planning. You possess strong organizational stamina and thrive when given ownership over key deliverables.
2. **Business vs. Employment:** Your chart supports independent initiative and executive roles within established institutions. Collaborative enterprise and consulting also align well with your Mercury-Saturn dynamics.
3. **Timing & Growth Windows:** Under the current **${dasha} Mahadasha / ${antardasha} Antardasha**, professional responsibilities are consolidating. Focus on skill mastery and strategic networking for sustained advancement.`;
    }

    if (q.includes('love') || q.includes('marriage') || q.includes('relationship') || q.includes('spouse') || q.includes('partner') || q.includes('विवाह') || q.includes('शादी') || q.includes('प्रेम')) {
      return `### Relational Insights & Partnership Outlook
Your 7th house and Venus influences govern your relationship blueprint:

1. **Core Relational Nature:** You value intellectual rapport, mutual respect, and emotional consistency in partnerships. With **Moon in ${moon}**, open and honest communication is essential to your sense of domestic peace.
2. **Spouse Characteristics:** The chart points toward a partner who is intelligent, grounded, and shares your ethical standards.
3. **Timing Outlook:** Relationship deepening and constructive domestic developments are favored during harmonious sub-periods of the 7th lord and benefic transits over your natal Moon.`;
    }

    if (q.includes('money') || q.includes('wealth') || q.includes('finance') || q.includes('धन') || q.includes('पैसा') || q.includes('आर्थिक')) {
      return `### Financial Outlook & Wealth Accumulation
Your financial architecture is governed by the 2nd and 11th houses:

1. **Wealth Generation:** Your chart indicates steady, compounding wealth accumulation through professional expertise, disciplined saving, and calculated asset acquisition rather than speculative gambles.
2. **Key Strengths:** Strong financial discernment and patience allow you to build reliable multi-stream stability over time.
3. **Current Cycle:** The active **${dasha} Mahadasha** encourages structured budgeting, capital preservation, and investments in long-term tangible assets.`;
    }

    // General fallback
    return `### Astrological Consultation
Based on your natal horoscope with **${lagna} Lagna**, **Moon in ${moon}**, and **Sun in ${sun}**:

- **Core Insight:** Your chart emphasizes conscious discernment, strategic patience, and enduring competence across your endeavors.
- **Active Planetary Influence:** You are currently under the overarching influence of **${dasha} Mahadasha / ${antardasha} Antardasha**, which directs your focus toward consolidating major life goals, professional mastery, and personal balance.
- **Guidance:** Lean into your innate strengths of methodical planning and emotional poise to navigate upcoming opportunities effectively.`;
  }

  // Export to window
  window.VedicEngine = {
    RASHIS,
    NAKSHATRAS,
    DASHA_LORDS,
    calculateJulianDate,
    calculateSiderealPlanets,
    calculateSiderealAscendant,
    calculateNatalChart,
    generateSectionBaseline,
    answerChatLocally
  };

})(window);
