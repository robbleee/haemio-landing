'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

const SCREENSHOTS = [
  { src: '/new-screenshots-for-landing/diagnostic-path.png', label: 'Diagnostic Pathway', alt: 'ICC 2022 AML Execution Path showing the full diagnostic decision tree' },
  { src: '/new-screenshots-for-landing/classification-result.png', label: 'Classification', alt: 'WHO 2022 and ICC 2022 classification results with clinical reasoning traces' },
  { src: '/new-screenshots-for-landing/data-entry.png', label: 'Report Upload', alt: 'Patient report upload with AI-powered analysis and data extraction' },
  { src: '/new-screenshots-for-landing/data-inspector.png', label: 'Data Inspector', alt: 'Input data summary showing parsed mutations, cytogenetics, and clinical parameters' },
  { src: '/new-screenshots-for-landing/Risk-calculator.png', label: 'Risk', alt: 'ELN 2022 and 2024 risk stratification with median survival estimates' },
  { src: '/new-screenshots-for-landing/clinical-trials.png', label: 'Trial Matching', alt: 'Clinical trial matching with eligibility scores and confidence levels' },
];

export default function HeroSection() {
  const [activeShot, setActiveShot] = useState(0);

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

          {/* Right — real screenshot */}
          <div className={styles.visualColumn}>
            <div className={styles.screenshotCard}>
              <Image
                src={SCREENSHOTS[activeShot].src}
                alt={SCREENSHOTS[activeShot].alt}
                width={900}
                height={560}
                className={styles.screenshotImg}
                priority
              />
            </div>
            {/* Screenshot selector tabs */}
            <div className={styles.shotTabs}>
              {SCREENSHOTS.map((s, i) => (
                <button
                  key={s.label}
                  className={`${styles.shotTab} ${i === activeShot ? styles.shotTabActive : ''}`}
                  onClick={() => setActiveShot(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className={styles.cardGlow} />
          </div>
        </div>
      </div>
    </section>
  );
}
