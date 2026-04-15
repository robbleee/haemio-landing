'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import fallbackTrials from '../../data/clinical-trials.json';
import siteCoords from '../../data/site-coordinates.json';
import styles from './clinical-trials.module.css';

const GENETIC_MARKERS = [
  { key: 'NPM1', label: 'NPM1' },
  { key: 'FLT3-ITD', label: 'FLT3-ITD' },
  { key: 'FLT3-TKD', label: 'FLT3-TKD' },
  { key: 'KMT2A', label: 'KMT2A' },
  { key: 'NUP98', label: 'NUP98' },
  { key: 'TP53', label: 'TP53' },
  { key: 'IDH1', label: 'IDH1' },
  { key: 'IDH2', label: 'IDH2' },
  { key: 'CEBPA', label: 'CEBPA' },
  { key: 'RUNX1', label: 'RUNX1' },
  { key: 'ASXL1', label: 'ASXL1' },
];

const FITNESS_OPTIONS = [
  { key: '', label: 'Any' },
  { key: 'intensive', label: 'Fit for intensive' },
  { key: 'non-intensive', label: 'Non-intensive only' },
];

// --- Haversine distance (km) ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseSites(sitesStr) {
  if (!sitesStr) return [];
  if (/^[~\d]/.test(sitesStr) || /^Multiple/.test(sitesStr)) return [];
  return sitesStr.split(',').map(s => s.trim()).filter(Boolean);
}

function getNearestSite(trial, userLat, userLng, travelData) {
  const sites = parseSites(trial.sites);
  let nearest = null;
  for (const site of sites) {
    const coords = siteCoords[site];
    if (!coords) continue;
    const dist = haversine(userLat, userLng, coords.lat, coords.lng);
    const travel = travelData?.[site] || null;
    // Prefer driving duration for "nearest" ranking when available, fall back to haversine
    const sortValue = travel?.driving?.duration ?? dist * 60; // rough: 1km ≈ 1min fallback
    if (!nearest || sortValue < nearest.sortValue) {
      nearest = { site, city: coords.city, distance: dist, sortValue, travel };
    }
  }
  return nearest;
}

function extractLocations(trials) {
  const locs = new Set();
  trials.forEach(t => {
    parseSites(t.sites).forEach(s => locs.add(s));
  });
  return Array.from(locs).sort();
}

function matchesGenetics(trial, selectedMarkers) {
  if (selectedMarkers.length === 0) return true;
  const genetics = trial.genetics || { required: [], excluded: [] };
  for (const marker of selectedMarkers) {
    if (genetics.excluded.includes(marker)) return false;
  }
  if (genetics.required.length === 0) return true;
  return genetics.required.some(r => selectedMarkers.includes(r));
}

function matchesLocation(trial, selectedLocation) {
  if (!selectedLocation) return true;
  if (/^[~\d]/.test(trial.sites) || /^Multiple/.test(trial.sites)) return true;
  return trial.sites.toLowerCase().includes(selectedLocation.toLowerCase());
}

function matchesFitness(trial, fitnessFilter) {
  if (!fitnessFilter) return true;
  if (!trial.fitness) return true; // null fitness = no restriction
  if (trial.fitness === 'both') return true;
  return trial.fitness === fitnessFilter;
}

function matchesPhase(trial, phaseFilters) {
  if (phaseFilters.length === 0) return true;
  if (!trial.phase) return false;
  const p = trial.phase.toLowerCase();
  // "Phase 1/2" matches both phase 1 and phase 2; "Phase 1b" matches phase 1; etc.
  return phaseFilters.some(f => p.includes(f));
}

function matchesAge(trial, patientAge) {
  if (!patientAge) return true;
  const age = parseInt(patientAge, 10);
  if (isNaN(age)) return true;
  if (trial.ageMin != null && age < trial.ageMin) return false;
  if (trial.ageMax != null && age > trial.ageMax) return false;
  return true;
}

