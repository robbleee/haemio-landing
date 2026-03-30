'use client';

import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import styles from './ConferenceAIPage.module.css';

const features = [
  {
    title: 'Slide + Transcript Capture',
    description: 'Records every slide image alongside synchronised speaker audio transcript in real time.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    delay: 0,
  },
  {
    title: 'Claude AI Analysis',
    description: 'Powered by Anthropic Claude to produce accurate, context-aware clinical summaries.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
      </svg>
    ),
    delay: 0.15,
  },
  {
    title: 'Efficacy Data Extraction',
    description: 'Automatically identifies and structures key efficacy endpoints from presentations.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    delay: 0.3,
  },
  {
    title: 'Safety Signal Detection',
    description: 'Highlights adverse events, dose modifications, and safety-related findings automatically.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    delay: 0.45,
  },
  {
    title: 'Batch Capture Mode',
    description: 'Queue multiple sessions for unattended capture and processing overnight.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    delay: 0.6,
  },
  {
    title: 'Token Cost Tracking',
    description: 'Transparent reporting of AI processing costs per session and in aggregate.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    delay: 0.75,
  },
];

const steps = [
  {
    step: '1',
    title: 'Install Extension',
    desc: 'Add the ConferenceAI Chrome extension to your browser.',
  },
  {
    step: '2',
    title: 'Navigate to Session',
    desc: 'Open any presentation on the virtual conference platform.',
  },
  {
    step: '3',
    title: 'Click Capture',
    desc: 'The extension records slides and transcript as the session plays.',
  },
  {
    step: '4',
    title: 'AI Summary',
    desc: 'Claude AI generates a structured clinical summary with efficacy and safety data.',
  },
];

const conferences = [
  {
    abbr: 'EBMT',
    name: 'European Society for Blood and Marrow Transplantation',
    desc: 'Stem cell transplantation, cellular therapy, and gene therapy research.',
  },
  {
    abbr: 'ASH',
    name: 'American Society of Hematology',
    desc: 'The largest annual haematology meeting with 30,000+ attendees worldwide.',
  },
  {
    abbr: 'EHA',
    name: 'European Hematology Association',
    desc: 'Cutting-edge European haematology research and clinical practice.',
  },
];

