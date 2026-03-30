'use client';

import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import styles from './ConferenceAIPage.module.css';

const features = [
  {
    title: 'Slide + Transcript Capture',
    description: 'Records every slide image alongside synchronised speaker audio transcript in real time.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    delay: 0,
  },
  {
    title: 'Claude AI Analysis',
    description: 'Powered by Anthropic Claude to produce accurate, context-aware clinical summaries.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
      </svg>
    ),
    delay: 0.1,
  },
  {
    title: 'Efficacy Data Extraction',
    description: 'Automatically identifies and structures key efficacy endpoints from presentations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    delay: 0.2,
  },
  {
    title: 'Safety Signal Detection',
    description: 'Highlights adverse events, dose modifications, and safety-related findings.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    delay: 0.3,
  },
  {
    title: 'Batch Capture Mode',
    description: 'Queue multiple sessions for unattended capture and processing overnight.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    delay: 0.4,
  },
  {
    title: 'Cost Tracking',
    description: 'Transparent reporting of AI processing costs per session and in aggregate.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    delay: 0.5,
  },
];

const steps = [
  { num: '01', title: 'Install', desc: 'Add the Chrome extension to your browser.' },
  { num: '02', title: 'Navigate', desc: 'Open any session on the virtual conference platform.' },
  { num: '03', title: 'Capture', desc: 'Extension records slides and transcript live.' },
  { num: '04', title: 'Summarise', desc: 'Claude AI generates a structured clinical summary.' },
];

export default function ConferenceAIPage() {
  const [howRef, howVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [featRef, featVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div className={styles.page}>
      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className={styles.heroGrain} />
        <div className={styles.heroGlow} />

        <div className={styles.container}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Product
          </div>

          <h1 className={styles.heroTitle}>
            ConferenceAI
          </h1>

          <p className={styles.heroSub}>
            AI-powered capture and analysis of haematology conference presentations.
            Slides, transcripts, efficacy data, and safety signals — structured in minutes.
          </p>

          <div className={styles.heroActions}>
            <a
              href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              Open Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </a>
            <a href="#how-it-works" className={styles.btnGhost}>
              How it works
            </a>
          </div>

          {/* Conferences strip */}
          <div className={styles.confStrip}>
            {['EBMT', 'ASH', 'EHA'].map((c) => (
              <span key={c} className={styles.confChip}>{c}</span>
            ))}
          </div>
        </div>

        {/* Demo card */}
        <div className={styles.container}>
          <div className={styles.demoCard}>
            <div className={styles.demoHeader}>
              <div className={styles.demoDots}><span /><span /><span /></div>
              <span className={styles.demoLabel}>ConferenceAI</span>
              <span className={styles.demoStatus}>
                <span className={styles.statusDot} />
                Processing
              </span>
            </div>
            <div className={styles.demoBody}>
              <div className={styles.demoCol}>
                <div className={styles.demoColHead}>Input</div>
                <div className={styles.demoRow}><span>Conference</span><span>EBMT 2025</span></div>
                <div className={styles.demoRow}><span>Session</span><span>OS-14-03</span></div>
                <div className={styles.demoRow}><span>Slides</span><span>24 captured</span></div>
                <div className={styles.demoRow}><span>Duration</span><span>18 min</span></div>
              </div>
              <div className={styles.demoDivider} />
              <div className={styles.demoCol}>
                <div className={styles.demoColHead}>Output</div>
                <div className={styles.demoResult}>
                  <span className={styles.demoResultLabel}>Efficacy</span>
                  <span className={styles.demoResultVal}>ORR 78% (CR 42%)</span>
                </div>
                <div className={styles.demoResult}>
                  <span className={styles.demoResultLabel}>Safety</span>
                  <span className={styles.demoResultValGreen}>3 signals flagged</span>
                </div>
                <div className={styles.demoResult}>
                  <span className={styles.demoResultLabel}>Key Finding</span>
                  <span className={styles.demoResultVal}>MRD-neg CR at 12mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className={styles.howSection} id="how-it-works" ref={howRef}>
        <div className={styles.container}>
          <div className={`${styles.secHeader} ${howVisible ? styles.secHeaderVisible : ''}`}>
            <h2 className={styles.secTitle}>How It Works</h2>
          </div>

          <div className={styles.stepsRow}>
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`${styles.step} ${howVisible ? styles.stepVisible : ''}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <span className={styles.stepNum}>{s.num}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className={styles.featSection} ref={featRef}>
        <div className={styles.container}>
          <div className={`${styles.secHeader} ${featVisible ? styles.secHeaderVisible : ''}`}>
            <h2 className={styles.secTitle}>Capabilities</h2>
          </div>

          <div className={styles.featGrid}>
            {features.map((f) => (
              <div
                key={f.title}
                className={`${styles.featCard} ${featVisible ? styles.featCardVisible : ''}`}
                style={{ animationDelay: `${f.delay}s` }}
              >
                <div className={styles.featIcon}>{f.icon}</div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Analytics Tools teaser ---- */}
      <section className={styles.toolsSection} id="tools">
        <div className={styles.container}>
          <div className={styles.secHeader} style={{ opacity: 1, transform: 'none' }}>
            <h2 className={styles.secTitle}>AI Analytics Tools</h2>
            <p className={styles.toolsSubtitle}>
              Abstract analyser, session comparator, and clinical Q&A — powered by Claude AI.
            </p>
          </div>
          <div className={styles.toolsCards}>
            <div className={styles.toolCard}>
              <div className={styles.featIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
              <h3 className={styles.featTitle}>Abstract Analyser</h3>
              <p className={styles.featDesc}>Paste any abstract and extract structured efficacy data, safety signals, and key findings.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.featIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19V6l-6 6M15 5v13l6-6" />
                </svg>
              </div>
              <h3 className={styles.featTitle}>Session Comparator</h3>
              <p className={styles.featDesc}>Compare two abstracts side-by-side with structured endpoint and outcome analysis.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.featIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className={styles.featTitle}>Clinical Q&A</h3>
              <p className={styles.featDesc}>Ask questions about session content and get AI-powered answers with data citations.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a
              href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/intelligence/tools"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              Try the Tools
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.container}>
          <div className={`${styles.ctaInner} ${ctaVisible ? styles.ctaInnerVisible : ''}`}>
            <h2 className={styles.ctaTitle}>Start capturing conference intelligence</h2>
            <p className={styles.ctaText}>
              Access the dashboard to view captured sessions and AI-generated clinical summaries.
            </p>
            <a
              href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              Open Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