function matchesEcog(trial, patientEcog) {
  if (patientEcog === '' || patientEcog == null) return true;
  if (trial.ecogMax == null) return true; // no restriction specified
  return parseInt(patientEcog, 10) <= trial.ecogMax;
}

// Compute a match score — only scores dimensions where the trial specifies requirements.
// A trial with no genetic requirements doesn't get a genetics score (it's open to everyone, not a "match").
function computeMatchScore(trial, { selectedMarkers, fitnessFilter, categoryFilter }) {
  let score = 0;
  let maxScore = 0;

  const genetics = trial.genetics || { required: [], excluded: [] };

  // Genetics: only score if patient has markers AND trial specifies required genetics
  if (selectedMarkers.length > 0 && genetics.required.length > 0) {
    maxScore += 3;
    if (genetics.required.some(r => selectedMarkers.includes(r))) score += 3;
  }

  // Fitness: only score if patient specified fitness AND trial specifies a fitness requirement
  if (fitnessFilter && trial.fitness && trial.fitness !== 'both') {
    maxScore += 2;
    if (trial.fitness === fitnessFilter) score += 2;
  }

  // Category: only score if category filter is active
  if (categoryFilter && categoryFilter !== 'All') {
    maxScore += 1;
    if (trial.category === categoryFilter) score += 1;
  }

  if (maxScore === 0) return null; // no dimensions to score — trial is broadly open
  return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
}

// Read URL params on initial load (client-side only)
function getInitialParams() {
  if (typeof window === 'undefined') {
    return { markers: [], fitness: '', category: 'All', phase: [], age: '', ecog: '', postcode: '' };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    markers: p.get('markers')?.split(',').filter(Boolean) || [],
    fitness: p.get('fitness') || '',
    category: p.get('category') || 'All',
    phase: p.get('phase')?.split(',').filter(Boolean) || [],
    age: p.get('age') || '',
    ecog: p.get('ecog') ?? '',
    postcode: p.get('postcode') || '',
  };
}