export default function ConferenceAIPage() {
  const [descRef, descVisible] = useIntersectionObserver({ threshold: 0.15 });
  const [howRef, howVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [featRef, featVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [confRef, confVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div>
      {/* ---- Hero ---- */}
      <section className={styles.hero}>
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
                Haem.io Product
              </div>

              <h1 className={styles.title}>
                <span className={styles.titleLine}>Conference capture</span>
                <span className={styles.titleAccent}>powered by AI</span>
              </h1>

              <p className={styles.subtitle}>
                Turn hours of conference slides and speaker audio into structured clinical
                summaries in minutes. Built for medical affairs and clinical teams.
              </p>

              <div className={styles.ctaGroup}>
                <a
                  href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaPrimary}
                >
                  Access Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                <a href="#how-it-works" className={styles.ctaSecondary}>
                  How it works
                </a>
              </div>

              <div className={styles.badges}>
                <div className={styles.badge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  EBMT, ASH, EHA
                </div>
                <div className={styles.badge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6" />
                  </svg>
                  Claude AI Powered
                </div>
                <div className={styles.badge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Batch Capture
                </div>
              </div>
            </div>

            {/* Right — capture card visual */}
            <div className={styles.visualColumn}>
              <div className={styles.captureCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardDots}>
                    <span /><span /><span />
                  </div>
                  <span className={styles.cardLabel}>ConferenceAI Capture</span>
                </div>

                <div className={styles.cardBody}>
                  {/* Input section */}
                  <div className={styles.cardSection}>
                    <span className={styles.cardSectionLabel}>Session Input</span>
                    <div className={styles.captureRow}>
                      <span className={styles.captureKey}>Conference</span>
                      <span className={styles.captureVal}>EBMT 2025</span>
                    </div>
                    <div className={styles.captureRow}>
                      <span className={styles.captureKey}>Session</span>
                      <span className={styles.captureVal}>OS-14-03</span>
                    </div>
                    <div className={styles.captureRow}>
                      <span className={styles.captureKey}>Slides</span>
                      <span className={styles.captureVal}>24 captured</span>
                    </div>
                    <div className={styles.captureRow}>
                      <span className={styles.captureKey}>Duration</span>
                      <span className={styles.captureVal}>18 min</span>
                    </div>
                  </div>

                  {/* Processing bar */}
                  <div className={styles.processingBar}>
                    <div className={styles.processingFill} />
                  </div>

                  {/* Output section */}
                  <div className={styles.cardSection}>
                    <span className={styles.cardSectionLabel}>AI Summary</span>
                    <div className={styles.resultRow}>
                      <span className={styles.resultIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </span>
                      <div>
                        <div className={styles.resultLabel}>Efficacy</div>
                        <div className={styles.resultValue}>ORR 78% (CR 42%)</div>
                      </div>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </span>
                      <div>
                        <div className={styles.resultLabel}>Safety</div>
                        <div className={styles.resultHighlight}>3 signals flagged</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardGlow} />
            </div>
          </div>
        </div>
      </section>

      {/* ---- Description ---- */}
      <section className={styles.descSection} ref={descRef}>
        <div className={styles.descBgOrb} />
        <div className={styles.container}>
          <div className={`${styles.descContent} ${descVisible ? styles.visible : ''}`}>
            <h2 className={styles.descTitle}>Clinical Intelligence from Every Session</h2>
            <p className={styles.descText}>
              ConferenceAI captures presentations from major haematology conferences
              — EBMT, ASH, and EHA — and uses AI to extract clinical highlights,
              efficacy data, and safety signals. The result is a structured, searchable
              knowledge base that keeps your medical affairs and clinical teams current
              without hours of manual note-taking.
            </p>
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className={styles.howSection} id="how-it-works" ref={howRef}>
        <div className={styles.howBgOrb} />
        <div className={styles.container}>
          <div className={`${styles.howHeader} ${howVisible ? styles.visible : ''}`}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Four steps from conference session to clinical insight.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((item) => (
              <div
                key={item.step}
                className={`${styles.stepCard} ${howVisible ? styles.stepCardVisible : ''}`}
                style={{ animationDelay: `${(parseInt(item.step) - 1) * 0.15}s` }}
              >
                <div className={styles.stepCardGlow} />
                <div className={styles.stepNumber}>{item.step}</div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className={styles.featuresSection} ref={featRef}>
        <div className={styles.featuresBgOrb} />
        <div className={styles.container}>
          <div className={`${styles.featuresHeader} ${featVisible ? styles.visible : ''}`}>
            <h2 className={styles.sectionTitle}>Key Features</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to capture, analyse, and act on conference data.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${styles.featureCard} ${featVisible ? styles.featureCardVisible : ''}`}
                style={{ animationDelay: `${feature.delay}s` }}
              >
                <div className={styles.featureCardGlow} />
                <div
                  className={`${styles.featureIconContainer} ${featVisible ? styles.featureIconFloat : ''}`}
                  style={{ animationDelay: `${feature.delay + 0.8}s` }}
                >
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Supported Conferences ---- */}
      <section className={styles.conferencesSection} ref={confRef}>
        <div className={styles.container}>
          <div className={`${styles.confHeader} ${confVisible ? styles.visible : ''}`}>
            <h2 className={styles.sectionTitle}>Supported Conferences</h2>
            <p className={styles.sectionSubtitle}>
              Capture and analyse sessions from the world&apos;s leading haematology meetings.
            </p>
          </div>

          <div className={styles.confGrid}>
            {conferences.map((conf, i) => (
              <div
                key={conf.abbr}
                className={`${styles.confCard} ${confVisible ? styles.confCardVisible : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={styles.confCardGlow} />
                <div className={styles.confBadge}>{conf.abbr}</div>
                <h3 className={styles.confName}>{conf.name}</h3>
                <p className={styles.confDesc}>{conf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.ctaBgOrb} />
        <div className={styles.container}>
          <div className={`${styles.ctaContent} ${ctaVisible ? styles.visible : ''}`}>
            <h2 className={styles.ctaTitle}>Ready to streamline your conference coverage?</h2>
            <p className={styles.ctaText}>
              Access the ConferenceAI dashboard to view captured sessions and AI-generated clinical summaries.
            </p>
            <div className={styles.ctaButtons}>
              <a
                href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                Access Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <a href="#how-it-works" className={styles.ctaSecondary}>
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
