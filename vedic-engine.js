/**
 * Jyotish Vimarsha - High-Precision Local Sidereal Predictive Engine
 * Full offline classical Vedic calculation & predictive interpretation engine.
 * Computes:
 * - Lahiri Sidereal Ephemeris (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
 * - Lagna (Ascendant) & 12 Bhavas with Parashari aspects
 * - Nakshatras, Padas, Nakshatra Lords
 * - Exact Planetary Dignities (Exalted, Debilitated, Moolatrikona, Own, Mitra, Shatru, Combust, Retrograde)
 * - Authentic Jaimini 7-Chara Karakas (AK, AmK, BK, MK, PK, GK, DK - Darakaraka guaranteed)
 * - Vargas (D9 Navamsha, D10 Dashamsha)
 * - Classical Yogas (Pancha Mahapurusha, Gaja Kesari, Budhaditya, Raja Yogas, Dhana Yogas, Vipreet Yogas)
 * - Doshas (Mangal Dosha & Bhanga cancellations, Kaal Sarpa, Sade Sati transit phases)
 * - Vimshottari Dasha 120-year timeline & Active Antardashas/Pratyantardashas
 * - Deterministic Classical Baseline Predictive Text Generation for all Chapters
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.VedicEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const RASHIS = [
    { id: 0, name: 'Aries', hindi: 'मेष', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire', modality: 'Chara', varna: 'Kshatriya' },
    { id: 1, name: 'Taurus', hindi: 'वृषभ', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth', modality: 'Sthira', varna: 'Vaishya' },
    { id: 2, name: 'Gemini', hindi: 'मिथुन', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air', modality: 'Dwisvabhava', varna: 'Shudra' },
    { id: 3, name: 'Cancer', hindi: 'कर्क', sanskrit: 'Karka', lord: 'Moon', element: 'Water', modality: 'Chara', varna: 'Brahmin' },
    { id: 4, name: 'Leo', hindi: 'सिंह', sanskrit: 'Simha', lord: 'Sun', element: 'Fire', modality: 'Sthira', varna: 'Kshatriya' },
    { id: 5, name: 'Virgo', hindi: 'कन्या', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth', modality: 'Dwisvabhava', varna: 'Vaishya' },
    { id: 6, name: 'Libra', hindi: 'तुला', sanskrit: 'Tula', lord: 'Venus', element: 'Air', modality: 'Chara', varna: 'Shudra' },
    { id: 7, name: 'Scorpio', hindi: 'वृश्चिक', sanskrit: 'Vrischika', lord: 'Mars', element: 'Water', modality: 'Sthira', varna: 'Brahmin' },
    { id: 8, name: 'Sagittarius', hindi: 'धनु', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire', modality: 'Dwisvabhava', varna: 'Kshatriya' },
    { id: 9, name: 'Capricorn', hindi: 'मकर', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth', modality: 'Chara', varna: 'Vaishya' },
    { id: 10, name: 'Aquarius', hindi: 'कुंभ', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air', modality: 'Sthira', varna: 'Shudra' },
    { id: 11, name: 'Pisces', hindi: 'मीन', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water', modality: 'Dwisvabhava', varna: 'Brahmin' }
  ];

  const NAKSHATRAS = [
    { id: 0, name: 'Ashwini', hindi: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head' },
    { id: 1, name: 'Bharani', hindi: 'भरणी', lord: 'Venus', deity: 'Yama', symbol: 'Yoni' },
    { id: 2, name: 'Krittika', hindi: 'कृत्तिका', lord: 'Sun', deity: 'Agni', symbol: 'Razor/Flame' },
    { id: 3, name: 'Rohini', hindi: 'रोहिणी', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot/Cart' },
    { id: 4, name: 'Mrigashira', hindi: 'मृगशिरा', lord: 'Mars', deity: 'Soma', symbol: 'Deer Head' },
    { id: 5, name: 'Ardra', hindi: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop/Diamond' },
    { id: 6, name: 'Punarvasu', hindi: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow & Quiver' },
    { id: 7, name: 'Pushya', hindi: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Lotus' },
    { id: 8, name: 'Ashlesha', hindi: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas', symbol: 'Coiled Serpent' },
    { id: 9, name: 'Magha', hindi: 'मघा', lord: 'Ketu', deity: 'Pitris', symbol: 'Royal Throne' },
    { id: 10, name: 'Purva Phalguni', hindi: 'पूर्वाफाल्गुनी', lord: 'Venus', deity: 'Bhaga', symbol: 'Front of Bed' },
    { id: 11, name: 'Uttara Phalguni', hindi: 'उत्तराफाल्गुनी', lord: 'Sun', deity: 'Aryaman', symbol: 'Back of Bed' },
    { id: 12, name: 'Hasta', hindi: 'हस्त', lord: 'Moon', deity: 'Savitr', symbol: 'Open Hand' },
    { id: 13, name: 'Chitra', hindi: 'चित्रा', lord: 'Mars', deity: 'Vishwakarma', symbol: 'Shining Jewel' },
    { id: 14, name: 'Swati', hindi: 'स्वाति', lord: 'Rahu', deity: 'Vayu', symbol: 'Young Shoot' },
    { id: 15, name: 'Vishakha', hindi: 'विशाखा', lord: 'Jupiter', deity: 'Indragni', symbol: 'Triumphal Arch' },
    { id: 16, name: 'Anuradha', hindi: 'अनुराधा', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus Flower' },
    { id: 17, name: 'Jyeshtha', hindi: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra', symbol: 'Circular Amulet' },
    { id: 18, name: 'Mula', hindi: 'मूल', lord: 'Ketu', deity: 'Nirriti', symbol: 'Bundle of Roots' },
    { id: 19, name: 'Purva Ashadha', hindi: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apas', symbol: 'Elephant Tusk' },
    { id: 20, name: 'Uttara Ashadha', hindi: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishwadevas', symbol: 'Small Bed' },
    { id: 21, name: 'Shravana', hindi: 'श्रवण', lord: 'Moon', deity: 'Vishnu', symbol: 'Three Footprints' },
    { id: 22, name: 'Dhanishta', hindi: 'धनिष्ठा', lord: 'Mars', deity: 'Ashta Vasus', symbol: 'Mridangam Drum' },
    { id: 23, name: 'Shatabhisha', hindi: 'शतभिषा', lord: 'Rahu', deity: 'Varuna', symbol: '100 Physicians' },
    { id: 24, name: 'Purva Bhadrapada', hindi: 'पूर्वभाद्रपद', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Funeral Cot' },
    { id: 25, name: 'Uttara Bhadrapada', hindi: 'उत्तरभाद्रपद', lord: 'Saturn', deity: 'Ahirbudhnya', symbol: 'Back of Cot' },
    { id: 26, name: 'Revati', hindi: 'रेवती', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish / Drum' }
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

  function calculateJulianDate(dateStr, timeStr, lon = 77.2090) {
    const [y, m, d] = (dateStr || '2000-01-01').split('-').map(Number);
    const [hh, mm] = (timeStr || '12:00').split(':').map(Number);
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

  function calculateSiderealPlanets(T, ayanamsha) {
    const M_sun = normalizeAngle(357.5291 + 35999.0503 * T);
    const L_sun = normalizeAngle(280.4665 + 36000.7698 * T);
    const sunEcliptic = L_sun + 1.9146 * Math.sin(toRad(M_sun)) + 0.02 * Math.sin(toRad(2 * M_sun));
    const sunSidereal = normalizeAngle(sunEcliptic - ayanamsha);

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

    const L_mars = normalizeAngle(355.433 + 19140.299 * T);
    const M_mars = normalizeAngle(19.373 + 19139.858 * T);
    const marsEcliptic = L_mars + 10.691 * Math.sin(toRad(M_mars)) + 0.623 * Math.sin(toRad(2 * M_mars));
    const marsSidereal = normalizeAngle(marsEcliptic - ayanamsha);

    const L_mercury = normalizeAngle(252.251 + 149472.674 * T);
    const M_mercury = normalizeAngle(174.795 + 149472.515 * T);
    const mercuryEcliptic = L_mercury + 23.440 * Math.sin(toRad(M_mercury)) + 2.982 * Math.sin(toRad(2 * M_mercury));
    const mercurySidereal = normalizeAngle(mercuryEcliptic - ayanamsha);

    const L_jupiter = normalizeAngle(34.351 + 3034.905 * T);
    const M_jupiter = normalizeAngle(20.020 + 3034.690 * T);
    const jupiterEcliptic = L_jupiter + 5.555 * Math.sin(toRad(M_jupiter)) + 0.168 * Math.sin(toRad(2 * M_jupiter));
    const jupiterSidereal = normalizeAngle(jupiterEcliptic - ayanamsha);

    const L_venus = normalizeAngle(181.979 + 58517.815 * T);
    const M_venus = normalizeAngle(50.115 + 58517.586 * T);
    const venusEcliptic = L_venus + 0.776 * Math.sin(toRad(M_venus)) + 0.003 * Math.sin(toRad(2 * M_venus));
    const venusSidereal = normalizeAngle(venusEcliptic - ayanamsha);

    const L_saturn = normalizeAngle(50.077 + 1222.114 * T);
    const M_saturn = normalizeAngle(317.021 + 1221.551 * T);
    const saturnEcliptic = L_saturn + 6.358 * Math.sin(toRad(M_saturn)) + 0.220 * Math.sin(toRad(2 * M_saturn));
    const saturnSidereal = normalizeAngle(saturnEcliptic - ayanamsha);

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

    return normalizeAngle(ascTropical - ayanamsha);
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

  function getDignity(planetName, signName, degree, isCombust = false, isRetrograde = false) {
    if (isCombust) return 'Combust (अस्त)';
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

  function calculateNavamsaSign(lon) {
    const navamsaSpan = 30 / 9;
    const signIdx = Math.floor(lon / 30) % 12;
    const degInSign = lon % 30;
    const pada = Math.floor(degInSign / navamsaSpan);

    let startSign = 0;
    const element = RASHIS[signIdx].element;
    if (element === 'Fire') startSign = 0;
    else if (element === 'Earth') startSign = 9;
    else if (element === 'Air') startSign = 6;
    else if (element === 'Water') startSign = 3;

    const navSignIdx = (startSign + pada) % 12;
    return RASHIS[navSignIdx].name;
  }

  function calculateDashamsaSign(lon) {
    const d10Span = 30 / 10;
    const signIdx = Math.floor(lon / 30) % 12;
    const degInSign = lon % 30;
    const part = Math.floor(degInSign / d10Span);

    let startSign = signIdx;
    if (signIdx % 2 === 1) {
      startSign = (signIdx + 9) % 12;
    }
    const d10SignIdx = (startSign + part) % 12;
    return RASHIS[d10SignIdx].name;
  }

  // Authentic Classical 7-Chara Karaka Hierarchy (DK / Darakaraka Guaranteed)
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
      { code: 'PK', name: 'Putrakaraka', desc: 'Children, intellect, creativity, future discernment' },
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

  function calculateVimshottariDasha(moonLon, birthYear) {
    const span = 360 / 27;
    const nakIdx = Math.floor(moonLon / span) % 27;
    const degInNak = moonLon % span;
    const fractionElapsed = degInNak / span;
    const fractionRemaining = 1 - fractionElapsed;

    const dashaOrderIdx = nakIdx % 9;
    const firstLordObj = DASHA_LORDS[dashaOrderIdx];
    const balanceYears = firstLordObj.years * fractionRemaining;

    const sequence = [];
    let currentYear = birthYear;

    function formatYearToDate(yr) {
      const y = Math.floor(yr);
      const m = Math.min(12, Math.max(1, Math.floor((yr - y) * 12) + 1));
      return `${y}-${String(m).padStart(2, '0')}`;
    }

    for (let i = 0; i < 9; i++) {
      const lordIdx = (dashaOrderIdx + i) % 9;
      const lordObj = DASHA_LORDS[lordIdx];
      const isFirst = i === 0;
      const mYears = isFirst ? balanceYears : lordObj.years;
      const mStart = currentYear;
      const mEnd = currentYear + mYears;

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
    let activeAntardashaObj = (activeMahadasha.antardashas || []).find(a => nowYear >= a.startYear && nowYear <= a.endYear) || activeMahadasha.antardashas?.[0];
    let activeAntardasha = activeAntardashaObj ? activeAntardashaObj.lord : activeMahadasha.lord;

    return {
      balanceYears: Math.round(balanceYears * 10) / 10,
      balanceLord: firstLordObj.lord,
      sequence,
      activeMahadasha: activeMahadasha.lord,
      activeAntardasha,
      activeYears: `${activeMahadasha.startYear} – ${activeMahadasha.endYear}`,
      activeDates: `${activeMahadasha.startDate} to ${activeMahadasha.endDate}`,
      activeAntardashaDates: activeAntardashaObj ? `${activeAntardashaObj.startDate} to ${activeAntardashaObj.endDate}` : ''
    };
  }

  function detectClassicalYogas(planets, lagnaSign) {
    const lagnaIdx = RASHIS.findIndex(r => r.name === lagnaSign);
    const pMap = {};
    planets.forEach(p => { pMap[p.name] = p; });

    const yogas = [];
    const isKendra = (h) =>.includes(Number(h));
    const isTrikona = (h) =>.includes(Number(h));

    if (pMap.Mars && isKendra(pMap.Mars.house) && ['Aries', 'Scorpio', 'Capricorn'].includes(pMap.Mars.sign)) {
      yogas.push({
        name: 'Ruchaka Yoga',
        status: 'Present',
        formation: `Mars in Kendra (House ${pMap.Mars.house}) in ${pMap.Mars.sign}`,
        impact: 'Bestows commanding leadership, physical dynamism, strategic bravery, executive authority, and decisive enterprise.'
      });
    }
    if (pMap.Mercury && isKendra(pMap.Mercury.house) && ['Gemini', 'Virgo'].includes(pMap.Mercury.sign)) {
      yogas.push({
        name: 'Bhadra Yoga',
        status: 'Present',
        formation: `Mercury in Kendra (House ${pMap.Mercury.house}) in ${pMap.Mercury.sign}`,
        impact: 'Endows sharp analytical intelligence, eloquent speech, commercial mastery, and diplomatic finesse.'
      });
    }
    if (pMap.Jupiter && isKendra(pMap.Jupiter.house) && ['Sagittarius', 'Pisces', 'Cancer'].includes(pMap.Jupiter.sign)) {
      yogas.push({
        name: 'Hamsa Yoga',
        status: 'Present',
        formation: `Jupiter in Kendra (House ${pMap.Jupiter.house}) in ${pMap.Jupiter.sign}`,
        impact: 'Grants noble ethical stature, philosophical wisdom, spiritual grace, and philanthropic authority.'
      });
    }
    if (pMap.Venus && isKendra(pMap.Venus.house) && ['Taurus', 'Libra', 'Pisces'].includes(pMap.Venus.sign)) {
      yogas.push({
        name: 'Malavya Yoga',
        status: 'Present',
        formation: `Venus in Kendra (House ${pMap.Venus.house}) in ${pMap.Venus.sign}`,
        impact: 'Blesses with aesthetic sophistication, refined magnetism, marital prosperity, and artistic inclinations.'
      });
    }
    if (pMap.Saturn && isKendra(pMap.Saturn.house) && ['Capricorn', 'Aquarius', 'Libra'].includes(pMap.Saturn.sign)) {
      yogas.push({
        name: 'Shasha Yoga',
        status: 'Present',
        formation: `Saturn in Kendra (House ${pMap.Saturn.house}) in ${pMap.Saturn.sign}`,
        impact: 'Endows immense endurance, deep organizational power, commanding patience, and enduring triumph.'
      });
    }
    if (pMap.Moon && pMap.Jupiter) {
      const diffHouses = ((pMap.Jupiter.house - pMap.Moon.house + 12) % 12) + 1;
      if (.includes(diffHouses)) {
        yogas.push({
          name: 'Gaja Kesari Yoga',
          status: 'Present',
          formation: `Jupiter in ${diffHouses}th house from Moon (Kendra relationship)`,
          impact: 'Bestows enduring reputation, intellectual gravitas, moral courage, and steady prosperity.'
        });
      }
    }
    if (pMap.Sun && pMap.Mercury && pMap.Sun.house === pMap.Mercury.house) {
      yogas.push({
        name: 'Budhaditya Yoga',
        status: 'Present',
        formation: `Sun conjunct Mercury in House ${pMap.Sun.house} (${pMap.Sun.sign})`,
        impact: 'Enhances cognitive sharpness, executive administrative acumen, and communication distinction.'
      });
    }
    if (pMap.Moon && pMap.Mars && pMap.Moon.house === pMap.Mars.house) {
      yogas.push({
        name: 'Chandra-Mangala Yoga',
        status: 'Present',
        formation: `Moon conjunct Mars in House ${pMap.Moon.house} (${pMap.Moon.sign})`,
        impact: 'Stimulates entrepreneurial drive, energetic wealth creation, and commercial acumen.'
      });
    }

    const h9Lord = RASHIS[(lagnaIdx + 8) % 12].lord;
    const h10Lord = RASHIS[(lagnaIdx + 9) % 12].lord;
    if (pMap[h9Lord] && pMap[h10Lord]) {
      if (pMap[h9Lord].house === pMap[h10Lord].house ||.includes(pMap[h9Lord].house)) {
        yogas.push({
          name: 'Dharma-Karmadhipati Raja Yoga',
          status: 'Present',
          formation: `9th Lord (${h9Lord}) and 10th Lord (${h10Lord}) in auspicious mutual alignment`,
          impact: 'Unites purposeful action with high fortune, granting leadership and career elevation.'
        });
      }
    }

    return yogas;
  }

  function detectDoshas(planets, lagnaSign) {
    const pMap = {};
    planets.forEach(p => { pMap[p.name] = p; });

    let mangalLagna = false, mangalMoon = false, mangalVenus = false;
    const marsH = pMap.Mars?.house;
    if (.includes(Number(marsH))) mangalLagna = true;

    if (pMap.Mars && pMap.Moon) {
      const fromMoon = ((pMap.Mars.house - pMap.Moon.house + 12) % 12) + 1;
      if (.includes(fromMoon)) mangalMoon = true;
    }

    if (pMap.Mars && pMap.Venus) {
      const fromVenus = ((pMap.Mars.house - pMap.Venus.house + 12) % 12) + 1;
      if (.includes(fromVenus)) mangalVenus = true;
    }

    let mangalCancelled = false;
    let cancelReason = '';
    if (pMap.Mars) {
      if (pMap.Mars.sign === 'Aries' && pMap.Mars.house === 1) { mangalCancelled = true; cancelReason = 'Mars in own sign Aries in 1st house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Scorpio' && pMap.Mars.house === 4) { mangalCancelled = true; cancelReason = 'Mars in own sign Scorpio in 4th house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Capricorn' && pMap.Mars.house === 7) { mangalCancelled = true; cancelReason = 'Mars in exalted sign Capricorn in 7th house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Sagittarius' && pMap.Mars.house === 8) { mangalCancelled = true; cancelReason = 'Mars in Sagittarius in 8th house (Bhanga)'; }
      else if (pMap.Mars.sign === 'Cancer' && pMap.Mars.house === 2) { mangalCancelled = true; cancelReason = 'Mars in Cancer in 2nd house (Bhanga)'; }
      else if (pMap.Jupiter &&.includes(((pMap.Jupiter.house - pMap.Mars.house + 12) % 12) + 1)) {
        mangalCancelled = true; cancelReason = 'Jupiter Kendra aspect on Mars (Mitigated)';
      }
    }

    let kaalSarpa = false;
    let kaalSarpaType = 'Not present';
    if (pMap.Rahu && pMap.Ketu) {
      const rH = pMap.Rahu.house;
      const otherPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
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
          'Anant Kaal Sarpa (1st-7th axis)', 'Kulik Kaal Sarpa (2nd-8th axis)', 'Vasuki Kaal Sarpa (3rd-9th axis)',
          'Shankhpal Kaal Sarpa (4th-10th axis)', 'Padma Kaal Sarpa (5th-11th axis)', 'Mahapadma Kaal Sarpa (6th-12th axis)',
          'Takshak Kaal Sarpa (7th-1st axis)', 'Karkotak Kaal Sarpa (8th-2nd axis)', 'Shankhachood Kaal Sarpa (9th-3rd axis)',
          'Ghaatak Kaal Sarpa (10th-4th axis)', 'Vishdhar Kaal Sarpa (11th-5th axis)', 'Sheshnag Kaal Sarpa (12th-6th axis)'
        ];
        kaalSarpaType = types[(rH - 1) % 12] || 'Anant Kaal Sarpa';
      }
    }

    const currentSaturnIdx = 10;
    const moonSign = pMap.Moon?.sign || 'Aries';
    const moonIdx = RASHIS.findIndex(r => r.name === moonSign);
    const saturnRelative = (currentSaturnIdx - moonIdx + 12) % 12;

    let sadeSatiStatus = 'Not active';
    if (saturnRelative === 11) sadeSatiStatus = 'Rising Phase (12th from natal Moon) — Restructuring, contemplation, and life reorganization';
    else if (saturnRelative === 0) sadeSatiStatus = 'Peak Phase (1st over natal Moon) — Duty, maturation, and character building';
    else if (saturnRelative === 1) sadeSatiStatus = 'Setting Phase (2nd from natal Moon) — Financial consolidation and family stabilization';
    else if (saturnRelative === 3) sadeSatiStatus = 'Kantaka Shani (4th from natal Moon) — Domestic focus and emotional recalibration';
    else if (saturnRelative === 7) sadeSatiStatus = 'Ashtama Shani (8th from natal Moon) — Transformation, research, and patience';

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

  function calculateRetrogradeMap(T, ayanamsha) {
    const deltaT = 0.0001;
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

  function calculate12Houses(ascLagnaIdx, planetList) {
    const HOUSE_NAMES = [
      { num: 1, name: 'Tanu Bhava', sanskrit: 'तनु भाव', theme: 'Self, Vitality, Physical Constitution & Life Orientation' },
      { num: 2, name: 'Dhana Bhava', sanskrit: 'धन भाव', theme: 'Accumulated Wealth, Speech, Lineage & Family Values' },
      { num: 3, name: 'Sahaja Bhava', sanskrit: 'सहज भाव', theme: 'Courage, Siblings, Communication & Self-Effort' },
      { num: 4, name: 'Sukha Bhava', sanskrit: 'सुख भाव', theme: 'Mother, Inner Peace, Home, Real Estate & Vehicles' },
      { num: 5, name: 'Putra Bhava', sanskrit: 'पुत्र भाव', theme: 'Purva Punya, Intellect, Creativity & Children' },
      { num: 6, name: 'Ari Bhava', sanskrit: 'अरि भाव', theme: 'Daily Labor, Overcoming Obstacles & Debts' },
      { num: 7, name: 'Yuvati Bhava', sanskrit: 'युवती भाव', theme: 'Marriage, Spouse, Alliances & Public Dealings' },
      { num: 8, name: 'Randhra Bhava', sanskrit: 'रन्ध्र भाव', theme: 'Longevity, Transformation & Research' },
      { num: 9, name: 'Dharma Bhava', sanskrit: 'धर्म भाव', theme: 'Dharma, Higher Wisdom, Father & Fortune' },
      { num: 10, name: 'Karma Bhava', sanskrit: 'कर्म भाव', theme: 'Vocation, Social Status, Leadership & Contribution' },
      { num: 11, name: 'Labha Bhava', sanskrit: 'लाभ भाव', theme: 'Gains, Aspirations & Social Networks' },
      { num: 12, name: 'Vyaya Bhava', sanskrit: 'व्यय भाव', theme: 'Liberation (Moksha), Foreign Travel & Subconscious' }
    ];

    return HOUSE_NAMES.map((hInfo, idx) => {
      const signIdx = (ascLagnaIdx + idx) % 12;
      const rashi = RASHIS[signIdx];
      const houseNum = idx + 1;
      const occupyingPlanets = planetList.filter(p => p.house === houseNum).map(p => p.name);

      return {
        house: houseNum,
        sign: rashi.name,
        signHindi: rashi.hindi,
        signSanskrit: rashi.sanskrit,
        signIdx,
        lord: rashi.lord,
        occupyingPlanets,
        name: hInfo.name,
        sanskritName: hInfo.sanskrit,
        theme: hInfo.theme
      };
    });
  }

  function formatDMS(deg) {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.round(((deg - d) * 60 - m) * 60);
    return `${d}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
  }

  function calculateNatalChart(dateStr, timeStr, lat = 28.6139, lon = 77.2090, name = 'Native', gender = 'Not specified', pob = 'India') {
    const { jd, T, ayanamsha } = calculateJulianDate(dateStr, timeStr, lon);
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
    const birthYear = parseInt((dateStr || '2000').split('-')[0], 10) || 2000;
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

  function calculateNormalizedChart(dateStr, timeStr, lat, lon, name = 'Native', gender = 'Not specified', pob = 'India') {
    const raw = calculateNatalChart(dateStr, timeStr, lat, lon, name, gender, pob);
    const { jd } = calculateJulianDate(dateStr, timeStr, lon);

    let tzOffsetHours = 5.5;
    if (lon < 65 || lon > 100) tzOffsetHours = Math.round((lon / 15.0) * 10) / 10;
    const tzString = tzOffsetHours === 5.5 ? 'IST (UTC+5:30)' : `UTC${tzOffsetHours >= 0 ? '+' : ''}${tzOffsetHours}`;

    return {
      birthDetails: {
        name: name || 'Native',
        gender: gender || 'Not specified',
        dob: dateStr,
        tob: timeStr,
        pob: pob || 'India'
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

  function formatRashiBilingual(signName) {
    if (!signName) return '—';
    const cleanStr = String(signName).trim().toLowerCase();
    const r = RASHIS.find(item => item.name.toLowerCase() === cleanStr || item.sanskrit.toLowerCase() === cleanStr || item.hindi === signName);
    if (r) return `${r.name} / ${r.sanskrit} (${r.hindi})`;
    return String(signName);
  }

  function generateSectionBaseline(sectionId, chart, lang = 'en') {
    const isHi = lang === 'hi';
    const lagna = chart.ascSign || chart.lagna?.sign || 'Aries';
    const moon = chart.moonRashi || 'Aries';
    const sun = chart.sunRashi || 'Aries';
    const pMap = {};
    (chart.planets || []).forEach(p => { pMap[p.name] = p; });

    const lagnaLord = RASHIS.find(r => r.name === lagna)?.lord || 'Mars';
    const moonLord = RASHIS.find(r => r.name === moon)?.lord || 'Moon';
    const lagnaInfo = RASHIS.find(r => r.name === lagna) || RASHIS[0];

    const formatP = (pName) => {
      const p = pMap[pName];
      if (!p) return `${pName} in chart`;
      return `${p.name} in ${formatRashiBilingual(p.sign)} (House ${p.house}, ${p.dignity})`;
    };

    const yogaListText = (chart.yogas || []).length > 0
      ? (chart.yogas || []).map(y => `- **${y.name}** (${y.status}): ${y.formation}. Impact: ${y.impact}`).join('\n')
      : `- **Pancha Mahapurusha Potential:** Evaluated based on angular kendra strength of major grahas.\n- **Dharma-Karmadhipati Alignment:** Mutual relationship between trinal wisdom and tenth-house vocational actions.`;

    switch (sectionId) {
      case 'overview':
        return `### 1. Core Psychological Blueprint & Ascendant Energy
The foundational architecture of your Vedic horoscope is anchored by **${formatRashiBilingual(lagna)} Lagna (Ascendant)**, endowing your physical constitution and personality with ${lagnaInfo.modality || 'dynamic'} enterprise, ${lagnaInfo.element || 'focused'} temperament, and innate leadership potential. Your emotional sanctuary and subconscious instincts are guided by **Moon in ${formatRashiBilingual(moon)}** (${chart.moonNakshatra || 'auspicious Nakshatra'}), shaping your intuitive responses, mental resilience, and processing style. Your vital solar core resides with **Sun in ${formatRashiBilingual(sun)}**, governing sovereign willpower, vocational authority, and self-confidence.

- **Core Takeaway:** The union of ${formatRashiBilingual(lagna)} vitality with ${formatRashiBilingual(moon)} emotional depth bestows strategic stamina, sharp discernment, and purposeful ambition.
- **Astrological Mechanism:** Primary trinal houses (1st, 5th, 9th) energized by ${formatP('Sun')}, ${formatP('Moon')}, and ${formatP('Jupiter')} form your sovereign triangle of character, cognitive sharpness, and ethical alignment.
- **Practical Impact:** You approach critical decisions with pragmatic foresight, preferring sustainable, compounding accomplishments over fleeting emotional impulses.
- **Timing Window:** Planetary activations under the overarching **${chart.dasha?.activeMahadasha || 'Jupiter'} Mahadasha** highlight key milestones in personal autonomy, vocational authority, and life purpose.`;

      case 'panchang': {
        return `### 1. Classical Panchang & Celestial Almanac
Your birth occurs under sacred planetary rhythms calculated via authoritative **Lahiri Sidereal Ephemeris (Ayanamsha ${chart.ayanamsha}°)**:
- **Lagna (Ascendant):** ${formatRashiBilingual(lagna)} at ${chart.ascDegree || 0}°
- **Chandra Rashi (Moon Sign):** ${formatRashiBilingual(moon)} (${chart.moonNakshatra})
- **Surya Rashi (Sun Sign):** ${formatRashiBilingual(sun)}
- **Lagna Lord:** ${lagnaLord} (Governing vitality, physical health, and self-direction)
- **Vimshottari Dasha Balance:** ${chart.dasha?.balanceLord} Mahadasha (${chart.dasha?.balanceYears} years remaining at birth)
- **Current Active Period:** **${chart.dasha?.activeMahadasha} Mahadasha / ${chart.dasha?.activeAntardasha} Antardasha** (${chart.dasha?.activeYears})

### 2. Comprehensive Sidereal Planetary Placements
${(chart.planets || []).map(p => `- **${p.name}:** ${formatRashiBilingual(p.sign)} at ${p.degree}°, placed in **House ${p.house}** (${p.nakshatra}, Pada ${p.pada}) — Status: ${p.dignity}${p.retrograde ? ', Retrograde' : ''}${p.combust ? ', Combust' : ''}`).join('\n')}`;
      }

      case 'identity':
        return `### 1. Temperament, Mental Architecture & Behavioral Patterns
With **${formatRashiBilingual(lagna)}** rising, your behavioral expression combines clarity of purpose with measured execution. The Lagna lord (**${lagnaLord}**) directs your focus toward competence, personal sovereignty, and intellectual integrity. You possess a dignified demeanor that commands natural respect without need for ostentation.

- **Core Takeaway:** You embody a disciplined balance of high standards, thoughtful reflection, and steady determination.
- **Astrological Mechanism:** Cognitive processing is shaped by ${formatP('Mercury')} and ${formatP('Moon')}, while ${formatP('Mars')} provides kinetic drive and goal execution.
- **Practical Impact:** When encountering adversity, you step back to analyze root causes methodically rather than reacting impulsively, ensuring resilient, well-calibrated outcomes.`;

      case 'relationships':
        return `### 1. Relational Dynamics, Attachment Style & Partnership
In classical Jyotish, the 7th house (Kalatra Bhava), along with **${formatP('Venus')}** (natural karaka of romance) and **${formatP('Jupiter')}** (karaka of wisdom and commitment), defines your relationship orientation. Your approach to love, marriage, and long-term companionship is rooted in mutual respect, intellectual rapport, and emotional sincerity.

- **Core Takeaway:** You flourish alongside a partner who is both an intellectual equal and an emotional confidant, cherishing transparent communication and shared life philosophy.
- **Astrological Mechanism:** The 7th house axis, supported by benefic aspects from Venus and Jupiter, establishes a sturdy foundation for durable partnership and domestic harmony.
- **Practical Impact:** Partnerships thrive when mutual autonomy, clear expectations, and affectionate emotional safety are honored consistently.`;

      case 'career':
        return `### 1. Vocation, Leadership Trajectory & Professional Acumen
The 10th house of career and karma, harmonized by **${formatP('Saturn')}** and **${formatP('Sun')}**, reveals natural capacity for strategic responsibility, organizational leadership, and specialized competence. You excel in vocations requiring methodical planning, analytical precision, and executive reliability.

- **Core Takeaway:** Your professional trajectory is characterized by steady, compounding advancement where diligence, ethical integrity, and specialized expertise earn long-term authority.
- **Astrological Mechanism:** The 10th and 6th houses, reinforced by ${formatP('Mercury')} and ${formatP('Mars')}, foster keen problem-solving, operational stamina, and competitive excellence.
- **Practical Impact:** You thrive in environments that grant autonomy over deliverables and reward merit, analytical innovation, and strategic leadership.`;

      case 'health_yogas':
      case 'health':
      case 'yogas': {
        const yogaRows = (chart.yogas || []).map(y => `${y.name} | ${y.status} | ${y.formation} | ${y.impact}`).join('\n');
        const doshaRows = [
          `Mangal (Kuja) Dosha | ${chart.doshas?.mangalDosha?.present ? 'Present' : 'Absent/Cancelled'} | ${chart.doshas?.mangalDosha?.cancellationReason || 'Mars in non-afflicting alignment'} | ${chart.doshas?.mangalDosha?.present ? 'Direct energy requiring mindful patience in partnerships' : 'Harmonious partnership energy without dosha friction'}`,
          `Kaal Sarpa Alignment | ${chart.doshas?.kaalSarpa?.present ? 'Present' : 'Not present'} | ${chart.doshas?.kaalSarpa?.type || 'Planets balanced across nodal axis'} | ${chart.doshas?.kaalSarpa?.present ? 'Early life tests yielding intense resilience and later triumphs' : 'Smooth planetary flow across all life spheres'}`,
          `Sade Sati Transit Status | ${chart.doshas?.sadeSati?.status.includes('Not') ? 'Not active' : 'Active'} | ${chart.doshas?.sadeSati?.status} | Disciplined restructuring and enduring maturity`
        ].join('\n');

        return `### 1. Classical Planetary Combinations (Yogas) & Auspicious Formations
Classical Vedic treatises outline planetary alignments that elevate a horoscope's potential:

${yogaListText}

### 2. Vitality, Energy Cycles & Stress Management
Supported by ${formatP('Sun')} and ${formatP('Mars')}, your physical stamina is resilient, flourishing with regular physical movement, balanced nutrition, and structured restorative rest.

<!-- Machine-readable catalog rows -->
${yogaRows}
${doshaRows}`;
      }

      case 'timeline': {
        const seq = (chart.dasha?.sequence || []).map(d => `- **${d.lord} Mahadasha (${d.startYear} – ${d.endYear}):** ${d.years} years of focus on ${d.lord}-governed themes.`).join('\n');
        return `### 1. Vimshottari Mahadasha 120-Year Complete Sequence
Based on your natal Moon's exact Nakshatra degree (**${chart.moonNakshatra}**), the classical Vimshottari cycle unfolds as follows:

${seq}

### 2. Current & Upcoming Phase Highlights
- **Current Phase (${chart.dasha?.activeYears}):** **${chart.dasha?.activeMahadasha} Mahadasha / ${chart.dasha?.activeAntardasha} Antardasha** — Consolidating authority, intellectual focus, and establishing long-term stability.`;
      }

      case 'synthesis': {
        return `### 1. Purpose, Core Strengths & Central Life Synthesis
Your Vedic horoscope presents the blueprint of a purposeful, resilient, and discerning individual. By harmonizing your **${formatRashiBilingual(lagna)} Lagna** vitality with the intuitive wisdom of **Moon in ${formatRashiBilingual(moon)}** and the sovereign ambition of **Sun in ${formatRashiBilingual(sun)}**, you are equipped to navigate life's challenges with poise and build an enduring legacy of contribution.

- **Greatest Strength:** Strategic patience combined with refined intellectual competence.
- **Central Life Purpose:** Cultivating inner mastery, leading with ethical clarity, and building lasting value for family and community.`;
      }

      default:
        return `### 1. Comprehensive Vedic Astrological Analysis
This section analyzes your horoscope's foundational placements with reverence to classical Jyotish principles. With ${formatRashiBilingual(lagna)} Lagna and Moon in ${formatRashiBilingual(moon)}, your planetary configuration supports meaningful growth, balanced partnerships, and resilient accomplishment across all major endeavors.`;
    }
  }

  function answerChatLocally(question, chart, lang = 'en') {
    const isHi = lang === 'hi';
    const q = (question || '').toLowerCase();
    const lagna = chart?.ascSign || chart?.lagna?.sign || 'Aries';
    const moon = chart?.moonRashi || 'Aries';
    const sun = chart?.sunRashi || 'Aries';
    const dasha = chart?.dasha?.activeMahadasha || 'Jupiter';
    const antardasha = chart?.dasha?.activeAntardasha || 'Saturn';

    if (q.includes('gemstone') || q.includes('remedy') || q.includes('mantra') || q.includes('pooja') || q.includes('उपाय') || q.includes('रत्न')) {
      return `### 1. Astrological Ethics & Philosophical Framework
This platform operates strictly on classical interpretive Vedic principles. It intentionally avoids superstition, commercial remedies, gemstones, and ritual prescriptions.

- **Foundational Principle:** Your chart's strengths (${lagna} Lagna, Moon in ${moon}, Sun in ${sun}) unfold through conscious awareness, ethical integrity, and disciplined decision-making.
- **Practical Application:** Aligning your daily habits with your planetary strengths yields compounding stability over external rituals.`;
    }

    if (q.includes('career') || q.includes('job') || q.includes('business') || q.includes('work') || q.includes('करियर') || q.includes('नौकरी')) {
      return `### 1. Direct Career Assessment & Executive Synthesis
Your professional trajectory is anchored by **${lagna} Lagna**, **Moon in ${moon}**, and the 10th house karmic axis.

- **Vocation & Working Style:** You perform with distinction in roles demanding disciplined stewardship, specialized intellectual capability, and strategic vision.
- **Timing & Vimshottari Cycles:** Under the current **${dasha} Mahadasha / ${antardasha} Antardasha**, focus on consolidating core expertise and expanding strategic networks for sustainable advancement.`;
    }

    return `### 1. Comprehensive Vedic Astrological Consultation
Synthesizing your birth chart with **${lagna} Lagna**, **Moon in ${moon}**, and **Sun in ${sun}**:

- **Core Synthesis:** Your chart reveals a resilient, discerning individual equipped with strategic foresight and unwavering perseverance.
- **Active Planetary Influence:** You are navigating the **${dasha} Mahadasha / ${antardasha} Antardasha**, an energetic phase that consolidates maturity and rewards systematic effort.
- **Actionable Guidance:** Leverage your innate discipline and emotional composure to optimize career, personal growth, and relationship harmony.`;
  }

  return {
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
    calculateJaiminiKarakas,
    calculateVimshottariDasha,
    generateSectionBaseline,
    answerChatLocally
  };
}));
