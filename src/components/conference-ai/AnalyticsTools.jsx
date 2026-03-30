'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './AnalyticsTools.module.css';

const SAMPLE_ABSTRACT = `Background: Venetoclax combined with azacitidine (Ven+Aza) is standard of care for older/unfit patients with newly diagnosed AML. We report updated results from the VIALE-A trial with extended follow-up.

Methods: Patients aged ≥75 or with comorbidities were randomized 2:1 to venetoclax 400mg (28-day cycles, days 1-28 C1, days 1-21 C2+) plus azacitidine 75mg/m² (days 1-7) or placebo plus azacitidine. Primary endpoint was overall survival (OS).

Results: 431 patients were randomized (286 Ven+Aza, 145 placebo+Aza). Median age was 76 years. With 43.2 months median follow-up, median OS was 14.7 months for Ven+Aza vs 9.6 months for placebo+Aza (HR 0.58; 95% CI 0.47-0.72; p<0.001). Composite complete remission (CR+CRi) rate was 66.4% vs 28.3%. Median time to CR+CRi was 1.3 months. MRD negativity (<10⁻³) was achieved in 23.4% of Ven+Aza patients. Grade ≥3 adverse events included febrile neutropenia (42% vs 19%), thrombocytopenia (45% vs 38%), and neutropenia (42% vs 29%). Median duration of response was 17.5 months. 30-day mortality was 7.3% vs 6.2%.

Conclusions: Venetoclax plus azacitidine demonstrated sustained OS benefit with extended follow-up in older/unfit patients with newly diagnosed AML, confirming its role as standard of care in this population.`;

const SAMPLE_ABSTRACT_B = `Background: Ivosidenib combined with azacitidine was evaluated in patients with newly diagnosed IDH1-mutated AML who were ineligible for intensive chemotherapy.

Methods: In the AGILE trial, patients were randomized 1:1 to ivosidenib 500mg daily plus azacitidine 75mg/m² (days 1-7) or placebo plus azacitidine. Primary endpoint was event-free survival (EFS).

Results: 146 patients were randomized (72 Ivo+Aza, 74 placebo+Aza). Median age was 76 years. Median EFS was 24.0 months vs 7.9 months (HR 0.33; 95% CI 0.16-0.69; p=0.002). Median OS was 29.3 months vs 12.3 months (HR 0.42; p<0.001). CR rate was 47.2% vs 14.9%. CR+CRi was 52.8% vs 17.6%. Median DOR was 24.1 months. IDH1 mutation clearance was achieved in 39% of responders. Grade ≥3 AEs: neutropenia (28% vs 27%), febrile neutropenia (28% vs 34%), thrombocytopenia (24% vs 15%), differentiation syndrome (14% vs 0%). QTc prolongation ≥3 occurred in 6.9% vs 0%.

Conclusions: Ivosidenib plus azacitidine significantly improved EFS and OS in newly diagnosed IDH1-mutated AML, establishing a new targeted standard of care for this molecular subgroup.`;

const TABS = [
  { id: 'abstract', label: 'Abstract Analyser', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
  { id: 'compare', label: 'Comparator', icon: 'M9 19V6l-6 6M15 5v13l6-6' },
  { id: 'qa', label: 'Clinical Q&A', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
];

function MarkdownRenderer({ content }) {
  // Simple markdown to HTML
  const html = content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\|(.+)\|\n\|[-| :]+\|\n((\|.+\|\n?)+)/g, (match, header, body) => {
      const headers = header.split('|').filter(Boolean).map(h => `<th>${h.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map(row => {
        const cells = row.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hultop])(.+)$/gm, '$1');

  return <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function AnalyticsTools() {
  const [activeTab, setActiveTab] = useState('abstract');
  const [content, setContent] = useState('');
  const [contentB, setContentB] = useState('');
  const [question, setQuestion] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const runAnalysis = useCallback(async () => {
    if (!content.trim()) return;
    if (activeTab === 'compare' && !contentB.trim()) return;
    if (activeTab === 'qa' && !question.trim()) return;

    setLoading(true);
    setOutput('');

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/conference-ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeTab,
          content: content.trim(),
          contentB: contentB.trim(),
          question: question.trim(),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        setOutput(`Error: ${err.error}`);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setOutput(accumulated);
              } else if (parsed.error) {
                setOutput(`Error: ${parsed.error}`);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setOutput(`Error: ${err.message}`);
      }
    }

    setLoading(false);
  }, [activeTab, content, contentB, question]);

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const loadSample = () => {
    setContent(SAMPLE_ABSTRACT);
    if (activeTab === 'compare') setContentB(SAMPLE_ABSTRACT_B);
    if (activeTab === 'qa') setQuestion('What is the overall response rate and how does it compare between arms?');
  };

  return (
    <div className={styles.tools}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(tab.id); setOutput(''); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.workspace}>
        {/* Input panel */}
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>
              {activeTab === 'abstract' && 'Paste abstract or session content'}
              {activeTab === 'compare' && 'Study A'}
              {activeTab === 'qa' && 'Session content'}
            </span>
            <button className={styles.sampleBtn} onClick={loadSample}>
              Load sample
            </button>
          </div>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste conference abstract, session notes, or slide content here..."
            rows={activeTab === 'compare' ? 8 : 12}
          />

          {activeTab === 'compare' && (
            <>
              <div className={styles.panelHeader} style={{ marginTop: '0.75rem' }}>
                <span className={styles.panelLabel}>Study B</span>
              </div>
              <textarea
                className={styles.textarea}
                value={contentB}
                onChange={(e) => setContentB(e.target.value)}
                placeholder="Paste second abstract for comparison..."
                rows={8}
              />
            </>
          )}

          {activeTab === 'qa' && (
            <>
              <div className={styles.panelHeader} style={{ marginTop: '0.75rem' }}>
                <span className={styles.panelLabel}>Your question</span>
              </div>
              <input
                type="text"
                className={styles.questionInput}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What were the grade 3+ adverse events?"
                onKeyDown={(e) => e.key === 'Enter' && !loading && runAnalysis()}
              />
            </>
          )}

          <div className={styles.actions}>
            {loading ? (
              <button className={styles.stopBtn} onClick={handleStop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                Stop
              </button>
            ) : (
              <button
                className={styles.runBtn}
                onClick={runAnalysis}
                disabled={!content.trim() || (activeTab === 'compare' && !contentB.trim()) || (activeTab === 'qa' && !question.trim())}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6" />
                </svg>
                {activeTab === 'abstract' && 'Analyse'}
                {activeTab === 'compare' && 'Compare'}
                {activeTab === 'qa' && 'Ask'}
              </button>
            )}
          </div>
        </div>

        {/* Output panel */}
        <div className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>
              {activeTab === 'abstract' && 'Structured Analysis'}
              {activeTab === 'compare' && 'Comparison'}
              {activeTab === 'qa' && 'Answer'}
            </span>
            {loading && <span className={styles.streaming}>Streaming...</span>}
          </div>
          <div className={styles.outputBody}>
            {output ? (
              <MarkdownRenderer content={output} />
            ) : (
              <div className={styles.placeholder}>
                {activeTab === 'abstract' && 'Paste a conference abstract and click Analyse to extract structured efficacy data, safety signals, and clinical insights.'}
                {activeTab === 'compare' && 'Paste two abstracts and click Compare to generate a side-by-side analysis of endpoints, populations, and outcomes.'}
                {activeTab === 'qa' && 'Paste session content, type a question, and get AI-powered answers with specific data citations.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
