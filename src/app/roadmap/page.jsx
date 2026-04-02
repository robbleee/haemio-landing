'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './roadmap.module.css';

/* ──────────────────────────────────────────────
   Disease data – the single source of truth
   ────────────────────────────────────────────── */

const diseases = [
  // ── Completed ──
  {
    id: 'aml',
    abbrev: 'AML',
    name: 'Acute Myeloid Leukaemia',
    desc: 'WHO 2022 & ICC 2022 dual-framework classification with ELN 2022/2024 risk stratification and clinical trial matching.',
    phase: 'completed',
    date: '2024',
    tier: 'leukaemia',
    features: ['WHO 2022 Classification', 'ICC 2022 Classification', 'ELN 2022 + 2024 Risk', 'Clinical Trial Matching'],
  },
  {
    id: 'mds',
    abbrev: 'MDS',
    name: 'Myelodysplastic Syndromes',
    desc: 'Full WHO 2022 & ICC 2022 classification with IPSS-R risk scoring and morphology integration.',
    phase: 'completed',
    date: '2024',
    tier: 'leukaemia',
    features: ['WHO 2022 Classification', 'ICC 2022 Classification', 'IPSS-R Scoring', 'Morphology Integration'],
  },

  // ── In Progress ──
  {
    id: 'cll',
    abbrev: 'CLL',
    name: 'Chronic Lymphocytic Leukaemia',
    desc: 'B-cell chronic leukaemia with iwCLL staging, prognostic markers, and genetic risk stratification.',
    phase: 'building',
    date: 'Q2 2026',
    tier: 'leukaemia',
    features: ['iwCLL Staging', 'Prognostic Markers', 'Treatment Response', 'Genetic Risk Factors'],
  },

  // ── Planned — Leukaemia ──
  {
    id: 'all',
    abbrev: 'ALL',
    name: 'Acute Lymphoblastic Leukaemia',
    desc: 'Paediatric and adult ALL classification with risk stratification and MRD monitoring.',
    phase: 'planned',
    date: 'Q4 2026',
    tier: 'leukaemia',
    features: ['Paediatric ALL', 'Adult ALL', 'Genetic Subtypes', 'MRD Monitoring'],
  },
  {
    id: 'cmml',
    abbrev: 'CMML',
    name: 'Chronic Myelomonocytic Leukaemia',
    desc: 'MDS/MPN overlap neoplasm with CPSS scoring and transformation risk.',
    phase: 'planned',
    date: 'Q1 2027',
    tier: 'leukaemia',
    features: ['WHO Classification', 'CPSS Scoring', 'Molecular Markers', 'Transformation Risk'],
  },
  {
    id: 'cml',
    abbrev: 'CML',
    name: 'Chronic Myeloid Leukaemia',
    desc: 'BCR-ABL positive leukaemia with phase classification and response monitoring.',
    phase: 'planned',
    date: 'Q2 2027',
    tier: 'leukaemia',
    features: ['Phase Classification', 'BCR-ABL Monitoring', 'Resistance Mutations', 'Treatment Response'],
  },
  {
    id: 'hcl',
    abbrev: 'HCL',
    name: 'Hairy Cell Leukaemia',
    desc: 'Rare B-cell leukaemia with BRAF V600E detection and variant classification.',
    phase: 'planned',
    date: 'Q4 2029',
    tier: 'leukaemia',
    features: ['Classic HCL', 'HCL Variant', 'BRAF V600E', 'Treatment Response'],
  },

  // ── Planned — Lymphoma ──
  {
    id: 'dlbcl',
    abbrev: 'DLBCL',
    name: 'Diffuse Large B-Cell Lymphoma',
    desc: 'Aggressive B-cell lymphoma with COO classification and double/triple hit detection.',
    phase: 'planned',
    date: 'Q3 2027',
    tier: 'lymphoma',
    features: ['COO Classification', 'Double/Triple Hit', 'IPI Scoring', 'Molecular Subtypes'],
  },
  {
    id: 'fl',
    abbrev: 'FL',
    name: 'Follicular Lymphoma',
    desc: 'Indolent B-cell lymphoma with histologic grading and FLIPI risk assessment.',
    phase: 'planned',
    date: 'Q4 2027',
    tier: 'lymphoma',
    features: ['Histologic Grading', 'FLIPI Scoring', 'Transformation Risk', 'Molecular Markers'],
  },
  {
    id: 'hl',
    abbrev: 'HL',
    name: 'Hodgkin Lymphoma',
    desc: 'Classical and nodular lymphocyte-predominant Hodgkin lymphoma with staging.',
    phase: 'planned',
    date: 'Q1 2028',
    tier: 'lymphoma',
    features: ['Classical HL', 'NLPHL', 'Ann Arbor Staging', 'Response Assessment'],
  },
  {
    id: 'mcl',
    abbrev: 'MCL',
    name: 'Mantle Cell Lymphoma',
    desc: 'Aggressive B-cell lymphoma with MIPI scoring and TP53 status.',
    phase: 'planned',
    date: 'Q2 2028',
    tier: 'lymphoma',
    features: ['Morphologic Variants', 'MIPI Scoring', 'TP53 Status', 'Minimal Residual Disease'],
  },
  {
    id: 'mzl',
    abbrev: 'MZL',
    name: 'Marginal Zone Lymphomas',
    desc: 'MALT, nodal, and splenic marginal zone lymphomas.',
    phase: 'planned',
    date: 'Q3 2028',
    tier: 'lymphoma',
    features: ['MALT Lymphoma', 'Nodal MZL', 'Splenic MZL', 'Site-specific Features'],
  },
  {
    id: 'bl',
    abbrev: 'BL',
    name: 'Burkitt Lymphoma',
    desc: 'Highly aggressive B-cell lymphoma with MYC rearrangement confirmation.',
    phase: 'planned',
    date: 'Q4 2028',
    tier: 'lymphoma',
    features: ['Endemic/Sporadic/Immunodeficiency', 'MYC Rearrangements', 'Morphologic Features', 'Differential Diagnosis'],
  },
  {
    id: 'ptcl',
    abbrev: 'PTCL',
    name: 'Peripheral T-Cell Lymphomas',
    desc: 'Heterogeneous group of mature T-cell neoplasms including ALCL.',
    phase: 'planned',
    date: 'Q1 2029',
    tier: 'lymphoma',
    features: ['PTCL-NOS', 'Angioimmunoblastic', 'ALCL', 'NK/T-cell Lymphomas'],
  },
  {
    id: 'ctl',
    abbrev: 'CTL',
    name: 'Cutaneous Lymphomas',
    desc: 'Primary cutaneous B-cell and T-cell lymphomas including Mycosis Fungoides.',
    phase: 'planned',
    date: 'Q2 2029',
    tier: 'lymphoma',
    features: ['Mycosis Fungoides', 'Sezary Syndrome', 'Primary Cutaneous DLBCL', 'Staging Systems'],
  },

  // ── Planned — Other ──
  {
    id: 'pcd',
    abbrev: 'PCD',
    name: 'Plasma Cell Disorders',
    desc: 'Multiple myeloma, MGUS, and related plasma cell neoplasms with ISS staging.',
    phase: 'planned',
    date: 'Q3 2029',
    tier: 'other',
    features: ['Multiple Myeloma', 'MGUS Classification', 'ISS Staging', 'Prognostic Markers'],
  },
  {
    id: 'mpn',
    abbrev: 'MPN',
    name: 'Myeloproliferative Neoplasms',
    desc: 'BCR-ABL negative MPNs — polycythaemia vera, essential thrombocythaemia, primary myelofibrosis.',
    phase: 'planned',
    date: 'Q1 2030',
    tier: 'other',
    features: ['Polycythaemia Vera', 'Essential Thrombocythaemia', 'Primary Myelofibrosis', 'JAK2/CALR/MPL'],
  },
  {
    id: 'sm',
    abbrev: 'SM',
    name: 'Mastocytosis',
    desc: 'Clonal mast cell disorders with KIT D816V mutation detection.',
    phase: 'planned',
    date: 'Q2 2030',
    tier: 'other',
    features: ['Cutaneous Mastocytosis', 'Systemic Mastocytosis', 'KIT D816V', 'Prognostic Scoring'],
  },
  {
    id: 'bmf',
    abbrev: 'BMF',
    name: 'Bone Marrow Failure Syndromes',
    desc: 'Aplastic anaemia and inherited bone marrow failure syndromes.',
    phase: 'planned',
    date: 'Q3 2030',
    tier: 'other',
    features: ['Aplastic Anaemia', 'Fanconi Anaemia', 'Dyskeratosis Congenita', 'Telomere Disorders'],
  },
  {
    id: 'hd',
    abbrev: 'HD',
    name: 'Histiocytic Disorders',
    desc: 'Langerhans cell histiocytosis and Erdheim-Chester disease.',
    phase: 'planned',
    date: 'Q4 2030',
    tier: 'other',
    features: ['Langerhans Cell Histiocytosis', 'Erdheim-Chester Disease', 'Haemophagocytic Lymphohistiocytosis', 'BRAF/MAP2K1 Mutations'],
  },
];