export default function ClinicalTrialsPage() {
  const initParams = useRef(getInitialParams());
  const ip = initParams.current;

  const [trials, setTrials] = useState(fallbackTrials);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ip.category);
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Patient profile filters
  const [selectedMarkers, setSelectedMarkers] = useState(ip.markers);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [fitnessFilter, setFitnessFilter] = useState(ip.fitness);
  const [phaseFilters, setPhaseFilters] = useState(ip.phase);
  const [patientAge, setPatientAge] = useState(ip.age);
  const [patientEcog, setPatientEcog] = useState(ip.ecog);
  const [showFilters, setShowFilters] = useState(
    ip.markers.length > 0 || ip.fitness || ip.age || ip.ecog !== '' || ip.postcode
  );
  const [shareTooltip, setShareTooltip] = useState(false);

  // Postcode distance
  const [postcode, setPostcode] = useState(ip.postcode);
  const [userCoords, setUserCoords] = useState(null);
  const [postcodeError, setPostcodeError] = useState('');
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [travelData, setTravelData] = useState(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelMode, setTravelMode] = useState('driving'); // 'driving' or 'transit'

  useEffect(() => {
    fetch('/api/clinical-trials')
      .then(res => res.json())
      .then(data => {
        if (data.trials && data.trials.length > 0) {
          setTrials(data.trials);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lookupPostcode = useCallback(async () => {
    const clean = postcode.replace(/\s+/g, '').toUpperCase();
    if (!clean) {
      setUserCoords(null);
      setPostcodeError('');
      setSortByDistance(false);
      setTravelData(null);
      return;
    }
    setPostcodeLoading(true);
    setPostcodeError('');
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        setUserCoords({ lat: data.result.latitude, lng: data.result.longitude });
        setSortByDistance(true);
        setPostcodeError('');

        // Fetch travel times in parallel (non-blocking — falls back to haversine if unavailable)
        setTravelLoading(true);
        fetch(`/api/travel-time?postcode=${clean}`)
          .then(r => r.json())
          .then(d => { if (d.travel) setTravelData(d.travel); })
          .catch(() => {}) // silently fall back to haversine
          .finally(() => setTravelLoading(false));
      } else {
        setUserCoords(null);
        setSortByDistance(false);
        setPostcodeError('Postcode not found');
      }
    } catch {
      setUserCoords(null);
      setSortByDistance(false);
      setPostcodeError('Could not look up postcode');
    } finally {
      setPostcodeLoading(false);
    }
  }, [postcode]);

  // Auto-lookup postcode if it came from URL params
  const didAutoLookup = useRef(false);
  useEffect(() => {
    if (ip.postcode && !didAutoLookup.current) {
      didAutoLookup.current = true;
      lookupPostcode();
    }
  }, [ip.postcode, lookupPostcode]);

  const clearPostcode = () => {
    setPostcode('');
    setUserCoords(null);
    setPostcodeError('');
    setSortByDistance(false);
    setTravelData(null);
  };

  const buildShareUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (selectedMarkers.length) p.set('markers', selectedMarkers.join(','));
    if (fitnessFilter) p.set('fitness', fitnessFilter);
    if (categoryFilter !== 'All') p.set('category', categoryFilter);
    if (phaseFilters.length) p.set('phase', phaseFilters.join(','));
    if (patientAge) p.set('age', patientAge);
    if (patientEcog !== '') p.set('ecog', patientEcog);
    if (postcode.trim()) p.set('postcode', postcode.trim());
    const qs = p.toString();
    return `${window.location.origin}${window.location.pathname}${qs ? '?' + qs : ''}`;
  }, [selectedMarkers, fitnessFilter, categoryFilter, phaseFilters, patientAge, patientEcog, postcode]);

  const handleShare = useCallback(() => {
    const url = buildShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    });
  }, [buildShareUrl]);

  // Enquiry email modal
  const [enquiryModal, setEnquiryModal] = useState(null); // { trial, draft }
  const [enquiryCopied, setEnquiryCopied] = useState(false);

  const openEnquiry = useCallback((trial) => {
    const genetics = trial.genetics || { required: [], excluded: [] };
    const matchedMarkers = selectedMarkers.filter(m => !genetics.excluded.includes(m));
    const hasProfile = selectedMarkers.length > 0 || fitnessFilter || (categoryFilter !== 'All');
    const matchScore = hasProfile
      ? computeMatchScore(trial, { selectedMarkers, fitnessFilter, categoryFilter })
      : null;

    const lines = [];
    lines.push(`Dear ${trial.name} Trial Team,`);
    lines.push('');
    lines.push(`I am writing to enquire about enrolling a patient in the ${trial.name} trial (${trial.phase || 'phase not specified'}).`);
    lines.push('');
    lines.push('Patient summary:');
    if (patientAge) lines.push(`  - Age: ${patientAge} years`);
    if (patientEcog !== '') lines.push(`  - ECOG performance status: ${patientEcog}`);
    if (fitnessFilter) lines.push(`  - Fitness: ${fitnessFilter === 'intensive' ? 'Fit for intensive chemotherapy' : 'Non-intensive only'}`);
    if (categoryFilter !== 'All') lines.push(`  - Disease status: ${categoryFilter}`);
    if (matchedMarkers.length > 0) lines.push(`  - Molecular markers: ${matchedMarkers.join(', ')}`);
    lines.push('');

    // Eligibility reasoning
    const reasons = [];
    if (genetics.required.length > 0 && matchedMarkers.some(m => genetics.required.includes(m))) {
      const matched = matchedMarkers.filter(m => genetics.required.includes(m));
      reasons.push(`the patient carries ${matched.join(' and ')}, which ${matched.length > 1 ? 'are' : 'is'} required for this trial`);
    }
    if (fitnessFilter && trial.fitness && (trial.fitness === fitnessFilter || trial.fitness === 'both')) {
      reasons.push(`the patient is ${fitnessFilter === 'intensive' ? 'fit for intensive chemotherapy' : 'suitable for non-intensive therapy'} as required`);
    }
    if (patientAge) {
      const ageNum = parseInt(patientAge, 10);
      if (trial.ageMin != null && trial.ageMax != null) reasons.push(`the patient's age (${ageNum}) falls within the trial's eligibility range (${trial.ageMin}–${trial.ageMax})`);
      else if (trial.ageMin != null) reasons.push(`the patient meets the minimum age requirement (≥${trial.ageMin})`);
    }
    if (patientEcog !== '' && trial.ecogMax != null) {
      reasons.push(`ECOG ${patientEcog} meets the trial requirement (ECOG ≤${trial.ecogMax})`);
    }

    if (reasons.length > 0) {
      lines.push(`Based on the eligibility criteria, this patient appears to be a potential candidate because ${reasons.join('; ')}.`);
    } else {
      lines.push('Based on the published eligibility criteria, this patient appears to be a potential candidate for this trial.');
    }

    if (matchScore && matchScore.percentage > 0) {
      lines.push(`Our eligibility screening tool indicates a ${matchScore.percentage}% match with the trial criteria.`);
    }

    lines.push('');
    lines.push('I would be grateful if you could advise on:');
    lines.push('  1. Whether this patient would be suitable for screening');
    lines.push('  2. Available trial sites and any current recruitment status');
    lines.push('  3. Any additional information or tests required prior to referral');
    lines.push('');
    lines.push('Many thanks for your time.');
    lines.push('');
    lines.push('Kind regards,');
    lines.push('[Your name]');
    lines.push('[Your position / Hospital]');

    setEnquiryModal({ trial, draft: lines.join('\n') });
    setEnquiryCopied(false);
  }, [selectedMarkers, fitnessFilter, categoryFilter, patientAge, patientEcog]);

  const copyEnquiry = useCallback(() => {
    if (!enquiryModal) return;
    navigator.clipboard.writeText(enquiryModal.draft).then(() => {
      setEnquiryCopied(true);
      setTimeout(() => setEnquiryCopied(false), 2000);
    });
  }, [enquiryModal]);

  const categories = useMemo(() => {
    return ['All', ...new Set(trials.map(t => t.category))];
  }, [trials]);

  const PHASE_OPTIONS = [
    { key: '1', label: 'Phase 1' },
    { key: '2', label: 'Phase 2' },
    { key: '3', label: 'Phase 3' },
  ];

  const locations = useMemo(() => extractLocations(trials), [trials]);

  const trialDistances = useMemo(() => {
    if (!userCoords) return {};
    const map = {};
    trials.forEach(trial => {
      const nearest = getNearestSite(trial, userCoords.lat, userCoords.lng, travelData);
      if (nearest) map[trial.id] = nearest;
    });
    return map;
  }, [trials, userCoords, travelData]);

  const hasPatientProfile = selectedMarkers.length > 0 || fitnessFilter || (categoryFilter !== 'All') || patientAge || patientEcog !== '';

  const filtered = useMemo(() => {
    let result = trials.filter(trial => {
      if (categoryFilter !== 'All' && trial.category !== categoryFilter) return false;
      if (!matchesGenetics(trial, selectedMarkers)) return false;
      if (!matchesLocation(trial, selectedLocation)) return false;
      if (!matchesFitness(trial, fitnessFilter)) return false;
      if (!matchesPhase(trial, phaseFilters)) return false;
      if (!matchesAge(trial, patientAge)) return false;
      if (!matchesEcog(trial, patientEcog)) return false;

      if (search) {
        const q = search.toLowerCase();
        const inText = (
          trial.name.toLowerCase().includes(q) ||
          (trial.description || '').toLowerCase().includes(q) ||
          (trial.sites || '').toLowerCase().includes(q) ||
          (trial.inclusionCriteria || []).some(c => c.toLowerCase().includes(q)) ||
          (trial.exclusionCriteria || []).some(c => c.toLowerCase().includes(q))
        );
        if (!inText) return false;
      }

      return true;
    });

    // Sort helper: match score for a trial (null means broadly eligible, no specific match)
    const getMatch = (t) => computeMatchScore(t, { selectedMarkers, fitnessFilter, categoryFilter });

    // Sort comparator: scored trials first, then by %, then by number of matched dimensions
    const compareMatch = (a, b) => {
      const ma = getMatch(a);
      const mb = getMatch(b);
      if (ma && !mb) return -1;
      if (!ma && mb) return 1;
      if (ma && mb) {
        if (ma.percentage !== mb.percentage) return mb.percentage - ma.percentage;
        // Same %, prefer more matched dimensions (stronger signal)
        return mb.maxScore - ma.maxScore;
      }
      return 0;
    };

    if (sortByDistance && userCoords) {
      // Primary: match score, secondary: distance
      result = [...result].sort((a, b) => {
        const matchCmp = compareMatch(a, b);
        if (matchCmp !== 0) return matchCmp;
        const getSort = (n) => {
          if (!n) return Infinity;
          if (travelData && travelMode === 'transit' && n.travel?.transit?.duration) return n.travel.transit.duration;
          if (travelData && n.travel?.driving?.duration) return n.travel.driving.duration;
          return n.distance;
        };
        return getSort(trialDistances[a.id]) - getSort(trialDistances[b.id]);
      });
    } else if (hasPatientProfile) {
      result = [...result].sort(compareMatch);
    }

    return result;
  }, [trials, search, categoryFilter, selectedMarkers, selectedLocation, fitnessFilter, phaseFilters, patientAge, patientEcog, sortByDistance, userCoords, trialDistances, hasPatientProfile, travelData, travelMode]);

  const counts = useMemo(() => {
    const map = { All: trials.length };
    trials.forEach(t => { map[t.category] = (map[t.category] || 0) + 1; });
    return map;
  }, [trials]);

  const toggleMarker = (marker) => {
    setSelectedMarkers(prev =>
      prev.includes(marker) ? prev.filter(m => m !== marker) : [...prev, marker]
    );
  };

  const activeFilterCount = selectedMarkers.length + (selectedLocation ? 1 : 0) + (userCoords ? 1 : 0) + (fitnessFilter ? 1 : 0) + phaseFilters.length + (patientAge ? 1 : 0) + (patientEcog !== '' ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedMarkers([]);
    setSelectedLocation('');
    setCategoryFilter('All');
    setSearch('');
    setFitnessFilter('');
    setPhaseFilters([]);
    setPatientAge('');
    setPatientEcog('');
    clearPostcode();
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Clinical Trials</h1>
        <p>Browse open clinical trials in AML, MDS, and related haematological malignancies across the UK.</p>
      </section>

      {/* Search + category + phase filters */}
      <section className={styles.controls}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search trials by name, drug, site, or criteria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">&times;</button>
          )}
        </div>

        <div className={styles.filterRows}>
          {/* Category pills */}
          <div className={styles.filterRow}>
            <span className={styles.filterRowLabel}>Category</span>
            <div className={styles.filters}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${categoryFilter === cat ? styles.filterBtnActive : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                  <span className={styles.count}>{counts[cat] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phase pills – multi-select, simplified to 1 / 2 / 3 */}
          <div className={styles.filterRow}>
            <span className={styles.filterRowLabel}>Phase</span>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${phaseFilters.length === 0 ? styles.filterBtnActive : ''}`}
                onClick={() => setPhaseFilters([])}
              >
                All
              </button>
              {PHASE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  className={`${styles.filterBtn} ${phaseFilters.includes(opt.key) ? styles.filterBtnActive : ''}`}
                  onClick={() => setPhaseFilters(prev =>
                    prev.includes(opt.key) ? prev.filter(k => k !== opt.key) : [...prev, opt.key]
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle advanced / patient filters */}
        <button
          className={styles.advancedToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide' : 'Show'} patient filters
          {activeFilterCount > 0 && (
            <span className={styles.activeCount}>{activeFilterCount}</span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showFilters ? styles.chevronOpen : ''}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showFilters && (
          <div className={styles.advancedPanel}>
            {/* Fitness */}
            <div className={styles.profileField}>
              <label className={styles.profileLabel}>Fitness for chemotherapy</label>
              <div className={styles.fitnessToggle}>
                {FITNESS_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`${styles.fitnessBtn} ${fitnessFilter === opt.key ? styles.fitnessBtnActive : ''}`}
                    onClick={() => setFitnessFilter(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className={styles.profileField}>
              <label className={styles.profileLabel}>Patient age</label>
              <input
                type="number"
                min="0"
                max="120"
                placeholder="e.g. 68"
                value={patientAge}
                onChange={e => setPatientAge(e.target.value)}
                className={styles.ageInput}
              />
              {patientAge && (
                <span className={styles.profileHint}>
                  Hiding trials that exclude age {patientAge}
                </span>
              )}
            </div>

            {/* ECOG Performance Status */}
            <div className={styles.profileField}>
              <label className={styles.profileLabel}>ECOG performance status</label>
              <div className={styles.ecogToggle}>
                <button
                  className={`${styles.ecogBtn} ${patientEcog === '' ? styles.ecogBtnActive : ''}`}
                  onClick={() => setPatientEcog('')}
                >
                  Any
                </button>
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    className={`${styles.ecogBtn} ${patientEcog === String(n) ? styles.ecogBtnActive : ''}`}
                    onClick={() => setPatientEcog(String(n))}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {patientEcog !== '' && (
                <span className={styles.profileHint}>
                  Hiding trials requiring ECOG &lt; {patientEcog}
                </span>
              )}
            </div>

            {/* Genetic markers */}
            <div className={styles.profileField}>
              <label className={styles.profileLabel}>Genetic markers present</label>
              <p className={styles.profileHint}>Select markers present in the patient to find eligible trials</p>
              <div className={styles.markerChips}>
                {GENETIC_MARKERS.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`${styles.markerChip} ${selectedMarkers.includes(key) ? styles.markerChipActive : ''}`}
                    onClick={() => toggleMarker(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Postcode */}
            <div className={styles.profileField}>
              <label className={styles.profileLabel}>Patient location</label>
              <div className={styles.locationRow}>
                <input
                  type="text"
                  placeholder="UK postcode"
                  value={postcode}
                  onChange={e => setPostcode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupPostcode()}
                  className={styles.postcodeInput}
                />
                <button
                  onClick={lookupPostcode}
                  disabled={postcodeLoading || !postcode.trim()}
                  className={styles.postcodeBtn}
                >
                  {postcodeLoading ? '...' : 'Find nearest'}
                </button>
                {userCoords && (
                  <button onClick={clearPostcode} className={styles.postcodeClear} aria-label="Clear postcode">&times;</button>
                )}
              </div>
              {postcodeError && <span className={styles.postcodeError}>{postcodeError}</span>}
              {userCoords && (
                <div className={styles.travelModeRow}>
                  <span className={styles.postcodeSuccess}>
                    {travelLoading ? 'Getting travel times...' : 'Sorted by travel time'}
                  </span>
                  {travelData && (
                    <div className={styles.travelModeToggle}>
                      <button
                        className={`${styles.travelModeBtn} ${travelMode === 'driving' ? styles.travelModeBtnActive : ''}`}
                        onClick={() => setTravelMode('driving')}
                        title="Sort by driving time"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17l-1 2m15-2 1 2"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/></svg>
                        Car
                      </button>
                      <button
                        className={`${styles.travelModeBtn} ${travelMode === 'transit' ? styles.travelModeBtnActive : ''}`}
                        onClick={() => setTravelMode('transit')}
                        title="Sort by public transport time"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M6 19l-2 3M18 19l2 3"/></svg>
                        Train
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hospital / site */}
            <div className={styles.profileField}>
              <label className={styles.profileLabel}>Hospital / site</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Any site</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className={styles.profileActions}>
                <span className={styles.activeFilterSummary}>
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </span>
                <button className={styles.clearAllBtn} onClick={clearAllFilters}>
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className={styles.results}>
        <div className={styles.resultsHeader}>
          <p className={styles.resultCount}>
            {loading ? 'Loading...' : `${filtered.length} trial${filtered.length !== 1 ? 's' : ''} found`}
            {hasPatientProfile && !loading && !sortByDistance && (
              <span className={styles.filterNote}> — sorted by match</span>
            )}
            {sortByDistance && !loading && (
              <span className={styles.filterNote}>
                {hasPatientProfile
                  ? ` — sorted by match, then ${travelData ? (travelMode === 'transit' ? 'train' : 'driving') + ' time' : 'distance'}`
                  : travelData
                    ? ` — sorted by ${travelMode === 'transit' ? 'train' : 'driving'} time`
                    : ' — sorted by distance'}
              </span>
            )}
          </p>
          <div className={styles.resultsActions}>
            {hasPatientProfile && (
              <button className={styles.shareBtn} onClick={handleShare}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                {shareTooltip ? 'Link copied!' : 'Share this search'}
              </button>
            )}
            <a href="/clinical-trials/admin" className={styles.submitTrialBtn}>Submit a Trial</a>
          </div>
        </div>

        <div className={styles.trialList}>
          {filtered.map(trial => {
            const isExpanded = expandedTrial === trial.id;
            const genetics = trial.genetics || { required: [], excluded: [] };
            const nearest = trialDistances[trial.id];
            const matchScore = hasPatientProfile
              ? computeMatchScore(trial, { selectedMarkers, fitnessFilter, categoryFilter })
              : null;

            return (
              <div key={trial.id} className={styles.trialCard}>
                <div className={styles.trialHeader} onClick={() => setExpandedTrial(isExpanded ? null : trial.id)}>
                  <div className={styles.trialMeta}>
                    <span className={`${styles.categoryBadge} ${styles[`cat${trial.category.replace(/[^a-zA-Z]/g, '')}`]}`}>
                      {trial.category}
                    </span>
                    {trial.recruitmentStatus && (
                      <span className={`${styles.recruitmentBadge} ${styles[`recruitment${trial.recruitmentStatus.replace(/[^a-zA-Z]/g, '')}`]}`}>
                        {trial.recruitmentStatus === 'recruiting' ? 'Recruiting' : trial.recruitmentStatus === 'not-recruiting' ? 'Not recruiting' : 'Opening soon'}
                      </span>
                    )}
                    {trial.phase && (
                      <span className={styles.phaseBadge}>{trial.phase}</span>
                    )}
                    {trial.fitness && (
                      <span className={`${styles.fitnessBadge} ${styles[`fitness${trial.fitness.replace('-', '')}`]}`}>
                        {trial.fitness === 'intensive' ? 'Intensive' : trial.fitness === 'non-intensive' ? 'Non-intensive' : 'Both'}
                      </span>
                    )}
                    {nearest && (
                      <span className={styles.distanceBadge}>
                        {nearest.travel && travelMode === 'driving' && nearest.travel.driving
                          ? `${nearest.travel.driving.durationText} by car (${nearest.travel.driving.distance})`
                          : nearest.travel && travelMode === 'transit' && nearest.travel.transit
                          ? `${nearest.travel.transit.durationText} by train`
                          : `~${Math.round(nearest.distance * 0.621371)} miles`
                        }
                        {' — '}{nearest.city}
                      </span>
                    )}
                    {!nearest && userCoords && (
                      <span className={styles.distanceBadgeUnknown}>Distance N/A</span>
                    )}
                    {matchScore ? (
                      <span className={`${styles.matchBadge} ${matchScore.percentage >= 80 ? styles.matchHigh : matchScore.percentage >= 50 ? styles.matchMedium : styles.matchLow}`}>
                        {matchScore.percentage}% match
                      </span>
                    ) : hasPatientProfile ? (
                      <span className={`${styles.matchBadge} ${styles.matchEligible}`}>
                        Eligible
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.trialTitleRow}>
                    <h2 className={styles.trialName}>{trial.name}</h2>
                    <svg
                      className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <p className={styles.trialDescription}>{trial.description}</p>

                  <div className={styles.trialMetaBottom}>
                    <span className={styles.siteBadge}>{trial.sites}</span>
                  </div>

                  {(genetics.required.length > 0 || genetics.excluded.length > 0) && (
                    <div className={styles.markerTags}>
                      {genetics.required.map(m => (
                        <span key={m} className={`${styles.markerTag} ${styles.markerRequired} ${selectedMarkers.includes(m) ? styles.markerMatched : ''}`}>
                          {m} {selectedMarkers.includes(m) ? '\u2713' : 'required'}
                        </span>
                      ))}
                      {genetics.excluded.map(m => (
                        <span key={m} className={`${styles.markerTag} ${styles.markerExcluded}`}>
                          {m} excluded
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className={styles.trialDetails}>
                    {(trial.inclusionCriteria || []).length > 0 && (
                      <div className={styles.criteriaSection}>
                        <h3>Key Inclusion Criteria</h3>
                        <ul>
                          {trial.inclusionCriteria.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}

                    {(trial.exclusionCriteria || []).length > 0 && (
                      <div className={styles.criteriaSection}>
                        <h3>Key Exclusion Criteria</h3>
                        <ul>
                          {trial.exclusionCriteria.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className={styles.trialFooter}>
                      <div className={styles.trialFooterLinks}>
                        {trial.weblink && (
                          <a href={trial.weblink} target="_blank" rel="noopener noreferrer" className={styles.trialLink}>
                            View on {trial.weblink.includes('clinicaltrials.gov') ? 'ClinicalTrials.gov' : 'study website'} &rarr;
                          </a>
                        )}
                        {trial.contact && (
                          <a href={`mailto:${trial.contact}`} className={styles.contactLink}>
                            {trial.contact}
                          </a>
                        )}
                      </div>
                      <button
                        className={styles.enquireBtn}
                        onClick={(e) => { e.stopPropagation(); openEnquiry(trial); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Draft enquiry email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className={styles.empty}>
              <p>No trials match your current filters.</p>
              <button className={styles.clearAllBtn} onClick={clearAllFilters}>Clear all filters</button>
            </div>
          )}
        </div>

        <div className={styles.submitTrial}>
          <p>Know of a trial that should be listed here?</p>
          <a
            href="mailto:robert.lee@haem.io?subject=Clinical%20Trial%20Submission&body=Trial%20name%3A%0A%0ATrial%20link%20(ClinicalTrials.gov%20or%20other)%3A%0A%0AKey%20details%20we%20should%20know%3A%0A"
            className={styles.submitTrialLink}
          >
            Email us the details &rarr;
          </a>
        </div>
      </section>

      {/* Enquiry email modal */}
      {enquiryModal && (
        <div className={styles.modalOverlay} onClick={() => setEnquiryModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Draft Enquiry — {enquiryModal.trial.name}</h3>
              <button className={styles.modalClose} onClick={() => setEnquiryModal(null)}>&times;</button>
            </div>
            {enquiryModal.trial.contact && (
              <p className={styles.modalTo}>
                To: <a href={`mailto:${enquiryModal.trial.contact}`}>{enquiryModal.trial.contact}</a>
              </p>
            )}
            <textarea
              className={styles.modalTextarea}
              value={enquiryModal.draft}
              onChange={e => setEnquiryModal(prev => ({ ...prev, draft: e.target.value }))}
              rows={20}
            />
            <div className={styles.modalActions}>
              <button className={styles.modalCopyBtn} onClick={copyEnquiry}>
                {enquiryCopied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              {enquiryModal.trial.contact && (
                <a
                  href={`mailto:${enquiryModal.trial.contact}?subject=${encodeURIComponent(`Enquiry: ${enquiryModal.trial.name} trial`)}&body=${encodeURIComponent(enquiryModal.draft)}`}
                  className={styles.modalEmailBtn}
                >
                  Open in email client
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
