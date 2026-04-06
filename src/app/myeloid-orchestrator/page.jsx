'use client';

import { useState, useCallback, useRef } from 'react';
import { FlowDiagram } from '@haemio/flowdiagram/react';
import {
  orchestrationFlow,
  amlWhoFlow, amlIccFlow,
  mdsWhoFlow, mdsIccFlow,
  cmlWhoFlow, cmlIccFlow,
  cmmlFlow,
  elnFlow,
} from './flows';
import styles from './orchestrator.module.css';

function InteractiveDiagram({ config }) {
  const [popover, setPopover] = useState(null);
  const wrapperRef = useRef(null);

  const handleClick = useCallback((e) => {
    let el = e.target;
    while (el && el !== e.currentTarget) {
      if (el.tagName === 'g' && el.dataset?.nodeId) {
        const nodeId = el.dataset.nodeId;
        const node = config.nodes.find(n => n.id === nodeId);
        if (node) {
          const rect = el.getBoundingClientRect();
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setPopover({
            node,
            x: rect.left + rect.width / 2 - wrapperRect.left,
            y: rect.top - wrapperRect.top - 8,
          });
        }
        return;
      }
      el = el.parentElement;
    }
    setPopover(null);
  }, [config]);

  return (
    <div ref={wrapperRef} className={styles.diagramWrapper} onClick={handleClick} style={{ position: 'relative' }}>
      <FlowDiagram config={config} />
      {popover && (
        <div
          className={styles.popover}
          style={{ left: popover.x, top: popover.y }}
        >
          <div className={styles.popoverLabel}>{popover.node.label}</div>
          {popover.node.description && (
            <div className={styles.popoverDesc}>{popover.node.description}</div>
          )}
          <div className={styles.popoverType}>{popover.node.type}</div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'orchestrator', label: 'Orchestrator' },
  { key: 'aml', label: 'AML' },
  { key: 'mds', label: 'MDS' },
  { key: 'cml', label: 'CML' },
  { key: 'cmml', label: 'CMML' },
  { key: 'eln', label: 'ELN Risk' },
];

function OrchestratorTab() {
  return (
    <>
      <h2>High-Level Orchestration Flow</h2>
      <p>
        Every report enters the AML classifier first. Based on sentinels and
        intercept checks, the orchestrator routes to CML, MDS, or CMML.
      </p>
      <InteractiveDiagram config={orchestrationFlow} />

      <h3>Orchestration Steps</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Step</th><th>Check</th><th>Result</th><th>disease_type</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Run AML classifier</td><td>—</td><td>—</td></tr>
            <tr><td>2</td><td>AML returned error?</td><td>Return error</td><td><code>AML</code></td></tr>
            <tr><td>3</td><td>BCR::ABL1+ with blasts &lt;20%?</td><td>Run CML classifier</td><td><code>CML</code></td></tr>
            <tr><td>4</td><td>AML result is definitive?</td><td>Return AML label</td><td><code>AML</code></td></tr>
            <tr><td>5</td><td>Run MDS classifier</td><td>—</td><td>—</td></tr>
            <tr><td>6</td><td>MDS returned CMML sentinel?</td><td>Check for CMML data</td><td>—</td></tr>
            <tr><td>6a</td><td>— CMML data present</td><td>Run CMML classifier</td><td><code>CMML</code></td></tr>
            <tr><td>6b</td><td>— CMML data missing</td><td>Return sentinel to UI</td><td><code>CMML</code></td></tr>
            <tr><td>7</td><td>Otherwise</td><td>Return MDS label</td><td><code>MDS</code></td></tr>
          </tbody>
        </table>
      </div>

      <h3>Sentinel Labels</h3>
      <p>These exact strings drive routing decisions in the orchestrator:</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Sentinel</th><th>Source</th><th>Routes to</th></tr>
          </thead>
          <tbody>
            <tr><td><code>Not AML, consider MDS classification</code></td><td>AML classifier</td><td>MDS classifier</td></tr>
            <tr><td><code>Needs erythroid confirmation</code></td><td>AML classifier</td><td>MDS (ICC only) or UI</td></tr>
            <tr><td><code>Needs MDS confirmation</code></td><td>MDS classifier</td><td>UI (request confirmation)</td></tr>
            <tr><td><code>Needs CMML confirmation</code></td><td>MDS confirmation gate</td><td>CMML classifier (if data) or UI</td></tr>
            <tr><td><code>Needs CEBPA confirmation</code></td><td>AML classifier</td><td>UI (request bZIP status)</td></tr>
            <tr><td><code>Error: ...</code></td><td>Any classifier</td><td>Returned immediately</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function AmlTab() {
  return (
    <>
      <h2>AML Classification</h2>
      <p>
        AML is the first classifier in the pipeline. It checks for AML-defining
        genetic abnormalities, CEBPA mutations, TP53 status, MDS-related features, and
        morphological subtypes. WHO 2022 requires blasts &ge;20% for most categories;
        ICC 2022 lowers the threshold to &ge;10% for several.
      </p>

      <h3>WHO 2022</h3>
      <InteractiveDiagram config={amlWhoFlow} />

      <h3>ICC 2022</h3>
      <InteractiveDiagram config={amlIccFlow} />

      <h3>Key Differences — WHO vs ICC</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Feature</th><th>WHO 2022</th><th>ICC 2022</th></tr>
          </thead>
          <tbody>
            <tr><td>Blast threshold (defining abnormalities)</td><td>Any blast %</td><td>&ge;10%</td></tr>
            <tr><td>BCR::ABL1 as AML-defining</td><td>No</td><td>Yes</td></tr>
            <tr><td>TP53 classification</td><td>Biallelic only</td><td>Multi-hit (includes VAF + complex)</td></tr>
            <tr><td>MDS/AML category (10-19% blasts)</td><td>Not used</td><td>Yes</td></tr>
            <tr><td>MDS cytogenetics includes +8</td><td>No</td><td>Yes</td></tr>
          </tbody>
        </table>
      </div>

      <h3>AML-Defining Recurrent Genetic Abnormalities</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Abnormality</th><th>WHO 2022</th><th>ICC 2022</th></tr>
          </thead>
          <tbody>
            <tr><td>PML::RARA (APL)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>NPM1</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>RUNX1::RUNX1T1 — t(8;21)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>CBFB::MYH11 — inv(16)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>DEK::NUP214 — t(6;9)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>RBM15::MRTFA — t(1;22)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>MLLT3::KMT2A — t(9;11)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>GATA2::MECOM — inv(3)/t(3;3)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>KMT2A (other rearrangements)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>MECOM (other rearrangements)</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>NUP98</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>BCR::ABL1 — t(9;22)</td><td>No</td><td>Yes</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function MdsTab() {
  return (
    <>
      <h2>MDS Classification</h2>
      <p>
        MDS is reached when the AML classifier returns a &ldquo;Not AML&rdquo; sentinel.
        The classifier checks TP53 biallelic status, blast thresholds, SF3B1 mutations,
        del(5q), and dysplastic lineage counts.
      </p>

      <h3>WHO 2022</h3>
      <InteractiveDiagram config={mdsWhoFlow} />

      <h3>ICC 2022</h3>
      <InteractiveDiagram config={mdsIccFlow} />

      <h3>Key Differences — WHO vs ICC</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Feature</th><th>WHO 2022</th><th>ICC 2022</th></tr>
          </thead>
          <tbody>
            <tr><td>TP53 criteria</td><td>Biallelic (2x mutations, +del(17p), +LOH, &ge;50% VAF)</td><td>Adds &ge;10% VAF + complex karyotype</td></tr>
            <tr><td>MDS/AML overlap (10-19%)</td><td>MDS with increased blasts 2</td><td>MDS/AML category</td></tr>
            <tr><td>Hypoplastic MDS</td><td>Separate category</td><td>Separate category</td></tr>
            <tr><td>Fibrotic MDS</td><td>Separate category (blasts 5-19%)</td><td>Not a separate category</td></tr>
            <tr><td>Naming</td><td>&ldquo;MDS with low blasts&rdquo;</td><td>&ldquo;MDS, NOS&rdquo;</td></tr>
          </tbody>
        </table>
      </div>

      <h3>MDS-Related Gene Mutations</h3>
      <p>These mutations are checked in both AML (for myelodysplasia-related subtype) and MDS classifiers:</p>
      <div className={styles.chipGroup}>
        {['ASXL1', 'BCOR', 'EZH2', 'RUNX1', 'SF3B1', 'SRSF2', 'STAG2', 'U2AF1', 'ZRSR2'].map(g => (
          <span key={g} className={styles.chip}>{g}</span>
        ))}
      </div>
    </>
  );
}

function CmlTab() {
  return (
    <>
      <h2>CML Classification</h2>
      <p>
        CML is intercepted <strong>before</strong> the AML-to-MDS handoff when
        BCR::ABL1 is positive and blasts are below 20%. WHO 2022 uses 2 phases;
        ICC 2022 retains 3 phases with an accelerated category.
      </p>
      <div className={styles.diagramRow}>
        <InteractiveDiagram config={cmlWhoFlow} />
        <InteractiveDiagram config={cmlIccFlow} />
      </div>

      <h3>Phase Criteria Comparison</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Phase</th><th>WHO 2022</th><th>ICC 2022</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Blast Phase</strong></td>
              <td>Blasts &ge;20%, extramedullary disease, MECOM rearrangement, lymphoblasts &gt;5%</td>
              <td>Blasts &ge;20%, sarcoma, lymphoblasts &gt;5%</td>
            </tr>
            <tr>
              <td><strong>Accelerated Phase</strong></td>
              <td>Eliminated (merged into chronic/blast)</td>
              <td>Blasts 10-19%, basophils &ge;20%, major ACAs</td>
            </tr>
            <tr>
              <td><strong>Chronic Phase</strong></td>
              <td>Default (not blast phase)</td>
              <td>Default (not blast or accelerated)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function CmmlTab() {
  return (
    <>
      <h2>CMML Classification</h2>
      <p>
        CMML is reached via the MDS confirmation gate when monocytosis is detected.
        The UI collects monocyte count, percentage, PB blasts, and WBC from the user.
        The classifier applies eligibility gates, then classifies by AMC level, blast
        subtype (CMML-1/2), and WBC count (MP/MD).
      </p>
      <InteractiveDiagram config={cmmlFlow} />

      <h3>WHO 2022 vs ICC 2022 — Key Differences</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Criterion</th><th>WHO 2022</th><th>ICC 2022</th></tr>
          </thead>
          <tbody>
            <tr><td>Cytopenia</td><td>Not required</td><td>Required (at least one)</td></tr>
            <tr><td>Clonal evidence</td><td>Supportive (1 of 3)</td><td>Mandatory prerequisite</td></tr>
            <tr><td>MO1 &gt;94% flow</td><td>Supportive criterion</td><td>Not recognised</td></tr>
            <tr><td>Oligomonocytic</td><td>Requires dysplasia + clonality</td><td>Requires clonality (mandatory for all)</td></tr>
          </tbody>
        </table>
      </div>

      <h3>Classification Summary</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Category</th><th>Criteria</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Standard CMML</strong></td><td>AMC &ge;1.0 x10&#x2079;/L + &ge;1 of: dysplasia, clonal mutation, clonal cytogenetics</td></tr>
            <tr><td><strong>Oligomonocytic CMML</strong></td><td>AMC 0.5-&lt;1.0 x10&#x2079;/L + both dysplasia AND clonality</td></tr>
            <tr><td><strong>CMML-1</strong></td><td>PB blasts &lt;5%, BM blasts &lt;10%, no Auer rods</td></tr>
            <tr><td><strong>CMML-2</strong></td><td>PB blasts &ge;5%, BM blasts &ge;10%, or Auer rods</td></tr>
            <tr><td><strong>MP-CMML</strong></td><td>WBC &ge;13 x10&#x2079;/L (myeloproliferative)</td></tr>
            <tr><td><strong>MD-CMML</strong></td><td>WBC &lt;13 x10&#x2079;/L (myelodysplastic)</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function ElnTab() {
  return (
    <>
      <h2>ELN 2022 Risk Stratification</h2>
      <p>
        Once AML is confirmed, the ELN 2022 risk stratification assigns a prognostic
        risk category. Adverse markers are checked first, followed by favorable markers
        (with FLT3-ITD override). Everything else falls to intermediate.
      </p>
      <InteractiveDiagram config={elnFlow} />

      <h3>Adverse Markers</h3>
      <p>Any single adverse marker immediately classifies the patient as adverse risk:</p>
      <div className={styles.chipGroup}>
        {[
          't(6;9) [DEK::NUP214]', 't(9;22) [BCR::ABL1]', 'KMT2A rearr. (not t(9;11))',
          'inv(3)/t(3;3) [MECOM]', '-5 or del(5q)', '-7', '17p abnormality',
          'Complex karyotype', 'TP53', 'RUNX1', 'ASXL1', 'EZH2',
          'BCOR', 'STAG2', 'SRSF2', 'U2AF1', 'ZRSR2',
        ].map(m => (
          <span key={m} className={styles.chipAdverse}>{m}</span>
        ))}
      </div>

      <h3>Favorable Markers</h3>
      <p>These are favorable only when FLT3-ITD is absent:</p>
      <div className={styles.chipGroup}>
        {[
          't(8;21) [RUNX1::RUNX1T1]', 'inv(16)/t(16;16) [CBFB::MYH11]',
          'NPM1 (no FLT3-ITD)', 'CEBPA bZIP in-frame',
        ].map(m => (
          <span key={m} className={styles.chipFavorable}>{m}</span>
        ))}
      </div>

      <h3>Risk by Median Overall Survival</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Risk Category</th><th>Median OS</th><th>Key Markers</th></tr>
          </thead>
          <tbody>
            <tr><td><span className={styles.riskFavorable}>Favorable</span></td><td>&gt;60 months</td><td>t(8;21), inv(16), NPM1 (no FLT3-ITD), CEBPA bZIP</td></tr>
            <tr><td><span className={styles.riskIntermediate}>Intermediate</span></td><td>~16-24 months</td><td>FLT3-ITD, t(9;11), or no specific markers</td></tr>
            <tr><td><span className={styles.riskAdverse}>Adverse</span></td><td>~8-10 months</td><td>TP53, complex karyotype, MECOM, RUNX1, ASXL1, EZH2...</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

const TAB_COMPONENTS = {
  orchestrator: OrchestratorTab,
  aml: AmlTab,
  mds: MdsTab,
  cml: CmlTab,
  cmml: CmmlTab,
  eln: ElnTab,
};

export default function MyeloidOrchestratorPage() {
  const [activeTab, setActiveTab] = useState('orchestrator');
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Myeloid Classification Pipeline</h1>
        <p className={styles.subtitle}>
          Complete diagnostic logic for AML, CML, MDS, CMML, and ELN risk — WHO 2022 &amp; ICC 2022
        </p>
        <div className={styles.badges}>
          <span className={styles.badge} data-type="aml">AML</span>
          <span className={styles.badge} data-type="cml">CML</span>
          <span className={styles.badge} data-type="mds">MDS</span>
          <span className={styles.badge} data-type="cmml">CMML</span>
        </div>
      </div>

      <nav className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.section}>
        <ActiveComponent />
      </section>
    </div>
  );
}