const PHASES = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'building', label: 'In Progress' },
  { key: 'planned', label: 'Planned' },
];

const PHASE_META = {
  completed: { color: '#10b981', label: 'Completed', badgeClass: 'badgeCompleted', abbrevClass: 'cardAbbrevCompleted', cardClass: 'cardCompleted' },
  building:  { color: '#009688', label: 'In Progress', badgeClass: 'badgeInProgress', abbrevClass: 'cardAbbrevInProgress', cardClass: 'cardInProgress' },
  planned:   { color: '#cbd5e1', label: 'Planned', badgeClass: 'badgePlanned', abbrevClass: 'cardAbbrevPlanned', cardClass: 'cardPlanned' },
};

const TIER_LABELS = {
  leukaemia: 'Leukaemia & Myeloid',
  lymphoma: 'Lymphoma',
  other: 'Other Haematological',
};

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function RoadmapPage() {
  const [activePhase, setActivePhase] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [coverageAnimated, setCoverageAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCoverageAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const filtered = activePhase === 'all' ? diseases : diseases.filter(d => d.phase === activePhase);
  const completedCount = diseases.filter(d => d.phase === 'completed').length;
  const buildingCount = diseases.filter(d => d.phase === 'building').length;
  const totalCount = diseases.length;
  const coveragePct = Math.round(((completedCount + buildingCount * 0.5) / totalCount) * 100);

  // Group filtered diseases by tier
  const grouped = {};
  for (const d of filtered) {
    (grouped[d.tier] ??= []).push(d);
  }
  const tierOrder = ['leukaemia', 'lymphoma', 'other'];

  const toggleCard = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerBg} />
        <div className={styles.headerGrid} />

        <div className={styles.headerContent}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Platform Expansion
          </div>

          <h1 className={styles.title}>
            From AML & MDS to
            <span className={styles.titleAccent}>every blood cancer</span>
          </h1>

          <p className={styles.subtitle}>
            We solved the hardest classification problem first. Now the same AI extraction + deterministic logic framework scales across all of haematology.
          </p>

          {/* Coverage meter */}
          <div className={styles.coverageBar}>
            <span className={styles.coverageLabel}>Coverage</span>
            <div className={styles.coverageTrack}>
              <div
                className={styles.coverageFill}
                style={{ width: coverageAnimated ? `${coveragePct}%` : '0%' }}
              />
            </div>
            <span className={styles.coverageValue}>
              {completedCount}/{totalCount}
            </span>
          </div>

          {/* Phase filters */}
          <div className={styles.phaseNav}>
            {PHASES.map(p => (
              <button
                key={p.key}
                className={`${styles.phaseBtn} ${activePhase === p.key ? styles.phaseBtnActive : ''}`}
                onClick={() => setActivePhase(p.key)}
              >
                {p.label}
                {p.key !== 'all' && (
                  <> ({diseases.filter(d => p.key === 'all' || d.phase === p.key).length})</>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Thesis banner ── */}
      <div className={styles.thesisBanner}>
        <div className={styles.thesisCard}>
          <div className={styles.thesisStat}>
            <span className={styles.thesisNumber}>{totalCount}</span>
            <span className={styles.thesisLabel}>Disease classifiers planned</span>
            <span className={styles.thesisSublabel}>across all of haematology</span>
          </div>
          <div className={styles.thesisStat}>
            <span className={styles.thesisNumber}>1</span>
            <span className={styles.thesisLabel}>Core framework</span>
            <span className={styles.thesisSublabel}>AI extraction + logic engine</span>
          </div>
          <div className={styles.thesisStat}>
            <span className={styles.thesisNumber}>2030</span>
            <span className={styles.thesisLabel}>Full coverage target</span>
            <span className={styles.thesisSublabel}>systematic quarterly releases</span>
          </div>
        </div>
      </div>

      {/* ── Timeline cards ── */}
      <section className={styles.timelineSection}>
        {tierOrder.map(tier => {
          const items = grouped[tier];
          if (!items || items.length === 0) return null;

          return (
            <div key={tier} className={styles.phaseGroup}>
              {/* Tier header */}
              <div className={styles.phaseHeader}>
                <div
                  className={styles.phaseDot}
                  style={{ background: tier === 'leukaemia' ? '#009688' : tier === 'lymphoma' ? '#6366f1' : '#f59e0b' }}
                />
                <h2 className={styles.phaseTitle}>{TIER_LABELS[tier]}</h2>
                <div className={styles.phaseLine} />
                <span className={styles.phaseCount}>
                  {items.filter(i => i.phase === 'completed').length}/{items.length} complete
                </span>
              </div>

              {/* Cards */}
              <div className={styles.cardGrid}>
                {items.map(d => {
                  const meta = PHASE_META[d.phase];
                  const isExpanded = expandedId === d.id;

                  return (
                    <div
                      key={d.id}
                      className={`${styles.card} ${styles[meta.cardClass]}`}
                      onClick={() => toggleCard(d.id)}
                    >
                      <div className={styles.cardTop}>
                        <span className={`${styles.cardAbbrev} ${styles[meta.abbrevClass]}`}>
                          {d.abbrev}
                        </span>
                        <span className={`${styles.cardBadge} ${styles[meta.badgeClass]}`}>
                          {meta.label}
                        </span>
                      </div>

                      <h3 className={styles.cardName}>{d.name}</h3>
                      <p className={styles.cardDesc}>{d.desc}</p>

                      <div className={styles.cardFooter}>
                        <span className={styles.cardDate}>{d.date}</span>
                        <div className={styles.cardFeatures}>
                          {d.features.map((_, i) => (
                            <span
                              key={i}
                              className={`${styles.featureDot} ${d.phase === 'completed' ? styles.featureDotActive : ''}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Expandable detail */}
                      <div className={`${styles.cardDetail} ${isExpanded ? styles.cardDetailOpen : ''}`}>
                        <div className={styles.cardDetailInner}>
                          <ul className={styles.featureList}>
                            {d.features.map((f, i) => (
                              <li key={i} className={styles.featureItem}>
                                <span className={`${styles.featureCheck} ${d.phase === 'completed' ? styles.featureCheckCompleted : styles.featureCheckPending}`}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
