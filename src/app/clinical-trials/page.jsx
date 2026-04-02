'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import fallbackTrials from '../../data/clinical-trials.json';
import siteCoords from '../../data/site-coordinates.json';
import styles from './clinical-trials.module.css';

const GENETIC_MARKERS = [
  { key: 'NPM1', label: 'NPM1 mutation' },
  { key: 'FLT3-ITD', label: 'FLT3-ITD mutation' },
  { key: 'KMT2A', label: 'KMT2A rearrangement' },
  { key: 'TP53', label: 'TP53 mutation' },
  { key: 'IDH1', label: 'IDH1 mutation' },
];

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
  trials.forEach(t => { parseSites(t.sites).forEach(s => locs.add(s)); });
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

export default function ClinicalTrialsPage() {
  const [trials, setTrials] = useState(fallbackTrials);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        if (data.trials && data.trials.length > 0) setTrials(data.trials);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lookupPostcode = useCallback(async () => {
    const clean = postcode.replace(/\s+/g, '').toUpperCase();
    if (!clean) { setUserCoords(null); setPostcodeError(''); setSortByDistance(false); return; }
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
        setUserCoords(null); setSortByDistance(false);
        setPostcodeError('Postcode not found.');
      }
    } catch {
      setUserCoords(null); setSortByDistance(false);
      setPostcodeError('Lookup failed. Try again.');
    } finally { setPostcodeLoading(false); }
  }, [postcode]);

  const clearPostcode = () => {
    setPostcode(''); setUserCoords(null); setPostcodeError(''); setSortByDistance(false);
  };

  const categories = useMemo(() => ['All', ...new Set(trials.map(t => t.category))], [trials]);
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

  const filtered = useMemo(() => {
    let result = trials.filter(trial => {
      if (categoryFilter !== 'All' && trial.category !== categoryFilter) return false;
      if (!matchesGenetics(trial, selectedMarkers)) return false;
      if (!matchesLocation(trial, selectedLocation)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(
          trial.name.toLowerCase().includes(q) ||
          (trial.description || '').toLowerCase().includes(q) ||
          (trial.sites || '').toLowerCase().includes(q) ||
          (trial.inclusionCriteria || []).some(c => c.toLowerCase().includes(q)) ||
          (trial.exclusionCriteria || []).some(c => c.toLowerCase().includes(q))
        )) return false;
      }
      return true;
    });
    if (sortByDistance && userCoords) {
      result = [...result].sort((a, b) => {
        const da = trialDistances[a.id]?.distance ?? Infinity;
        const db = trialDistances[b.id]?.distance ?? Infinity;
        return da - db;
      });
    }
    return result;
  }, [trials, search, categoryFilter, selectedMarkers, selectedLocation, sortByDistance, userCoords, trialDistances]);

  const counts = useMemo(() => {
    const map = { All: trials.length };
    trials.forEach(t => { map[t.category] = (map[t.category] || 0) + 1; });
    return map;
  }, [trials]);

  const toggleMarker = (marker) => {
    setSelectedMarkers(prev => prev.includes(marker) ? prev.filter(m => m !== marker) : [...prev, marker]);
  };

  const activeFilterCount = selectedMarkers.length + (selectedLocation ? 1 : 0) + (userCoords ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedMarkers([]); setSelectedLocation(''); setCategoryFilter('All'); setSearch(''); clearPostcode();
  };

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <>
      {/* Search */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Search</h3>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Trial name, site, criteria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">&times;</button>
          )}
        </div>
      </div>

      {/* Postcode */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Distance</h3>
        <div className={styles.postcodeRow}>
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
            {postcodeLoading ? '...' : 'Go'}
          </button>
          {userCoords && (
            <button onClick={clearPostcode} className={styles.postcodeClear}>&times;</button>
          )}
        </div>
        {postcodeError && <p className={styles.postcodeError}>{postcodeError}</p>}
        {userCoords && <p className={styles.postcodeSuccess}>Sorted by nearest site</p>}
      </div>

      {/* Category */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Category</h3>
        <div className={styles.categoryList}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${categoryFilter === cat ? styles.categoryBtnActive : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              <span>{cat}</span>
              <span className={styles.categoryCount}>{counts[cat] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Genetic Markers */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Genetic Markers</h3>
        <p className={styles.filterHint}>Patient's markers</p>
        <div className={styles.checkboxList}>
          {GENETIC_MARKERS.map(({ key, label }) => (
            <label key={key} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedMarkers.includes(key)}
                onChange={() => toggleMarker(key)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Site</h3>
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
        <button className={styles.clearAllBtn} onClick={clearAllFilters}>
          Clear all filters
        </button>
      )}
    </>
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Clinical Trials</h1>
        <p>Browse open clinical trials in AML, MDS, and related haematological malignancies across the UK.</p>
      </section>

      {/* Mobile filter toggle */}
      <button
        className={styles.mobileFilterToggle}
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      >
        Filters
        {activeFilterCount > 0 && <span className={styles.activeCount}>{activeFilterCount}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mobileFiltersOpen ? styles.chevronOpen : ''}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className={styles.mobileFilters}>
          {sidebarContent}
        </div>
      )}

      <div className={styles.layout}>
        {/* Desktop sidebar */}
        <aside className={styles.sidebar}>
          {sidebarContent}
        </aside>

        {/* Trial list */}
        <section className={styles.results}>
          <p className={styles.resultCount}>
            {loading ? 'Loading...' : `${filtered.length} trial${filtered.length !== 1 ? 's' : ''} found`}
            {sortByDistance && !loading && (
              <span className={styles.filterNote}> — sorted by distance</span>
            )}
          </p>

          <div className={styles.trialList}>
            {filtered.map(trial => {
              const isExpanded = expandedTrial === trial.id;
              const genetics = trial.genetics || { required: [], excluded: [] };
              const nearest = trialDistances[trial.id];
              return (
                <div key={trial.id} className={styles.trialCard}>
                  <div className={styles.trialHeader} onClick={() => setExpandedTrial(isExpanded ? null : trial.id)}>
                    <div className={styles.trialMeta}>
                      <span className={`${styles.categoryBadge} ${styles[`cat${trial.category.replace(/[^a-zA-Z]/g, '')}`]}`}>
                        {trial.category}
                      </span>
                      {trial.phase && (
                        <span className={styles.phaseBadge}>{trial.phase}</span>
                      )}
                      {nearest && (
                        <span className={styles.distanceBadge}>
                          ~{Math.round(nearest.distance * 0.621371)} miles — {nearest.city}
                        </span>
                      )}
                      {!nearest && userCoords && (
                        <span className={styles.distanceBadgeUnknown}>Distance N/A</span>
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
                          <span key={m} className={`${styles.markerTag} ${styles.markerRequired}`}>{m}</span>
                        ))}
                        {genetics.excluded.map(m => (
                          <span key={m} className={`${styles.markerTag} ${styles.markerExcluded}`}>{m} excluded</span>
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
        </section>
      </div>
    </div>
  );
}
