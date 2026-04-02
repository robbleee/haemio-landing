'use client';

import { useState, useEffect, useMemo } from 'react';
import fallbackTrials from '../../data/clinical-trials.json';
import styles from './clinical-trials.module.css';

export default function ClinicalTrialsPage() {
  const [trials, setTrials] = useState(fallbackTrials);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clinical-trials')
      .then(res => res.json())
      .then(data => {
        if (data.trials && data.trials.length > 0) {
          setTrials(data.trials);
        }
      })
      .catch(() => {
        // fallback already set
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    return ['All', ...new Set(trials.map(t => t.category))];
  }, [trials]);

  const filtered = useMemo(() => {
    return trials.filter(trial => {
      const matchesCategory = categoryFilter === 'All' || trial.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        trial.name.toLowerCase().includes(q) ||
        (trial.description || '').toLowerCase().includes(q) ||
        (trial.sites || '').toLowerCase().includes(q) ||
        (trial.inclusionCriteria || []).some(c => c.toLowerCase().includes(q)) ||
        (trial.exclusionCriteria || []).some(c => c.toLowerCase().includes(q))
      );
    });
  }, [trials, search, categoryFilter]);

  const counts = useMemo(() => {
    const map = { All: trials.length };
    trials.forEach(t => { map[t.category] = (map[t.category] || 0) + 1; });
    return map;
  }, [trials]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Clinical Trials</h1>
        <p>Browse open clinical trials in AML, MDS, and related haematological malignancies across the UK.</p>
      </section>

      <section className={styles.controls}>
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
      </section>

      <section className={styles.results}>
        <p className={styles.resultCount}>
          {loading ? 'Loading...' : `${filtered.length} trial${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        <div className={styles.trialList}>
          {filtered.map(trial => {
            const isExpanded = expandedTrial === trial.id;
            return (
              <div key={trial.id} className={styles.trialCard}>
                <div className={styles.trialHeader} onClick={() => setExpandedTrial(isExpanded ? null : trial.id)}>
                  <div className={styles.trialMeta}>
                    <span className={`${styles.categoryBadge} ${styles[`cat${trial.category.replace(/[^a-zA-Z]/g, '')}`]}`}>
                      {trial.category}
                    </span>
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
              <p>No trials match your search. Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
