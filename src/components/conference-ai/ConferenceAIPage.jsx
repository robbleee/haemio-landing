'use client';

import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import styles from './ConferenceAIPage.module.css';

const features = [
  {
    title: 'Slide + Transcript Capture',
    description: 'Records every slide image alongside synchronised speaker audio transcript in real time.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  },
  {
    title: 'Claude AI Analysis',
    description: 'Powered by Anthropic Claude to produce accurate, context-aware clinical summaries.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" /></svg>,
  },
  {
    title: 'Efficacy Data Extraction',
    description: 'Automatically identifies and structures key efficacy endpoints from presentations.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  },
  {
    title: 'Safety Signal Detection',
    description: 'Highlights adverse events, dose modifications, and safety-related findings.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    title: 'Batch Capture Mode',
    description: 'Queue multiple sessions for unattended capture and processing overnight.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  },
  {
    title: 'Cost Tracking',
    description: 'Transparent reporting of AI processing costs per session and in aggregate.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  },
];

const steps = [
  { num: '1', title: 'Install', desc: 'Add the Chrome extension to your browser.' },
  { num: '2', title: 'Navigate', desc: 'Open any session on the virtual conference platform.' },
  { num: '3', title: 'Capture', desc: 'Extension records slides and transcript live.' },
  { num: '4', title: 'Summarise', desc: 'Claude AI generates a structured clinical summary.' },
];

const tools = [
  {
    title: 'Abstract Analyser',
    description: 'Paste any abstract and extract structured efficacy data, safety signals, and key findings.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></svg>,
  },
  {
    title: 'Session Comparator',
    description: 'Compare two abstracts side-by-side with structured endpoint and outcome analysis.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19V6l-6 6M15 5v13l6-6" /></svg>,
  },
  {
    title: 'Clinical Q&A',
    description: 'Ask questions about session content and get AI-powered answers with data citations.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
];

export default function ConferenceAIPage() {
  const [howRef, howVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [featRef, featVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [toolsRef, toolsVisible] = useIntersectionObserver({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroAccent} />
        <div className={styles.container}>
          <span className={styles.tag}>Haem.io Product</span>
          <h1 className={styles.heroTitle}>Conference<span className={styles.highlight}>AI</span></h1>
          <p className={styles.heroSub}>
            Capture and analyse haematology conference presentations with AI.
            Slides, transcripts, efficacy data, and safety signals — structured in minutes.
          </p>
          <div className={styles.heroActions}>
            <a href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Open Dashboard
            </a>
            <a href="#how-it-works" className={styles.btnOutline}>How it works</a>
          </div>
          <div className={styles.confStrip}>
            {['EBMT', 'ASH', 'EHA', 'ASCO', 'BSH'].map(c => (
              <span key={c} className={styles.confChip}>{c}</span>
            ))}
          </div>
        </div>

        {/* Demo */}
        <div className={styles.container}>
          <div className={styles.demo}>
            <div className={styles.demoHeader}>
              <span className={styles.demoTitle}>ConferenceAI</span>
              <span className={styles.demoStatus}>Processing</span>
            </div>
            <div className={styles.demoBody}>
              <div className={styles.demoCol}>
                <h4>Input</h4>
                <dl className={styles.demoDl}>
                  <div><dt>Conference</dt><dd>EBMT 2025</dd></div>
                  <div><dt>Session</dt><dd>OS-14-03</dd></div>
                  <div><dt>Slides</dt><dd>24 captured</dd></div>
                  <div><dt>Duration</dt><dd>18 min</dd></div>
                </dl>
              </div>
              <div className={styles.demoSep} />
              <div className={styles.demoCol}>
                <h4>Output</h4>
                <dl className={styles.demoDl}>
                  <div><dt>Efficacy</dt><dd className={styles.demoVal}>ORR 78% (CR 42%)</dd></div>
                  <div><dt>Safety</dt><dd className={styles.demoValGreen}>3 signals flagged</dd></div>
                  <div><dt>Key Finding</dt><dd className={styles.demoVal}>MRD-neg CR at 12mo</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.section} id="how-it-works" ref={howRef}>
        <div className={styles.container}>
          <h2 className={`${styles.secTitle} ${howVisible ? styles.visible : ''}`}>How It Works</h2>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={s.num} className={`${styles.stepCard} ${howVisible ? styles.visible : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={styles.stepNum}>{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className={styles.sectionAlt} ref={featRef}>
        <div className={styles.container}>
          <h2 className={`${styles.secTitle} ${featVisible ? styles.visible : ''}`}>Capabilities</h2>
          <div className={styles.featGrid}>
            {features.map((f, i) => (
              <div key={f.title} className={`${styles.featCard} ${featVisible ? styles.visible : ''}`} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={styles.featIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Tools */}
      <section className={styles.section} id="tools" ref={toolsRef}>
        <div className={styles.container}>
          <h2 className={`${styles.secTitle} ${toolsVisible ? styles.visible : ''}`}>AI Analytics Tools</h2>
          <p className={styles.secSub}>Abstract analyser, session comparator, and clinical Q&A — powered by Claude AI.</p>
          <div className={styles.toolsGrid}>
            {tools.map((t, i) => (
              <div key={t.title} className={`${styles.toolCard} ${toolsVisible ? styles.visible : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.toolIcon}>{t.icon}</div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.toolsCta}>
            <a href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/intelligence/tools" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Try the Tools
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.container}>
          <div className={`${styles.ctaCard} ${ctaVisible ? styles.visible : ''}`}>
            <h2>Start capturing conference intelligence</h2>
            <p>Access the dashboard to view captured sessions and AI-generated clinical summaries.</p>
            <a href="https://haemio-conferenceai-cc44c37efac2.herokuapp.com/dashboard/index.html" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Open Dashboard
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
