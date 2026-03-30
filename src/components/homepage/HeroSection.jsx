'use client';

import Link from 'next/link';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Background layers */}
      <div className={styles.gradientBg} />
      <div className={styles.gridPattern} />
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      <div className={styles.container}>
        <div className={styles.splitLayout}>
          {/* Left — copy */}
          <div className={styles.copyColumn}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Clinical-grade AI for haematology
            </div>

            <h1 className={styles.title}>
              <span className={styles.titleLine}>Classify AML &amp; MDS</span>
              <span className={styles.titleAccent}>in minutes, not hours</span>
            </h1>

            <p className={styles.subtitle}>
              Explainable diagnostic intelligence aligned to WHO&nbsp;2022, ICC&nbsp;2022 and ELN risk stratification — built for the genomic era.
            </p>

            <div className={styles.ctaGroup}>
              <Link href="/interactive-classifier" className={styles.ctaPrimary}>
                Try the Classifier
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href="#demo" className={styles.ctaSecondary}>
                Watch demo
              </Link>
            </div>

            <div className={styles.badges}>
              <div className={styles.badge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                100% Gene Accuracy
              </div>
              <div className={styles.badge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                WHO + ICC 2022
              </div>
              <div className={styles.badge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                </svg>
                ELN Risk Aligned
              </div>
            </div>
          </div>

          {/* Right — diagnostic card visual */}
          <div className={styles.visualColumn}>
            <div className={styles.diagnosticCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardDots}>
                  <span /><span /><span />
                </div>
                <span className={styles.cardLabel}>Haem.io Classifier</span>
              </div>

              <div className={styles.cardBody}>
                {/* Input section */}
                <div className={styles.cardSection}>
                  <span className={styles.cardSectionLabel}>Input</span>
                  <div className={styles.inputRow}>
                    <span className={styles.inputKey}>Blast %</span>
                    <span className={styles.inputVal}>42%</span>
                  </div>
                  <div className={styles.inputRow}>
                    <span className={styles.inputKey}>Cytogenetics</span>
                    <span className={styles.inputVal}>t(8;21)(q22;q22)</span>
                  </div>
                  <div className={styles.inputRow}>
                    <span className={styles.inputKey}>Mutations</span>
                    <span className={styles.inputVal}>KIT D816V</span>
                  </div>
                </div>

                {/* Divider with animation */}
                <div className={styles.processingBar}>
                  <div className={styles.processingFill} />
                </div>

                {/* Output section */}
                <div className={styles.cardSection}>
                  <span className={styles.cardSectionLabel}>Classification</span>
                  <div className={styles.resultRow}>
                    <span className={styles.resultIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </span>
                    <div>
                      <div className={styles.resultLabel}>WHO 2022</div>
                      <div className={styles.resultValue}>AML with t(8;21)(q22;q22.1)</div>
                    </div>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </span>
                    <div>
                      <div className={styles.resultLabel}>ELN 2022 Risk</div>
                      <div className={styles.resultRisk}>Favourable</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow behind card */}
            <div className={styles.cardGlow} />
          </div>
        </div>
      </div>
    </section>
  );
}
