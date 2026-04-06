'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import fallbackTrials from '../../data/clinical-trials.json';
import siteCoords from '../../data/site-coordinates.json';
import styles from './clinical-trials.module.css';

const GENETIC_MARKERS = [
  { key: 'NPM1', label: 'NPM1' },
  { key: 'FLT3-ITD', label: 'FLT3-ITD' },
  { key: 'KMT2A', label: 'KMT2A' },
  { key: 'TP53', label: 'TP53' },
  { key: 'IDH1', label: 'IDH1' },
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

function getNearestSite(trial, userLat, userLng) {
  const sites = parseSites(trial.sites);
  let nearest = null;
  for (const site of sites) {
    const coords = siteCoords[site];
    if (!coords) continue;
    const dist = haversine(userLat, userLng, coords.lat, coords.lng);
    if (!nearest || dist < nearest.distance) {
      nearest = { site, city: coords.city, distance: dist };
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

function matchesPhase(trial, phaseFilter) {
  if (!phaseFilter) return true;
  if (!trial.phase) return false;
  return trial.phase.toLowerCase().includes(phaseFilter.toLowerCase());
}

// Compute a match score for a trial based on patient profile
function computeMatchScore(trial, { selectedMarkers, fitnessFilter, categoryFilter }) {
  let score = 0;
  let maxScore = 0;

  const genetics = trial.genetics || { required: [], excluded: [] };

  // Genetics matching (weight: 3)
  if (selectedMarkers.length > 0) {
    maxScore += 3;
    // Check exclusions
    const hasExclusion = selectedMarkers.some(m => genetics.excluded.includes(m));
    if (hasExclusion) {
      score -= 3; // hard penalty
    } else if (genetics.required.length > 0) {
      const requiredMatch = genetics.required.some(r => selectedMarkers.includes(r));
      if (requiredMatch) score += 3;
    } else {
      score += 2; // no genetic requirement = broadly eligible
    }
  }

  // Fitness matching (weight: 2)
  if (fitnessFilter) {
    maxScore += 2;
    if (!trial.fitness || trial.fitness === 'both') {
      score += 2;
    } else if (trial.fitness === fitnessFilter) {
      score += 2;
    }
  }

  // Category matching (weight: 1)
  if (categoryFilter && categoryFilter !== 'All') {
    maxScore += 1;
    if (trial.category === categoryFilter) score += 1;
  }

  if (maxScore === 0) return null; // no patient profile set
  return { score, maxScore, percentage: Math.max(0, Math.round((score / maxScore) * 100)) };
}

export default function ClinicalTrialsPage() {
  const [trials, setTrials] = useState(fallbackTrials);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Patient profile filters
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [fitnessFilter, setFitnessFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Postcode distance
  const [postcode, setPostcode] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [postcodeError, setPostcodeError] = useState('');
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

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

  const clearPostcode = () => {
    setPostcode('');
    setUserCoords(null);
    setPostcodeError('');
    setSortByDistance(false);
  };

  const categories = useMemo(() => {
    return ['All', ...new Set(trials.map(t => t.category))];
  }, [trials]);

  const phases = useMemo(() => {
    const p = new Set();
    trials.forEach(t => {
      if (t.phase) p.add(t.phase);
    });
    return Array.from(p).sort();
  }, [trials]);

  const locations = useMemo(() => extractLocations(trials), [trials]);

  const trialDistances = useMemo(() => {
    if (!userCoords) return {};
    const map = {};
    trials.forEach(trial => {
      const nearest = getNearestSite(trial, userCoords.lat, userCoords.lng);
      if (nearest) map[trial.id] = nearest;
    });
    return map;
  }, [trials, userCoords]);

  const hasPatientProfile = selectedMarkers.length > 0 || fitnessFilter || (categoryFilter !== 'All');

  const filtered = useMemo(() => {
    let result = trials.filter(trial => {
      if (categoryFilter !== 'All' && trial.category !== categoryFilter) return false;
      if (!matchesGenetics(trial, selectedMarkers)) return false;
      if (!matchesLocation(trial, selectedLocation)) return false;
      if (!matchesFitness(trial, fitnessFilter)) return false;
      if (!matchesPhase(trial, phaseFilter)) return false;

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

    // Sort by distance if postcode is active, otherwise by match score
    if (sortByDistance && userCoords) {
      result = [...result].sort((a, b) => {
        const da = trialDistances[a.id]?.distance ?? Infinity;
        const db = trialDistances[b.id]?.distance ?? Infinity;
        return da - db;
      });
    } else if (hasPatientProfile) {
      result = [...result].sort((a, b) => {
        const sa = computeMatchScore(a, { selectedMarkers, fitnessFilter, categoryFilter });
        const sb = computeMatchScore(b, { selectedMarkers, fitnessFilter, categoryFilter });
        return (sb?.percentage ?? 0) - (sa?.percentage ?? 0);
      });
    }

    return result;
  }, [trials, search, categoryFilter, selectedMarkers, selectedLocation, fitnessFilter, phaseFilter, sortByDistance, userCoords, trialDistances, hasPatientProfile]);

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

  const activeFilterCount = selectedMarkers.length + (selectedLocation ? 1 : 0) + (userCoords ? 1 : 0) + (fitnessFilter ? 1 : 0) + (phaseFilter ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedMarkers([]);
    setSelectedLocation('');
    setCategoryFilter('All');
    setSearch('');
    setFitnessFilter('');
    setPhaseFilter('');
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

          {/* Phase pills */}
          <div className={styles.filterRow}>
            <span className={styles.filterRowLabel}>Phase</span>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${!phaseFilter ? styles.filterBtnActive : ''}`}
                onClick={() => setPhaseFilter('')}
              >
                All
              </button>
              {phases.map(phase => (
                <button
                  key={phase}
                  className={`${styles.filterBtn} ${phaseFilter === phase ? styles.filterBtnActive : ''}`}
                  onClick={() => setPhaseFilter(phaseFilter === phase ? '' : phase)}
                >
                  {phase}
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
              {userCoords && <span className={styles.postcodeSuccess}>Sorted by distance</span>}
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
              <span className={styles.filterNote}> — sorted by distance</span>
            )}
          </p>
          <a href="/clinical-trials/admin" className={styles.submitTrialBtn}>Submit a Trial</a>
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
              <div key={trial.id} className={`${styles.trialCard} ${matchScore && matchScore.percentage === 100 ? styles.trialCardHighMatch : ''}`}>
                <div className={styles.trialHeader} onClick={() => setExpandedTrial(isExpanded ? null : trial.id)}>
                  <div className={styles.trialMeta}>
                    <span className={`${styles.categoryBadge} ${styles[`cat${trial.category.replace(/[^a-zA-Z]/g, '')}`]}`}>
                      {trial.category}
                    </span>
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
                        ~{Math.round(nearest.distance * 0.621371)} miles — {nearest.city}
                      </span>
                    )}
                    {!nearest && userCoords && (
                      <span className={styles.distanceBadgeUnknown}>Distance N/A</span>
                    )}
                    {matchScore && (
                      <span className={`${styles.matchBadge} ${matchScore.percentage >= 80 ? styles.matchHigh : matchScore.percentage >= 50 ? styles.matchMedium : styles.matchLow}`}>
                        {matchScore.percentage}% match
                      </span>
                    )}
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
    </div>
  );
}
