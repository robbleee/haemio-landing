'use client';

import Image from 'next/image';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import styles from './ProductWalkthrough.module.css';

const sections = [
  {
    id: 'upload',
    step: '01',
    title: 'Upload a report, or enter data manually',
    description: 'Drag and drop a haematology report (morphology, molecular, cytogenetics) and Haem.io\'s AI extracts every relevant finding — mutations, VAF, cytogenetic abnormalities, blast percentage, and clinical qualifiers. Or enter data manually if you prefer.',
    points: [
      'Parses free-text reports from any lab format',
      'Detects mutations with variant allele frequency',
      'Identifies cytogenetic abnormalities and karyotype',
      'Extracts blast counts, flow markers, and clinical context',
    ],
    image: '/new-screenshots-for-landing/data-entry.png',
    alt: 'Report upload interface showing AI-powered extraction from a TP53 case report',
    align: 'right',
  },
  {
    id: 'inspect',
    step: '02',
    title: 'Review the structured data',
    description: 'Every parsed value is displayed in a structured summary alongside the original report text. Check what the AI extracted, correct anything, and confirm before classification. Nothing is a black box.',
    points: [
      'Side-by-side view: parsed data vs original report',
      'Genetic mutations with classification significance flags',
      'TP53 allelic status detection (LOH, del17p, multi-hit)',
      'Cytogenetic complexity and MDS-related abnormalities identified',
    ],
    image: '/new-screenshots-for-landing/data-inspector.png',
    alt: 'Data inspector showing parsed mutations (TP53, DNMT3A, TET2, ASXL1), cytogenetics, and original report',
    align: 'left',
  },
  {
    id: 'classify',
    step: '03',
    title: 'See the full diagnostic pathway',
    description: 'Haem.io runs the patient data through every decision node in the WHO 2022 and ICC 2022 classification trees. The result isn\'t just a label — it\'s the complete execution path showing exactly which rules fired and why.',
    points: [
      'Full decision tree visualisation for WHO and ICC',
      'Every branch point shown: which passed, which failed',
      'Traceable reasoning — no hidden logic',
      'Dual classification: WHO 2022 5th Edition + ICC 2022',
    ],
    image: '/new-screenshots-for-landing/diagnostic-path.png',
    alt: 'ICC 2022 AML Execution Path showing the complete diagnostic decision tree with highlighted route',
    align: 'right',
  },
  {
    id: 'result',
    step: '04',
    title: 'Dual-framework classification with full reasoning',
    description: 'Haem.io produces both WHO 2022 and ICC 2022 classifications side by side. Each result includes the complete clinical reasoning chain — every rule evaluated, every decision explained. Click "Trace" to see the exact derivation path.',
    points: [
      'WHO 2022 5th Edition and ICC 2022 results side by side',
      'Clinical reasoning steps numbered and explained',
      'Final pathway derivation from blast percentage to genetic findings',
      'TP53 multi-hit evaluation with allelic status logic',
    ],
    image: '/new-screenshots-for-landing/classification-result.png',
    alt: 'Classification results showing WHO 2022 and ICC 2022 with clinical reasoning traces',
    align: 'left',
  },
  {
    id: 'risk',
    step: '05',
    title: 'Risk stratification and clinical decision support',
    description: 'Once classified, Haem.io calculates risk using ELN 2022 (intensive) and ELN 2024 (non-intensive) frameworks. Each risk category includes median survival estimates and the full calculation chain so clinicians can verify every step.',
    points: [
      'ELN 2022 intensive and ELN 2024 non-intensive risk',
      'Median overall survival estimates',
      'Calculation steps visible and auditable',
    ],
    image: '/new-screenshots-for-landing/Risk-calculator.png',
    alt: 'Risk stratification showing ELN 2022 Adverse and ELN 2024 Adverse with median survival',
    align: 'left',
  },
  {
    id: 'trials',
    step: '06',
    title: 'Automatic clinical trial matching',
    description: 'Based on the classification, genetics, and patient profile, Haem.io automatically identifies eligible clinical trials. Each match includes a confidence score, eligibility status, and what additional data is needed to confirm suitability.',
    points: [
      'Matches against curated UK trial database',
      'Confidence scoring (high, needs data, ineligible)',
      'Shows what extra information would refine the match',
      'Direct links to trial registries and contact details',
    ],
    image: '/new-screenshots-for-landing/clinical-trials.png',
    alt: 'Clinical trial matching showing eligible trials with confidence scores',
    align: 'right',
  },
];

export default function ProductWalkthrough() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>See Inside the Platform</h2>
          <p className={styles.sectionSubtitle}>
            From report upload to trial matching — every step is transparent, traceable, and clinician-verifiable.
          </p>
        </div>

        {sections.map((s) => (
          <WalkthroughRow key={s.id} {...s} />
        ))}
      </div>
    </section>
  );
}

function WalkthroughRow({ step, title, description, points, image, alt, align }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`${styles.row} ${styles[`align${align}`]} ${isVisible ? styles.rowVisible : ''}`}
    >
      <div className={styles.textCol}>
        <span className={styles.stepNum}>{step}</span>
        <h3 className={styles.rowTitle}>{title}</h3>
        <p className={styles.rowDesc}>{description}</p>
        <ul className={styles.pointsList}>
          {points.map((p, i) => (
            <li key={i}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.imageCol}>
        <Image
          src={image}
          alt={alt}
          width={700}
          height={440}
          className={styles.screenshot}
        />
      </div>
    </div>
  );
}
