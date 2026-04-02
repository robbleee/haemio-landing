'use client';

import { useState, useEffect, useMemo } from 'react';
import fallbackTrials from '../../data/clinical-trials.json';
import styles from './clinical-trials.module.css';

const GENETIC_MARKERS = [
  { key: 'NPM1', label: 'NPM1 mutation' },
  { key: 'FLT3-ITD', label: 'FLT3-ITD mutation' },
  { key: 'KMT2A', label: 'KMT2A rearrangement' },
  { key: 'TP53', label: 'TP53 mutation' },
  { key: 'IDH1', label: 'IDH1 mutation' },
];

const ICC_CLASSIFICATIONS = [
  'AML with mutated NPM1',
  'AML with KMT2A rearrangement',
  'AML with mutated TP53',
  'AML with t(8;21)(q22;q22.1)/RUNX1::RUNX1T1',
  'AML with inv(16)(p13.1q22) or t(16;16)(p13.1;q22)/CBFB::MYH11',
  'AML with in-frame bZIP mutated CEBPA',
  'AML with t(9;22)(q34.1;q11.2)/BCR::ABL1',
  'AML with t(6;9)(p22.3;q34.1)/DEK::NUP214',
  'AML with inv(3)(q21.3q26.2) or t(3;3)(q21.3;q26.2)/GATA2, MECOM(EVI1)',
  'AML with myelodysplasia related gene mutation',
  'AML with myelodysplasia related cytogenetic abnormality',
  'MDS/AML with mutated TP53',
  'MDS/AML, NOS',
  'AML, NOS',
];

// Extract unique locations from all trials
function extractLocations(trials) {
  const locs = new Set();
  trials.forEach(t => {
    if (t.sites && t.sites !== 'Multiple') {
      t.sites.split(',').forEach(s => {
        const trimmed = s.trim();
        if (trimmed) locs.add(trimmed);
      });
    }
  });
  return Array.from(locs).sort();
}

// Determine if a trial matches the selected genetic markers
// Logic: if a marker is checked and the trial REQUIRES that marker, it's a match.
// If a marker is checked and the trial EXCLUDES that marker, it's excluded.
// Trials with no genetic requirements (supportive care etc) always pass unless excluded.
function matchesGenetics(trial, selectedMarkers) {
  if (selectedMarkers.length === 0) return true;
  const genetics = trial.genetics || { required: [], excluded: [] };

  // If trial excludes any of the patient's markers, exclude it
  for (const marker of selectedMarkers) {
    if (genetics.excluded.includes(marker)) return false;
  }

  // If trial has no genetic requirements, it's open to all genotypes
  if (genetics.required.length === 0) return true;

  // If trial requires specific markers, at least one must match
  return genetics.required.some(r => selectedMarkers.includes(r));
}

function matchesIcc(trial, selectedIcc) {
  if (!selectedIcc) return true;
  const genetics = trial.genetics || { iccMatch: [] };

  // Trials with no ICC restrictions are open to all
  if (!genetics.iccMatch || genetics.iccMatch.length === 0) return true;

  return genetics.iccMatch.includes(selectedIcc);
}

function matchesLocation(trial, selectedLocation) {
  if (!selectedLocation) return true;
  if (trial.sites === 'Multiple') return true; // "Multiple" means many sites
  return trial.sites.toLowerCase().includes(selectedLocation.toLowerCase());
}

export default function ClinicalTrialsPage() {
  const [trials, setTrials] = useState(fallbackTrials);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced filters
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [selectedIcc, setSelectedIcc] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  const categories = useMemo(() => {
    return ['All', ...new Set(trials.map(t => t.category))];
  }, [trials]);

  const locations = useMemo(() => extractLocations(trials), [trials]);

  const filtered = useMemo(() => {
    return trials.filter(trial => {
      if (categoryFilter !== 'All' && trial.category !== categoryFilter) return false;
      if (!matchesGenetics(trial, selectedMarkers)) return false;
      if (!matchesIcc(trial, selectedIcc)) return false;
      if (!matchesLocation(trial, selectedLocation)) return false;

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
  }, [trials, search, categoryFilter, selectedMarkers, selectedIcc, selectedLocation]);

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

  const activeFilterCount = selectedMarkers.length + (selectedIcc ? 1 : 0) + (selectedLocation ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedMarkers([]);
    setSelectedIcc('');
    setSelectedLocation('');
    setCategoryFilter('All');
    setSearch('');
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Clinical Trials</h1>
        <p>Browse open clinical trials in AML, MDS, and related haematological malignancies across the UK.</p>
      </section>

      <section className={styles.controls}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by trial name, description, site, or criteria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">&times;</button>
          )}
        </div>

        {/* Category pills */}
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

        {/* Toggle advanced filters */}
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

        {/* Advanced filter panel */}
        {showFilters && (
          <div className={styles.advancedPanel}>
            {/* Genetic markers */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Genetic Markers</h3>
              <p className={styles.filterGroupHint}>Select markers present in the patient to find eligible trials</p>
              <div className={styles.checkboxGrid}>
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

            {/* ICC Classification */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>ICC Classification</h3>
              <select
                value={selectedIcc}
                onChange={e => setSelectedIcc(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Any classification</option>
                {ICC_CLASSIFICATIONS.map(icc => (
                  <option key={icc} value={icc}>{icc}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Location</h3>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Any location</option>
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
          </div>
        )}
      </section>

      <section className={styles.results}>
        <p className={styles.resultCount}>
          {loading ? 'Loading...' : `${filtered.length} trial${filtered.length !== 1 ? 's' : ''} found`}
          {activeFilterCount > 0 && !loading && (
            <span className={styles.filterNote}> (filtered by {activeFilterCount} patient criteria)</span>
          )}
        </p>

        <div className={styles.trialList}>
          {filtered.map(trial => {
            const isExpanded = expandedTrial === trial.id;
            const genetics = trial.genetics || { required: [], excluded: [] };
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
                    <span className={styles.siteBadge}>{trial.sites}</span>
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

                  {/* Genetic marker tags */}
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
  );
}
