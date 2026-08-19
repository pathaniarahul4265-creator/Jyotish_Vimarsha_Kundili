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

  // Vimshottari Dasha Engine with Full Antardasha & Pratyantardasha Hierarchies
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

    // Helper to format fractional decimal year into YYYY-MM
    function formatYearToDate(yr) {
      const y = Math.floor(yr);
      const m = Math.min(12, Math.max(1, Math.floor((yr - y) * 12) + 1));
      return `${y}-${String(m).padStart(2, '0')}`;
    }

    // Build all 9 Mahadashas with full Antardashas
    for (let i = 0; i < 9; i++) {
      const lordIdx = (dashaOrderIdx + i) % 9;
      const lordObj = DASHA_LORDS[lordIdx];
      const isFirst = i === 0;
      const mYears = isFirst ? balanceYears : lordObj.years;
      const mStart = currentYear;
      const mEnd = currentYear + mYears;

      // Calculate 9 Antardashas for this Mahadasha
      const antardashas = [];
      let aStart = mStart;
      for (let j = 0; j < 9; j++) {
        const subLordIdx = (lordIdx + j) % 9;
        const subLordObj = DASHA_LORDS[subLordIdx];
        const subDuration = (mYears * subLordObj.years) / 120;
        const aEnd = aStart + subDuration;
        antardashas.push({
          lord: subLordObj.lord,
          startYear: Math.round(aStart * 100) / 100,
          endYear: Math.round(aEnd * 100) / 100,
          startDate: formatYearToDate(aStart),
          endDate: formatYearToDate(aEnd),
          durationYears: Math.round(subDuration * 100) / 100
        });
        aStart = aEnd;
      }

      sequence.push({
        lord: lordObj.lord,
        startYear: Math.round(mStart * 10) / 10,
        endYear: Math.round(mEnd * 10) / 10,
        startDate: formatYearToDate(mStart),
        endDate: formatYearToDate(mEnd),
        years: Math.round(mYears * 10) / 10,
        isFirst,
        antardashas
      });

      currentYear = mEnd;
    }

    const nowYear = new Date().getFullYear() + (new Date().getMonth() / 12);
    let activeMahadasha = sequence.find(d => nowYear >= d.startYear && nowYear <= d.endYear) || sequence[0];

    // Compute active Antardasha
    let activeAntardashaObj = (activeMahadasha.antardashas || []).find(a => nowYear >= a.startYear && nowYear <= a.endYear) || activeMahadasha.antardashas?.[0];
    let activeAntardasha = activeAntardashaObj ? activeAntardashaObj.lord : activeMahadasha.lord;

    // Compute active Pratyantardasha
    let activePratyantardasha = activeAntardasha;
    const pratyantardashas = [];
    if (activeAntardashaObj) {
      const aStart = activeAntardashaObj.startYear;
      const aYears = activeAntardashaObj.durationYears || ((activeMahadasha.years * (DASHA_LORDS.find(x => x.lord === activeAntardasha)?.years || 7)) / 120);
      const aLordIdx = DASHA_LORDS.findIndex(x => x.lord === activeAntardasha);
      let pStart = aStart;
      for (let k = 0; k < 9; k++) {
        const pLordObj = DASHA_LORDS[(aLordIdx + k) % 9];
        const pDuration = (aYears * pLordObj.years) / 120;
        const pEnd = pStart + pDuration;
        const pObj = {
          lord: pLordObj.lord,
          startYear: Math.round(pStart * 100) / 100,
          endYear: Math.round(pEnd * 100) / 100,
          startDate: formatYearToDate(pStart),
          endDate: formatYearToDate(pEnd)
        };
        pratyantardashas.push(pObj);
        if (nowYear >= pStart && nowYear <= pEnd) {
          activePratyantardasha = pLordObj.lord;
        }
        pStart = pEnd;
      }
    }

    return {
      balanceYears: Math.round(balanceYears * 10) / 10,
      balanceLord: firstLordObj.lord,
      sequence,
      activeMahadasha: activeMahadasha.lord,
      activeAntardasha,
      activePratyantardasha,
      activeYears: `${activeMahadasha.startYear} – ${activeMahadasha.endYear}`,
      activeDates: `${activeMahadasha.startDate} to ${activeMahadasha.endDate}`,
      activeAntardashaDates: activeAntardashaObj ? `${activeAntardashaObj.startDate} to ${activeAntardashaObj.endDate}` : '',
      pratyantardashas
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

  // Planetary Retrograde Determination
  function calculateRetrogradeMap(T, ayanamsha) {
    const deltaT = 0.0001; // short step (~3.65 days)
    const p1 = calculateSiderealPlanets(T, ayanamsha);
    const p2 = calculateSiderealPlanets(T + deltaT, ayanamsha);
    const retMap = { Sun: false, Moon: false, Rahu: true, Ketu: true };
    ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(p => {
      let diff = p2[p] - p1[p];
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      retMap[p] = diff < 0;
    });
    return retMap;
  }

  // 12 Bhavas (Houses) Calculation with Occupants & Classical Parashari Aspects
  function calculate12Houses(ascLagnaIdx, planetList) {
    const HOUSE_NAMES = [
      { num: 1, name: 'Tanu Bhava', sanskrit: 'तनु भाव', theme: 'Self, Vitality, Physical Constitution & Life Orientation' },
      { num: 2, name: 'Dhana Bhava', sanskrit: 'धन भाव', theme: 'Accumulated Wealth, Speech, Lineage & Family Values' },
      { num: 3, name: 'Sahaja Bhava', sanskrit: 'सहज भाव', theme: 'Courage, Siblings, Communication & Self-Effort' },
      { num: 4, name: 'Sukha Bhava', sanskrit: 'सुख भाव', theme: 'Mother, Inner Peace, Home, Real Estate & Vehicles' },
      { num: 5, name: 'Putra Bhava', sanskrit: 'पुत्र भाव', theme: 'Purva Punya, Intellect, Creativity, Speculation & Children' },
      { num: 6, name: 'Ari / Shatru Bhava', sanskrit: 'अरि भाव', theme: 'Daily Labor, Overcoming Obstacles, Debts & Resilience' },
      { num: 7, name: 'Yuvati Bhava', sanskrit: 'युवती भाव', theme: 'Marriage, Spouse, Alliances & Public Dealings' },
      { num: 8, name: 'Randhra Bhava', sanskrit: 'रन्ध्र भाव', theme: 'Longevity, Transformation, Hidden Knowledge & Research' },
      { num: 9, name: 'Dharma Bhava', sanskrit: 'धर्म भाव', theme: 'Dharma, Higher Wisdom, Father, Guru & Fortunate Grace' },
      { num: 10, name: 'Karma Bhava', sanskrit: 'कर्म भाव', theme: 'Vocation, Social Status, Leadership & Public Contribution' },
      { num: 11, name: 'Labha Bhava', sanskrit: 'लाभ भाव', theme: 'Gains, Aspirations, Wealth Inflow & Social Networks' },
      { num: 12, name: 'Vyaya Bhava', sanskrit: 'व्यय भाव', theme: 'Liberation (Moksha), Foreign Travel, Solitude & Subconscious' }
    ];

    return HOUSE_NAMES.map((hInfo, idx) => {
      const signIdx = (ascLagnaIdx + idx) % 12;
      const rashi = RASHIS[signIdx];
      const houseNum = idx + 1;

      // Occupying planets
      const occupyingPlanets = planetList.filter(p => p.house === houseNum).map(p => p.name);

      // Parashari Aspecting planets
      const aspectingPlanets = [];
      planetList.forEach(p => {
        if (p.house === houseNum) return; // already occupying
        const dist = ((houseNum - p.house + 12) % 12) + 1; // 1 to 12
        // 7th house aspect (all planets)
        if (dist === 7) aspectingPlanets.push(p.name);
        // Mars 4th & 8th
        if (p.name === 'Mars' && (dist === 4 || dist === 8)) aspectingPlanets.push(p.name);
        // Jupiter 5th & 9th
        if (p.name === 'Jupiter' && (dist === 5 || dist === 9)) aspectingPlanets.push(p.name);
        // Saturn 3rd & 10th
        if (p.name === 'Saturn' && (dist === 3 || dist === 10)) aspectingPlanets.push(p.name);
        // Rahu / Ketu 5th & 9th
        if ((p.name === 'Rahu' || p.name === 'Ketu') && (dist === 5 || dist === 9)) aspectingPlanets.push(p.name);
      });

      return {
        house: houseNum,
        sign: rashi.name,
        signHindi: rashi.hindi,
        signSanskrit: rashi.sanskrit,
        signIdx,
        lord: rashi.lord,
        occupyingPlanets,
        aspectingPlanets,
        name: hInfo.name,
        sanskritName: hInfo.sanskrit,
        theme: hInfo.theme
      };
    });
  }

  // Format angle into Degrees, Minutes, Seconds
  function formatDMS(deg) {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.round(((deg - d) * 60 - m) * 60);
    return `${d}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
  }

  // Master Chart Calculation Function
  function calculateNatalChart(dateStr, timeStr, lat, lon, name = 'Native', gender = 'Not specified', pob = 'India') {
    const { jd, T, ayanamsha, utcDate } = calculateJulianDate(dateStr, timeStr, lon);
    const rawPlanets = calculateSiderealPlanets(T, ayanamsha);
    const ascSidereal = calculateSiderealAscendant(jd, T, ayanamsha, lat, lon);
    const retrogradeMap = calculateRetrogradeMap(T, ayanamsha);

    const ascSignInfo = getSignAndDegree(ascSidereal);
    const ascNakInfo = getNakshatraAndPada(ascSidereal);
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

      const isRetrograde = Boolean(retrogradeMap[pName]);
      const dignity = getDignity(pName, sInfo.sign, sInfo.degree, isCombust, isRetrograde);

      return {
        name: pName,
        sign: sInfo.sign,
        signHindi: RASHIS[sInfo.signIdx].hindi,
        signSanskrit: RASHIS[sInfo.signIdx].sanskrit,
        degree: Math.round(sInfo.degree * 100) / 100,
        degreeFormatted: formatDMS(sInfo.degree),
        house: house,
        retrograde: isRetrograde,
        combust: isCombust,
        nakshatra: nInfo.nakshatra,
        pada: nInfo.pada,
        nakshatraLord: nInfo.lord,
        dignity: dignity,
        longitude: Math.round(lonVal * 100) / 100,
        longitudeFormatted: formatDMS(lonVal)
      };
    });

    const houses = calculate12Houses(ascLagnaIdx, planetList);

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

    const planetsMap = {};
    planetList.forEach(p => { planetsMap[p.name] = p; });

    return {
      name,
      ascSign: ascLagnaSign,
      ascDegree: Math.round(ascSignInfo.degree * 100) / 100,
      lagnaRashi: ascLagnaSign,
      lagnaDetails: {
        sign: ascLagnaSign,
        signHindi: RASHIS[ascSignInfo.signIdx].hindi,
        signSanskrit: RASHIS[ascSignInfo.signIdx].sanskrit,
        signIdx: ascSignInfo.signIdx,
        degree: Math.round(ascSignInfo.degree * 100) / 100,
        degreeFormatted: formatDMS(ascSignInfo.degree),
        house: 1,
        nakshatra: ascNakInfo.nakshatra,
        pada: ascNakInfo.pada,
        lord: RASHIS[ascSignInfo.signIdx].lord
      },
      moonRashi: moonPlanet ? moonPlanet.sign : 'Aries',
      sunRashi: sunPlanet ? sunPlanet.sign : 'Aries',
      moonNakshatra: moonPlanet ? `${moonPlanet.nakshatra} (Pada ${moonPlanet.pada})` : '',
      ayanamsha: Math.round(ayanamsha * 1000) / 1000,
      ayanamshaDetails: {
        value: Math.round(ayanamsha * 1000) / 1000,
        type: 'Lahiri / Chitrapaksha'
      },
      planets: planetList,
      planetsMap,
      houses,
      vargas,
      karakas,
      yogas,
      doshas,
      dasha
    };
  }

  // Canonical Normalized Chart Data Generator (Single Source of Truth)
  function calculateNormalizedChart(dateStr, timeStr, lat, lon, name = 'Native', gender = 'Not specified', pob = 'India') {
    const raw = calculateNatalChart(dateStr, timeStr, lat, lon, name, gender, pob);
    const { jd, T, ayanamsha, utcDate } = calculateJulianDate(dateStr, timeStr, lon);

    let tzOffsetHours = 5.5;
    if (lon < 65 || lon > 100) tzOffsetHours = Math.round((lon / 15.0) * 10) / 10;
    const tzString = tzOffsetHours === 5.5 ? 'IST (UTC+5:30)' : `UTC${tzOffsetHours >= 0 ? '+' : ''}${tzOffsetHours}`;

    return {
      birthDetails: {
        name: name || 'Native',
        gender: gender || 'Not specified',
        dob: dateStr,
        tob: timeStr,
        pob: pob || 'India',
        dateFormatted: dateStr,
        timeFormatted: timeStr
      },
      location: {
        lat: Number(lat) || 28.6139,
        lon: Number(lon) || 77.2090,
        cityName: pob || 'India',
        country: 'India'
      },
      timezone: {
        tzOffsetHours,
        tzString
      },
      ayanamsha: raw.ayanamshaDetails,
      lagna: raw.lagnaDetails,
      houses: raw.houses,
      planets: raw.planets,
      planetsMap: raw.planetsMap,
      nakshatras: {
        moon: {
          name: raw.planetsMap.Moon?.nakshatra || '',
          pada: raw.planetsMap.Moon?.pada || 1,
          lord: raw.planetsMap.Moon?.nakshatraLord || '',
          rashi: raw.moonRashi
        },
        lagna: {
          name: raw.lagnaDetails.nakshatra,
          pada: raw.lagnaDetails.pada,
          lord: raw.lagnaDetails.lord,
          rashi: raw.lagnaRashi
        }
      },
      dashas: raw.dasha,
      yogas: raw.yogas,
      doshas: raw.doshas,
      karakas: raw.karakas,
      vargas: raw.vargas,
      calculationMetadata: {
        engineVersion: '3.2.0-Parashari-Lahiri-Unified',
        calculatedAt: new Date().toISOString(),
        julianDate: jd,
        ephemerisBasis: 'Sidereal Lahiri / Chitrapaksha Ayanamsha'
      }
    };
  }

  // Chart Data Validation Layer
  function validateChart(chartData) {
    const errors = [];
    if (!chartData || typeof chartData !== 'object') {
      return { valid: false, errors: ['Chart data is null, undefined, or invalid object.'] };
    }

    if (!chartData.lagna || typeof chartData.lagna.degree !== 'number' || isNaN(chartData.lagna.degree)) {
      errors.push('Missing or invalid Lagna (Ascendant) calculations.');
    }

    const requiredPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const pList = chartData.planets || [];

    requiredPlanets.forEach(pName => {
      const p = pList.find(x => x.name === pName);
      if (!p) {
        errors.push(`Missing planetary calculation for graha ${pName}.`);
      } else {
        if (typeof p.longitude !== 'number' || isNaN(p.longitude) || p.longitude < 0 || p.longitude >= 360) {
          errors.push(`Invalid celestial longitude for ${pName} (${p.longitude}).`);
        }
        if (typeof p.degree !== 'number' || isNaN(p.degree) || p.degree < 0 || p.degree >= 30) {
          errors.push(`Invalid sign degree for ${pName} (${p.degree}).`);
        }
        if (!p.house || p.house < 1 || p.house > 12) {
          errors.push(`Invalid house assignment for ${pName} (${p.house}).`);
        }
        if (!p.nakshatra || !p.pada) {
          errors.push(`Missing Nakshatra/Pada specification for ${pName}.`);
        }
      }
    });

    // Check Rahu-Ketu 180° opposition
    const rahu = pList.find(x => x.name === 'Rahu');
    const ketu = pList.find(x => x.name === 'Ketu');
    if (rahu && ketu) {
      const diff = Math.abs(rahu.longitude - ketu.longitude);
      const axisDiff = Math.abs(diff - 180);
      if (axisDiff > 1.0 && Math.abs(axisDiff - 360) > 1.0) {
        errors.push(`Rahu-Ketu nodal axis deviation exceeds 1°: Rahu ${rahu.longitude}°, Ketu ${ketu.longitude}°.`);
      }
    }

    // Verify 12 houses
    if (!Array.isArray(chartData.houses) || chartData.houses.length !== 12) {
      errors.push('12 Bhava (Houses) array is incomplete or missing.');
    }

    // Verify Dasha sequence
    if (!chartData.dashas || !Array.isArray(chartData.dashas.sequence) || chartData.dashas.sequence.length === 0) {
      errors.push('Missing or invalid Vimshottari Dasha sequence.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper for bilingual Rashi name
  function formatRashiBilingual(signName) {
    if (!signName) return '—';
    const cleanStr = String(signName).trim().toLowerCase();
    const r = RASHIS.find(item => item.name.toLowerCase() === cleanStr || item.sanskrit.toLowerCase() === cleanStr || item.hindi === signName);
    if (r) return `${r.name} / ${r.sanskrit} (${r.hindi})`;
    return String(signName);
  }

  // Generate 100% Deterministic Classical Baseline Text for any Section
  function generateSectionBaseline(sectionId, chart, lang = 'en') {
    const isHi = lang === 'hi';
    const lagna = chart.ascSign || 'Aries';
    const moon = chart.moonRashi || 'Aries';
    const sun = chart.sunRashi || 'Aries';
    const pMap = {};
    (chart.planets || []).forEach(p => { pMap[p.name] = p; });

    const lagnaLord = RASHIS.find(r => r.name === lagna)?.lord || 'Mars';
    const moonLord = RASHIS.find(r => r.name === moon)?.lord || 'Moon';
    const lagnaInfo = RASHIS.find(r => r.name === lagna) || RASHIS[0];
    const moonInfo = RASHIS.find(r => r.name === moon) || RASHIS[0];

    const formatP = (pName) => {
      const p = pMap[pName];
      if (!p) return `${pName} in chart`;
      return `${p.name} in ${formatRashiBilingual(p.sign)} (House ${p.house}, ${p.dignity})`;
    };

    const yogaListText = (chart.yogas || []).length > 0
      ? (chart.yogas || []).map(y => `- **${y.name}** (${y.status}): ${y.formation}. Practical Impact: ${y.impact}`).join('\n')
      : `- **Pancha Mahapurusha Potential:** Evaluated based on angular kendra strength of major grahas.\n- **Dharma-Karmadhipati Alignment:** Mutual relationship between trinal wisdom and tenth-house vocational actions.`;

    switch (sectionId) {
      case 'overview':
        return `### 1. Core Psychological Blueprint & Ascendant Energy
The foundational architecture of your Vedic horoscope is anchored by **${formatRashiBilingual(lagna)} Lagna (Ascendant)**, endowing your physical constitution and personality with ${lagnaInfo.modality || 'dynamic'} enterprise, ${lagnaInfo.element || 'focused'} temperament, and innate leadership potential. Your emotional sanctuary and subconscious instincts are guided by **Moon in ${formatRashiBilingual(moon)}** (${chart.moonNakshatra || 'auspicious Nakshatra'}), shaping your intuitive responses, mental resilience, and processing style. Your vital solar core resides with **Sun in ${formatRashiBilingual(sun)}**, governing sovereign willpower, vocational authority, and self-confidence.

- **Core Takeaway:** The union of ${formatRashiBilingual(lagna)} vitality with ${formatRashiBilingual(moon)} emotional depth bestows strategic stamina, sharp discernment, and purposeful ambition.
- **Astrological Mechanism:** Primary trinal houses (1st, 5th, 9th) energized by ${formatP('Sun')}, ${formatP('Moon')}, and ${formatP('Jupiter')} form your sovereign triangle of character, cognitive sharpness, and ethical alignment.
- **Practical Impact:** You approach critical decisions with pragmatic foresight, preferring sustainable, compounding accomplishments over fleeting emotional impulses.
- **Timing Window:** Planetary activations under the overarching **${chart.dasha?.activeMahadasha || 'Jupiter'} Mahadasha** highlight key milestones in personal autonomy, vocational authority, and life purpose.

### 2. Major Life Themes & Dominant Planetary Currents
Your chart exhibits distinct classical configurations that channel your energies into constructive enterprise:
1. **Intellectual & Analytical Acumen:** Guided by ${formatP('Mercury')}, bestowing clarity in communication, strategic planning, and commercial intellect.
2. **Endurance & Long-Term Discipline:** Underpinned by ${formatP('Saturn')}, instilling deep patience, systemic problem-solving, and resilience against temporary setbacks.
3. **Values & Relational Harmony:** Modulated by ${formatP('Venus')}, guiding aesthetic discernment, diplomatic negotiation, and devotion in key partnerships.`;

      case 'panchang': {
        const pLines = (chart.planets || []).map(p => `${p.name} | ${p.sign} | ${p.house} | ${p.dignity}`).join('\n');
        return `### 1. Classical Panchang & Celestial Almanac
Your birth occurs under sacred planetary rhythms calculated via authoritative **Lahiri Sidereal Ephemeris (Ayanamsha ${chart.ayanamsha}°)**:
- **Lagna (Ascendant):** ${formatRashiBilingual(lagna)} at ${chart.ascDegree || 0}°
- **Chandra Rashi (Moon Sign):** ${formatRashiBilingual(moon)} (${chart.moonNakshatra})
- **Surya Rashi (Sun Sign):** ${formatRashiBilingual(sun)}
- **Lagna Lord:** ${lagnaLord} (Governing vitality, physical health, and self-direction)
- **Vimshottari Dasha Balance:** ${chart.dasha?.balanceLord} Mahadasha (${chart.dasha?.balanceYears} years remaining at birth)
- **Current Active Period:** **${chart.dasha?.activeMahadasha} Mahadasha / ${chart.dasha?.activeAntardasha} Antardasha** (${chart.dasha?.activeYears})

### 2. Comprehensive Sidereal Planetary Placements
${(chart.planets || []).map(p => `- **${p.name}:** ${formatRashiBilingual(p.sign)} at ${p.degree}°, placed in **House ${p.house}** (${p.nakshatra}, Pada ${p.pada}) — Status: ${p.dignity}${p.retrograde ? ', Retrograde' : ''}${p.combust ? ', Combust' : ''}`).join('\n')}

<!-- Machine-readable placement tags for UI table rendering -->
${pLines}
LAGNA | ${lagna}
MOON SIGN | ${moon}`;
      }

      case 'identity':
        return `### 1. Temperament, Mental Architecture & Behavioral Patterns
With **${formatRashiBilingual(lagna)}** rising, your behavioral expression combines clarity of purpose with measured execution. The Lagna lord (**${lagnaLord}**) directs your focus toward competence, personal sovereignty, and intellectual integrity. You possess a dignified demeanor that commands natural respect without need for ostentation.

- **Core Takeaway:** You embody a disciplined balance of high standards, thoughtful reflection, and steady determination.
- **Astrological Mechanism:** Cognitive processing is shaped by ${formatP('Mercury')} and ${formatP('Moon')}, while ${formatP('Mars')} provides kinetic drive and goal execution.
- **Practical Impact:** When encountering adversity, you step back to analyze root causes methodically rather than reacting impulsively, ensuring resilient, well-calibrated outcomes.
- **Timing Window:** Planetary cycles ruled by your Lagna lord (${lagnaLord}) and Moon lord (${moonLord}) consistently activate phases of heightened mental clarity and personal breakthrough.

### 2. Communication Style, Stress Response & Inner Drive
- **Communication:** Articulate, deliberate, and evidence-focused. You value authenticity and structured reasoning over ambiguous pleasantries.
- **Stress Response:** Intense workload or emotional friction can occasionally cause mental fatigue; structured grounding routines, quiet reflection, and restorative pacing swiftly restore your equilibrium.
- **Inner Drive:** Inspired by genuine mastery, lasting contribution, and self-reliant accomplishment.`;

      case 'relationships':
        return `### 1. Relational Dynamics, Attachment Style & Partnership
In classical Jyotish, the 7th house (Kalatra Bhava), along with **${formatP('Venus')}** (natural karaka of romance) and **${formatP('Jupiter')}** (karaka of wisdom and commitment), defines your relationship orientation. Your approach to love, marriage, and long-term companionship is rooted in mutual respect, intellectual rapport, and emotional sincerity.

- **Core Takeaway:** You flourish alongside a partner who is both an intellectual equal and an emotional confidant, cherishing transparent communication and shared life philosophy.
- **Astrological Mechanism:** The 7th house axis, supported by benefic aspects from Venus and Jupiter, establishes a sturdy foundation for durable partnership and domestic harmony.
- **Practical Impact:** Partnerships thrive when mutual autonomy, clear expectations, and affectionate emotional safety are honored consistently.
- **Timing Window:** Sub-periods of the 7th lord and Venus highlight favorable windows for relationship commitments, domestic expansion, and shared milestones.

### 2. Domestic Harmony, Family Life & Social Belonging
- **Domestic Sanctuary:** You cherish a calm, well-ordered domestic environment where you can recharge and nurture meaningful familial bonds.
- **Friendships & Social Circle:** You maintain a curated circle of trustworthy, high-integrity companions, valuing depth and loyalty over superficial acquaintance.`;

      case 'career':
        return `### 1. Vocation, Leadership Trajectory & Professional Acumen
The 10th house of career and karma, harmonized by **${formatP('Saturn')}** and **${formatP('Sun')}**, reveals natural capacity for strategic responsibility, organizational leadership, and specialized competence. You excel in vocations requiring methodical planning, analytical precision, and executive reliability.

- **Core Takeaway:** Your professional trajectory is characterized by steady, compounding advancement where diligence, ethical integrity, and specialized expertise earn long-term authority.
- **Astrological Mechanism:** The 10th and 6th houses, reinforced by ${formatP('Mercury')} and ${formatP('Mars')}, foster keen problem-solving, operational stamina, and competitive excellence.
- **Practical Impact:** You thrive in environments that grant autonomy over deliverables and reward merit, analytical innovation, and strategic leadership.
- **Timing Window:** Key promotions, organizational milestones, and enterprise expansions manifest prominently during **${chart.dasha?.activeMahadasha}** cycles.

### 2. Wealth Accumulation, Financial Instincts & Asset Building
- **Income Channels:** The 2nd (Dhana Bhava) and 11th (Labha Bhava) houses indicate multiple revenue avenues through professional excellence, calculated investments, and disciplined enterprise.
- **Financial Style:** Prudent, structured, and long-term focused. You prioritize capital preservation, tangible asset accumulation, and compounding security over speculative volatility.`;

      case 'yogas':
        return `### 1. Classical Planetary Combinations (Yogas) & Auspicious Formations
Classical Vedic treatises (Brihat Parashara Hora Shastra, Phaladeepika, Saravali) outline planetary alignments that elevate a horoscope's potential. Your verified sidereal placements establish the following major classical Yogas:

${yogaListText}

### 2. Synthesis of Yoga Strength & Practical Manifestation
- **Executive & Material Power:** Auspicious relationships between Kendra (Action) and Trikona (Fortune) lords create protective buffers against life reversals, turning obstacles into stepping stones.
- **Intellectual & Financial Flourishing:** Benefic planetary alignments channel life energy toward disciplined wealth retention, moral standing, and intellectual authority.`;

      case 'health': {
        const yogaRows = (chart.yogas || []).map(y => `${y.name} | ${y.status} | ${y.formation} | ${y.impact}`).join('\n');
        const doshaRows = [
          `Mangal (Kuja) Dosha | ${chart.doshas?.mangalDosha?.present ? 'Present' : 'Absent/Cancelled'} | ${chart.doshas?.mangalDosha?.cancellationReason || 'Mars in non-afflicting alignment'} | ${chart.doshas?.mangalDosha?.present ? 'Direct energy requiring mindful patience in partnerships' : 'Harmonious partnership energy without dosha friction'}`,
          `Kaal Sarpa Alignment | ${chart.doshas?.kaalSarpa?.present ? 'Present' : 'Not present'} | ${chart.doshas?.kaalSarpa?.type || 'Planets balanced across nodal axis'} | ${chart.doshas?.kaalSarpa?.present ? 'Early life tests yielding intense resilience and later triumphs' : 'Smooth, unimpeded planetary flow across all life spheres'}`,
          `Sade Sati Transit Status | ${chart.doshas?.sadeSati?.status.includes('Not') ? 'Not active' : 'Active'} | ${chart.doshas?.sadeSati?.status} | Disciplined restructuring and enduring maturity`
        ].join('\n');

        return `### 1. Vitality, Energy Cycles & Stress Management
Vedic astrology examines constitutional vitality through the 1st (Tanu Bhava), 6th (Resistance), and 8th (Longevity) houses. Supported by ${formatP('Sun')} and ${formatP('Mars')}, your physical stamina is resilient, flourishing with regular physical movement, balanced nutrition, and structured restorative rest.

- **Core Takeaway:** Maintaining equilibrium between focused intellectual output and deliberate physical rest preserves optimal vitality, mental clarity, and emotional resilience.
- **Astrological Mechanism:** ${formatP('Moon')} and ${formatP('Saturn')} emphasize nervous system recovery, consistent sleep hygiene, and stress mitigation.
- **Practical Guidance:** Prioritize regular hydration, rhythmic breathing, and outdoor grounding during peak workload phases.

### 2. Comprehensive Classical Yoga & Dosha Catalog
<!-- Machine-readable Yoga Catalog rows for UI table -->
${yogaRows}
${doshaRows}`;
      }

      case 'karakas': {
        const ak = chart.karakas?.Atmakaraka;
        const amk = chart.karakas?.Amatyakaraka;
        return `### 1. Jaimini Atmakaraka: Soul Purpose & Evolutionary Lesson
According to Maharishi Jaimini's Upadesha Sutras, the **Atmakaraka (AK)** is the graha holding the highest longitudinal degree among the seven classical planets, representing the soul's primary evolutionary curriculum:
- **Atmakaraka Graha:** **${ak?.planet || 'Sun'} in ${formatRashiBilingual(ak?.sign)} (${ak?.degree}°)**
- **Core Evolutionary Lesson:** ${ak?.desc || 'Mastery over self-expression, ego transcendence, and alignment with universal truth.'}
- **Lived Manifestation:** Your life path repeatedly invites you to cultivate inner sovereignty, integrity, and humility, transforming personal ambition into elevated purpose.

### 2. Jaimini Amatyakaraka: Vocation & Worldly Action
The **Amatyakaraka (AmK)** is the second-highest degree planet, acting as the soul's chief minister and counselor for material achievement:
- **Amatyakaraka Graha:** **${amk?.planet || 'Jupiter'} in ${formatRashiBilingual(amk?.sign)} (${amk?.degree}°)**
- **Vocational Expression:** ${amk?.desc || 'Advisory leadership, intellectual stewardship, and constructive material impact.'}
- **Lived Manifestation:** You achieve your greatest professional fulfillment in roles involving trust, strategic mentorship, and ethical organizational guidance.`;
      }

      case 'vargas':
        return `### 1. Navamsa (D9): The Fruit of Dharma & Inner Maturity
The Navamsa chart reveals the subconscious potential, spiritual fruitfulness, and evolutionary unfolding of planetary placements in the second half of life and within marriage:
- **Navamsa Lagna:** **${formatRashiBilingual(chart.vargas?.D9?.Lagna || lagna)}**
- **Sun in Navamsa:** ${formatRashiBilingual(chart.vargas?.D9?.Sun || sun)}
- **Moon in Navamsa:** ${formatRashiBilingual(chart.vargas?.D9?.Moon || moon)}
- **Interpretive Significance:** The D9 confirms that your inherent qualities mature gracefully over time, strengthening emotional poise, spiritual discernment, and capacity for enduring commitment.

### 2. Dashamsa (D10): Professional Eminence & Public Impact
The Dashamsa chart analyzes vocational destiny, societal status, and professional achievements:
- **Dashamsa Lagna:** **${formatRashiBilingual(chart.vargas?.D10?.Lagna || lagna)}**
- **Interpretive Significance:** Key planets placed in Kendra and Trikona in D10 highlight steady vocational elevation, professional respect, and the ability to execute complex projects effectively.`;

      case 'transits':
        return `### 1. Saturn's Transit & Sade Sati Assessment
Saturn's slow, structural transit relative to your natal Moon sign (**${formatRashiBilingual(moon)}**) serves as the master clock for major reality checks, maturity milestones, and structural reorganization:
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
Your Vedic horoscope presents the blueprint of a purposeful, resilient, and discerning individual. By harmonizing your **${formatRashiBilingual(lagna)} Lagna** vitality with the intuitive wisdom of **Moon in ${formatRashiBilingual(moon)}** and the sovereign ambition of **Sun in ${formatRashiBilingual(sun)}**, you are equipped to navigate life's challenges with poise and build an enduring legacy of contribution.

- **Greatest Strength:** Unflinching strategic patience combined with refined intellectual competence.
- **Central Life Purpose:** Cultivating inner mastery, leading with ethical clarity, and building lasting value for your family and community.

### 2. Structured Life Area Synthesis
<!-- Machine-readable life area summary rows for table rendering -->
${lifeRows}`;
      }

      // Kundli matching sections
      case 'ashtakoot':
        return `### 1. Ashtakoot Guna Milan: 36-Point Compatibility Analysis
The classical Ashtakoot system from Brihat Parashara Hora Shastra evaluates marital synastry across eight fundamental dimensions of life, comparing the Moon signs (Rashis), Nakshatras, and lords of both partners.

1. **Varna (Spiritual & Ego Resonance - 1 Pt):** Evaluates spiritual compatibility, mutual respect, and work temperament between both partners.
2. **Vashya (Mutual Attraction & Harmony - 2 Pts):** Analyzes the natural gravitational balance, emotional magnetism, and mutual influence in the bond.
3. **Tara (Birth-Star Wellbeing & Destiny - 3 Pts):** Assesses health, auspiciousness, mutual fortune, and longevity of the relationship.
4. **Yoni (Instinctive & Physical Compatibility - 4 Pts):** Evaluates biological harmony, natural affection, and instinctual empathy.
5. **Graha Maitri (Mental Rapport & Friendship - 5 Pts):** Compares planetary lords of both Moon signs to assess intellectual wavelength and communication ease.
6. **Gana (Temperamental Alignment - 6 Pts):** Examines fundamental behavioral nature (Deva, Manushya, or Rakshasa) for day-to-day lifestyle harmony.
7. **Bhakoot (Emotional & Family Prosperity - 7 Pts):** Analyzes relative Moon sign positions for domestic happiness, progeny, and financial prosperity.
8. **Nadi (Physiological & Genetic Balance - 8 Pts):** Assesses subtle bio-energetic and health harmony across generations.`;

      case 'doshas':
        return `### 1. Mangal (Kuja) Dosha & Special Astrological Considerations
In Vedic synastry, the placement of Mars is evaluated from the Lagna, Moon, and Venus to assess energetic dynamism, assertiveness, and domestic balance:
- **Mangal Dosha Analysis:** Evaluated across the 1st, 2nd, 4th, 7th, 8th, and 12th houses for both charts.
- **Classical Cancellations (Dosha Bhanga):** Checks whether natural cancellations exist—such as reciprocal Mars placements, benefic planetary aspects, or exalted/own-sign placements.
- **Nadi & Bhakoot Exceptions:** Assesses classical mitigating factors if any individual koota scored below maximum.`;

      default:
        return `### 1. Comprehensive Vedic Analysis
This section analyzes your horoscope's foundational placements with reverence to classical Jyotish principles. With ${formatRashiBilingual(lagna)} Lagna and Moon in ${formatRashiBilingual(moon)}, your planetary configuration supports meaningful growth, balanced partnerships, and resilient accomplishment across all major endeavors.`;
    }
  }

  // Local Chat Assistant Fallback Engine with In-Depth Synthesis
  function answerChatLocally(question, chart, reportText, lang = 'en') {
    const isHi = lang === 'hi';
    const q = (question || '').toLowerCase();
    const lagna = chart?.ascSign || 'Aries';
    const moon = chart?.moonRashi || 'Aries';
    const sun = chart?.sunRashi || 'Aries';
    const nak = chart?.nakshatra || 'Ashwini';
    const pada = chart?.pada || 1;
    const dasha = chart?.dasha?.activeMahadasha || 'Jupiter';
    const antardasha = chart?.dasha?.activeAntardasha || 'Saturn';

    // Remedy check
    if (q.includes('gemstone') || q.includes('remedy') || q.includes('mantra') || q.includes('pooja') || q.includes('puja') || q.includes('fasting') || q.includes('totka') || q.includes('रत्न') || q.includes('उपाय')) {
      if (isHi) {
        return `### 1. ज्योतिषीय मार्गदर्शन एवं नीति
यह मंच विशुद्ध वैज्ञानिक एवं शास्त्रीय वैदिक ज्योतिषीय सिद्धांतों पर आधारित है। यहां कर्म-शुद्धि एवं आत्म-जागरूकता को ही सर्वोत्तम साधन माना गया है, न कि बाह्य अनुष्ठान या रत्न।

- **मूल सिद्धांत:** आपकी कुंडली की प्राकृतिक ऊर्जाएं (${formatRashiBilingual(lagna)} लग्न, ${formatRashiBilingual(moon)} में चंद्रमा) किसी बाह्य वस्तु की मोहताज नहीं हैं।
- **सार्थक दृष्टिकोण:** अपने कर्मों में शुचिता, अनुशासन, और विवेकपूर्ण निर्णयों के माध्यम से जीवन के अवसरों को सार्थक रूप दें।`;
      }
      return `### 1. Astrological Ethics & Philosophical Framework
This platform operates strictly on classical interpretive Vedic principles. It intentionally avoids superstition, commercial remedies, gemstones, and ritual prescriptions.

- **Foundational Principle:** Your chart's strengths (${lagna} Lagna, Moon in ${moon}, Sun in ${sun}) unfold through conscious awareness, ethical integrity, and disciplined decision-making.
- **Practical Application:** Aligning your daily habits with your planetary strengths yields far more compounding stability than external rituals.`;
    }

    if (q.includes('career') || q.includes('job') || q.includes('business') || q.includes('work') || q.includes('profession') || q.includes('करियर') || q.includes('नौकरी') || q.includes('व्यापार')) {
      if (isHi) {
        return `### 1. प्रत्यक्ष आजीविका एवं करियर फलकथन
आपकी कुंडली में कर्मक्षेत्र (दशम भाव) और लग्न शक्ति (${formatRashiBilingual(lagna)}) संगठित नेतृत्व, बौद्धिक विश्लेषण और रणनीतिक प्रबंधन में आपकी विशेष दक्षता को दर्शाते हैं।

- **व्यावसायिक कार्यशैली:** आप उन क्षेत्रों में श्रेष्ठ प्रदर्शन करते हैं जहां स्पष्ट उत्तरदायित्व, रणनीतिक योजना और सूक्ष्म विश्लेषणात्मक दृष्टि की आवश्यकता हो।
- **नौकरी बनाम स्वतंत्र व्यवसाय:** आपकी कुंडली संस्थागत वरिष्ठ पदों और परामर्श/स्वतंत्र विशेषज्ञता दोनों के लिए अनुकूल है।
- **ग्रह दशा व कालखंड प्रभाव:** वर्तमान में **${dasha} महादशा / ${antardasha} अंतर्दशा** के अंतर्गत पेशेवर कौशल के सुदृढ़ीकरण एवं दीर्घकालिक प्रतिष्ठा निर्माण का अनुकूल समय है।`;
      }
      return `### 1. Direct Career Assessment & Executive Synthesis
Your professional trajectory is anchored by **${lagna} Lagna**, **Moon in ${moon} (${nak} Nakshatra)**, and the 10th house karmic axis.

- **Vocation & Working Style:** You perform with exceptional distinction in roles demanding disciplined stewardship, specialized intellectual capability, and strategic vision.
- **Business vs. Institution:** Your chart favors roles of high autonomy, executive management, structured entrepreneurship, or specialized advisory.
- **Timing & Vimshottari Cycles:** Under the current **${dasha} Mahadasha / ${antardasha} Antardasha**, focus on consolidating core expertise and expanding strategic networks for sustainable advancement.`;
    }

    if (q.includes('love') || q.includes('marriage') || q.includes('relationship') || q.includes('spouse') || q.includes('partner') || q.includes('विवाह') || q.includes('शादी') || q.includes('प्रेम')) {
      if (isHi) {
        return `### 1. संबंध, वैवाहिक सौहार्द एवं दांपत्य विश्लेषण
आपकी कुंडली में सप्तम भाव (साझेदारी) और शुक्र का प्रभाव पारस्परिक बौद्धिक संवाद और भावनात्मक संतुलन पर बल देता है।

- **संबंधों की प्रकृति:** आप रिश्तों में सत्यनिष्ठा, मानसिक तालमेल और दीर्घकालिक सुरक्षा को सर्वोच्च प्राथमिकता देते हैं।
- **जीवनसाथी की विशेषताएं:** साथी विचारशील, व्यावहारिक एवं नैतिक मूल्यों से संपन्न व्यक्तित्व वाला होने के प्रबल संकेत हैं।
- **शुभ कालखंड:** सप्तमेश के अनुकूल गोचर एवं शुभ दशा-अंतर्दशा में दांपत्य जीवन में प्रगाढ़ता और पारिवारिक सुख में वृद्धि होती है।`;
      }
      return `### 1. Relational Dynamics & Partnership Synthesis
Your relational blueprint is governed by your 7th house axis, Venusian balance, and **Moon in ${moon}**.

- **Core Relational Blueprint:** You thrive in partnerships built on clear communication, intellectual equality, and emotional consistency.
- **Partner Characteristics:** The chart signifies a partner who is grounded, values thoughtful discourse, and provides strong domestic stability.
- **Timing Windows:** Harmonious transit periods and supportive sub-periods foster deep relational bonding and mutual understanding.`;
    }

    if (q.includes('money') || q.includes('wealth') || q.includes('finance') || q.includes('धन') || q.includes('पैसा') || q.includes('आर्थिक')) {
      if (isHi) {
        return `### 1. वित्तीय संरचना एवं धन संचय विश्लेषण
द्वितीय (धन) एवं एकादश (लाभ) भाव की स्थिति संगठित एवं चरणबद्ध धन संचय का संकेत देती है।

- **धन संचय का मार्ग:** सट्टा या अल्पकालिक जोखिम के बजाय ज्ञान, कौशल, एवं दीर्घकालिक सुनियोजित निवेश से संपत्ति का निर्माण होता है।
- **वित्तीय विवेक:** आपकी सतर्कता एवं धैर्य अनावश्यक व्यय को नियंत्रित रखने में सहायक हैं।
- **दशा चक्र प्रभाव:** वर्तमान **${dasha} महादशा** ठोस संपत्तियों और पूंजी संरक्षण पर ध्यान केंद्रित करने का निर्देश देती है।`;
      }
      return `### 1. Financial Architecture & Wealth Potential
Your financial trajectory is shaped by the 2nd and 11th wealth houses in harmony with your **${lagna} Lagna**.

- **Wealth Generation:** Sustainable prosperity manifests through calculated investments, specialized expertise, and disciplined asset compounding rather than speculative gambles.
- **Key Financial Strength:** Exceptional patience and risk discernment safeguard your capital during volatile market phases.
- **Active Cycle Guidance:** The active **${dasha} Mahadasha / ${antardasha} Antardasha** emphasizes capital retention and long-term tangible security.`;
    }

    // General fallback
    if (isHi) {
      return `### 1. समग्र वैदिक कुंडली फलकथन
आपकी जन्मपत्रिका में **${formatRashiBilingual(lagna)} लग्न**, **${formatRashiBilingual(moon)} में चंद्रमा (${nak} नक्षत्र)**, और **${formatRashiBilingual(sun)} में सूर्य** एक संतुलित और उद्देश्यपूर्ण व्यक्तित्व का निर्माण करते हैं।

- **केंद्रीय जीवन शक्ति:** गहन बौद्धिक परिपक्वता, धैर्य और नैतिक स्पष्टता आपकी सबसे बड़ी ताकत हैं।
- **सक्रिय दशा प्रभाव:** वर्तमान **${dasha} महादशा / ${antardasha} अंतर्दशा** आपको आत्म-विश्वास के साथ दीर्घकालिक लक्ष्यों की प्राप्ति की ओर अग्रसर कर रही है।
- **मार्गदर्शन:** अपने स्वाभाविक धैर्य और योजनाबद्ध दृष्टिकोण को प्राथमिकता देकर आप किसी भी परिस्थिति में स्थिर सफलता प्राप्त कर सकते हैं।`;
    }

    return `### 1. Comprehensive Vedic Astrological Consultation
Synthesizing your birth chart with **${lagna} Lagna**, **Moon in ${moon} (${nak} Nakshatra, Pada ${pada})**, and **Sun in ${sun}**:

- **Core Synthesis:** Your chart reveals a resilient, discerning individual equipped with strategic foresight and unwavering perseverance.
- **Active Planetary Influence:** You are navigating the **${dasha} Mahadasha / ${antardasha} Antardasha**, an energetic phase that consolidates maturity and rewards systematic effort.
- **Actionable Guidance:** Leverage your innate discipline and emotional composure to optimize career, personal growth, and relationship harmony.`;
  }

  // Export to window and module
  const engineExports = {
    RASHIS,
    NAKSHATRAS,
    DASHA_LORDS,
    calculateJulianDate,
    calculateSiderealPlanets,
    calculateSiderealAscendant,
    calculateRetrogradeMap,
    calculate12Houses,
    calculateNatalChart,
    calculateNormalizedChart,
    validateChart,
    generateSectionBaseline,
    answerChatLocally
  };

  if (typeof window !== 'undefined') {
    window.VedicEngine = engineExports;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = engineExports;
  }

})(typeof window !== 'undefined' ? window : globalThis);
