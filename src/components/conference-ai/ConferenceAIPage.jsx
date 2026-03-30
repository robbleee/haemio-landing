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
    span: 'wide',
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
    span: 'normal',
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
    span: 'normal',
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
    span: 'normal',
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
    span: 'normal',
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
    span: 'wide',
  },
];

const steps = [
  {
    step: '1',
    title: 'Install Extension',
    desc: 'Add the ConferenceAI Chrome extension to your browser in one click.',
  },
  {
    step: '2',
    title: 'Navigate to Session',
    desc: 'Open any presentation on the virtual conference platform — EBMT, ASH, or EHA.',
  },
  {
    step: '3',
    title: 'Click Capture',
    desc: 'The extension records every slide and transcript as the session plays live.',
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
  const [howRef, howVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [featRef, featVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [confRef, confVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div>
      {/* ---- Hero — centred with floating card below ---- */}
      <section className={styles.hero}>
        <div className={styles.gradientBg} />
        <div className={styles.gridPattern} />
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />

        <div className={styles.container}>
          <div className={styles.heroCentre}>
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

          {/* Floating capture card — overlaps into next section */}
          <div className={styles.heroCardWrapper}>
            <div className={styles.captureCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardDots}>
                  <span /><span /><span />
                </div>
                <span className={styles.cardLabel}>ConferenceAI Capture</span>
              </div>

              <div className={styles.cardColumns}>
                {/* Left: input */}
                <div className={styles.cardCol}>
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

                {/* Divider */}
                <div className={styles.cardDivider}>
                  <div className={styles.processingLine}>
                    <div className={styles.processingFill} />
                  </div>
                </div>

                {/* Right: output */}
                <div className={styles.cardCol}>
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
                  <div className={styles.resultRow}>
                    <span className={styles.resultIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                      </svg>
                    </span>
                    <div>
                      <div className={styles.resultLabel}>Key Finding</div>
                      <div className={styles.resultValue}>MRD-neg CR at 12mo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.cardGlow} />
          </div>
        </div>
      </section>

      {/* ---- How It Works — vertical timeline ---- */}
      <section className={styles.howSection} id="how-it-works" ref={howRef}>
        <div className={styles.howBgOrb} />
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${howVisible ? styles.visible : ''}`}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Four steps from conference session to clinical insight.
            </p>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineLine} />
            {steps.map((item, i) => (
              <div
                key={item.step}
                className={`${styles.timelineItem} ${i % 2 === 1 ? styles.timelineRight : ''} ${howVisible ? styles.timelineItemVisible : ''}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className={styles.timelineDot}>{item.step}</div>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineCardGlow} />
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features — bento grid ---- */}
      <section className={styles.featuresSection} ref={featRef}>
        <div className={styles.featuresBgOrb} />
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${featVisible ? styles.visible : ''}`}>
            <h2 className={styles.sectionTitle}>Key Features</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to capture, analyse, and act on conference data.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${styles.bentoCard} ${feature.span === 'wide' ? styles.bentoWide : ''} ${featVisible ? styles.bentoCardVisible : ''}`}
                style={{ animationDelay: `${feature.delay}s` }}
              >
                <div className={styles.bentoCardGlow} />
                <div
                  className={`${styles.bentoIcon} ${featVisible ? styles.bentoIconFloat : ''}`}
                  style={{ animationDelay: `${feature.delay + 0.8}s` }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className={styles.bentoTitle}>{feature.title}</h3>
                  <p className={styles.bentoDesc}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Supported Conferences — accent bar cards ---- */}
      <section className={styles.conferencesSection} ref={confRef}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${confVisible ? styles.visible : ''}`}>
            <h2 className={styles.sectionTitle}>Supported Conferences</h2>
            <p className={styles.sectionSubtitle}>
              Capture and analyse sessions from the world&apos;s leading haematology meetings.
            </p>
          </div>

          <div className={styles.confStack}>
            {conferences.map((conf, i) => (
              <div
                key={conf.abbr}
                className={`${styles.confCard} ${confVisible ? styles.confCardVisible : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={styles.confAccent} />
                <div className={styles.confBadge}>{conf.abbr}</div>
                <div className={styles.confContent}>
                  <h3 className={styles.confName}>{conf.name}</h3>
                  <p className={styles.confDesc}>{conf.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA — gradient banner ---- */}
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.container}>
          <div className={`${styles.ctaBanner} ${ctaVisible ? styles.visible : ''}`}>
            <div className={styles.ctaBannerOrb1} />
            <div className={styles.ctaBannerOrb2} />
            <div className={styles.ctaBannerContent}>
              <h2 className={styles.ctaTitle}>Ready to streamline your conference coverage?</h2>
              <p className={styles.ctaText}>
                Access the ConferenceAI dashboard to view captured sessions and AI-generated clinical summaries.
              </p>
              <div className={styles.ctaButtons}>
                <a
                  href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaBannerBtn}
                >
                  Access Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                <a href="#how-it-works" className={styles.ctaBannerBtnSecondary}>
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
