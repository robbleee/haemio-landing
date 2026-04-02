'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

const CATEGORIES = ['Newly Diagnosed', 'Relapsed/Refractory', 'Supportive Care', 'Transplant'];
const PHASES = ['Phase 1', 'Phase 1/2', 'Phase 2', 'Phase 2/3', 'Phase 3', 'Randomised Controlled Trial'];
const FITNESS_OPTIONS = [
  { value: '', label: 'Any / not specified' },
  { value: 'intensive', label: 'Intensive' },
  { value: 'non-intensive', label: 'Non-intensive' },
  { value: 'both', label: 'Both (intensive & non-intensive arms)' },
];
const GENETIC_MARKERS = ['NPM1', 'FLT3-ITD', 'KMT2A', 'TP53', 'IDH1', 'IDH2', 'CEBPA', 'NUP98', 'RUNX1', 'BCR-ABL1'];

const EMPTY_FORM = {
  trial_id: '', category: 'Newly Diagnosed', name: '', description: '',
  weblink: '', inclusion_criteria: '', exclusion_criteria: '', contact: '', sites: '',
  phase: '', fitness: '', age_min: '', age_max: '', ecog_max: '',
  genetics_required: [], genetics_excluded: [],
};

export default function ClinicalTrialsAdmin() {
  const [key, setKey] = useState('');
  const [authMode, setAuthMode] = useState(null); // 'access' | 'admin'
  const [orgInfo, setOrgInfo] = useState(null); // { organisation, issuedTo }
  const [trials, setTrials] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Admin: access key management
  const [accessKeys, setAccessKeys] = useState([]);
  const [newKeyForm, setNewKeyForm] = useState({ issued_to: '', organisation: '', email: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchTrials = async () => {
    try {
      const res = await fetch('/api/clinical-trials');
      const data = await res.json();
      setTrials(data.trials || []);
    } catch { showMessage('Failed to load trials', 'error'); }
  };

  const fetchAccessKeys = async () => {
    try {
      const res = await fetch('/api/clinical-trials/keys', { headers: { 'X-API-Key': key } });
      const data = await res.json();
      setAccessKeys(data.keys || []);
    } catch { /* admin-only, ignore if not admin */ }
  };

  const handleAuth = async () => {
    if (!key.trim()) return;
    setLoading(true);

    // Try as trial access key first
    try {
      const res = await fetch('/api/clinical-trials/verify-key', {
        headers: { 'X-Trial-Access-Key': key },
      });
      const data = await res.json();
      if (data.valid) {
        setAuthMode('access');
        setOrgInfo({ organisation: data.organisation, issuedTo: data.issuedTo });
        fetchTrials();
        setLoading(false);
        return;
      }
    } catch {}

    // Try as admin API key — attempt to list access keys (admin-only endpoint)
    try {
      const res = await fetch('/api/clinical-trials/keys', { headers: { 'X-API-Key': key } });
      if (res.ok) {
        setAuthMode('admin');
        fetchTrials();
        fetchAccessKeys();
        setLoading(false);
        return;
      }
    } catch {}

    showMessage('Invalid key. Please check and try again.', 'error');
    setLoading(false);
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.trial_id || !form.name || !form.category) {
      showMessage('Trial ID, Name, and Category are required', 'error');
      return;
    }

    setLoading(true);
    const payload = {
      trial_id: form.trial_id.toLowerCase().replace(/\s+/g, '-'),
      category: form.category, name: form.name, description: form.description,
      weblink: form.weblink,
      inclusion_criteria: form.inclusion_criteria.split('\n').map(s => s.trim()).filter(Boolean),
      exclusion_criteria: form.exclusion_criteria.split('\n').map(s => s.trim()).filter(Boolean),
      contact: form.contact, sites: form.sites,
      phase: form.phase || null,
      fitness: form.fitness || null,
      age_min: form.age_min ? parseInt(form.age_min) : null,
      age_max: form.age_max ? parseInt(form.age_max) : null,
      ecog_max: form.ecog_max !== '' ? parseInt(form.ecog_max) : null,
      genetics_required: form.genetics_required,
      genetics_excluded: form.genetics_excluded,
    };

    try {
      let res;
      if (editing && authMode === 'admin') {
        res = await fetch(`/api/clinical-trials?id=${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
          body: JSON.stringify(payload),
        });
      } else {
        const headers = { 'Content-Type': 'application/json' };
        if (authMode === 'access') {
          headers['X-Trial-Access-Key'] = key;
        } else {
          headers['X-API-Key'] = key;
        }
        res = await fetch('/api/clinical-trials', {
          method: 'POST', headers, body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showMessage(editing ? 'Trial updated' : 'Trial submitted');
        setForm(EMPTY_FORM);
        setEditing(null);
        fetchTrials();
      } else {
        showMessage(data.detail || data.error || 'Failed', 'error');
      }
    } catch { showMessage('Request failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleEdit = (trial) => {
    setEditing(trial.id);
    const genetics = trial.genetics || { required: [], excluded: [] };
    setForm({
      trial_id: trial.id, category: trial.category, name: trial.name,
      description: trial.description || '', weblink: trial.weblink || '',
      inclusion_criteria: (trial.inclusionCriteria || []).join('\n'),
      exclusion_criteria: (trial.exclusionCriteria || []).join('\n'),
      contact: trial.contact || '', sites: trial.sites || '',
      phase: trial.phase || '', fitness: trial.fitness || '',
      age_min: trial.ageMin != null ? String(trial.ageMin) : '',
      age_max: trial.ageMax != null ? String(trial.ageMax) : '',
      ecog_max: trial.ecogMax != null ? String(trial.ecogMax) : '',
      genetics_required: genetics.required || [],
      genetics_excluded: genetics.excluded || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (trialId) => {
    if (!confirm(`Delete trial "${trialId}"?`)) return;
    try {
      const res = await fetch(`/api/clinical-trials?id=${trialId}`, {
        method: 'DELETE', headers: { 'X-API-Key': key },
      });
      if (res.ok) { showMessage('Trial deleted'); fetchTrials(); }
      else { const data = await res.json(); showMessage(data.detail || 'Failed', 'error'); }
    } catch { showMessage('Delete failed', 'error'); }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyForm.issued_to || !newKeyForm.organisation) {
      showMessage('Name and organisation required', 'error'); return;
    }
    try {
      const res = await fetch('/api/clinical-trials/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
        body: JSON.stringify(newKeyForm),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(`Key created: ${data.accessKey.key}`);
        setNewKeyForm({ issued_to: '', organisation: '', email: '' });
        fetchAccessKeys();
      } else { showMessage(data.detail || 'Failed', 'error'); }
    } catch { showMessage('Failed to create key', 'error'); }
  };

  const handleRevokeKey = async (keyValue) => {
    if (!confirm(`Revoke access key ${keyValue}?`)) return;
    try {
      const res = await fetch(`/api/clinical-trials/keys?key=${keyValue}`, {
        method: 'DELETE', headers: { 'X-API-Key': key },
      });
      if (res.ok) { showMessage('Key revoked'); fetchAccessKeys(); }
      else { showMessage('Failed to revoke', 'error'); }
    } catch { showMessage('Revoke failed', 'error'); }
  };

  // Auth gate
  if (!authMode) {
    return (
      <div className={styles.page}>
        <div className={styles.authCard}>
          <h1>Clinical Trials Portal</h1>
          <p>Enter your access key to submit or manage trials.</p>
          <div className={styles.authRow}>
            <input
              type="password"
              placeholder="Access key"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className={styles.authInput}
              disabled={loading}
            />
            <button onClick={handleAuth} className={styles.authBtn} disabled={loading}>
              {loading ? '...' : 'Enter'}
            </button>
          </div>
          {message.text && <p className={`${styles.authMessage} ${styles[message.type]}`}>{message.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Clinical Trials {authMode === 'admin' ? 'Admin' : 'Submission'}</h1>
        {orgInfo && <p>Submitting as <strong>{orgInfo.issuedTo}</strong> — {orgInfo.organisation}</p>}
        {authMode === 'admin' && <p>{trials.length} trials in database</p>}
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      {/* Trial form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{editing ? `Editing: ${editing}` : 'Submit a Trial'}</h2>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Trial ID</label>
            <input type="text" value={form.trial_id} onChange={e => setField('trial_id', e.target.value)}
              placeholder="e.g. my-trial-name" disabled={!!editing} required />
          </div>
          <div className={styles.field}>
            <label>Name</label>
            <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
              placeholder="e.g. MY-TRIAL" required />
          </div>
          <div className={styles.field}>
            <label>Category</label>
            <select value={form.category} onChange={e => setField('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Weblink</label>
            <input type="url" value={form.weblink} onChange={e => setField('weblink', e.target.value)}
              placeholder="https://clinicaltrials.gov/study/NCT..." />
          </div>
          <div className={styles.field}>
            <label>Contact</label>
            <input type="text" value={form.contact} onChange={e => setField('contact', e.target.value)}
              placeholder="email@example.com" />
          </div>
          <div className={styles.field}>
            <label>Sites</label>
            <input type="text" value={form.sites} onChange={e => setField('sites', e.target.value)}
              placeholder="Hospital A, Hospital B" />
          </div>
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea value={form.description} onChange={e => setField('description', e.target.value)}
            rows={3} placeholder="Brief description of the trial..." />
        </div>

        {/* Structured eligibility fields */}
        <div className={styles.structuredSection}>
          <h3 className={styles.structuredTitle}>Eligibility Criteria (structured)</h3>
          <p className={styles.structuredHint}>These fields power the search filters on the public page.</p>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Phase</label>
              <select value={form.phase} onChange={e => setField('phase', e.target.value)}>
                <option value="">Not specified</option>
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Fitness Requirement</label>
              <select value={form.fitness} onChange={e => setField('fitness', e.target.value)}>
                {FITNESS_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Age Min</label>
              <input type="number" value={form.age_min} onChange={e => setField('age_min', e.target.value)}
                placeholder="e.g. 18" min="0" max="120" />
            </div>
            <div className={styles.field}>
              <label>Age Max</label>
              <input type="number" value={form.age_max} onChange={e => setField('age_max', e.target.value)}
                placeholder="e.g. 75 (leave blank if no upper limit)" min="0" max="120" />
            </div>
            <div className={styles.field}>
              <label>Max ECOG PS</label>
              <select value={form.ecog_max} onChange={e => setField('ecog_max', e.target.value)}>
                <option value="">Not specified</option>
                {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Required Genetics (any of these)</label>
              <div className={styles.markerGrid}>
                {GENETIC_MARKERS.map(m => (
                  <label key={m} className={styles.markerLabel}>
                    <input type="checkbox"
                      checked={form.genetics_required.includes(m)}
                      onChange={() => {
                        setForm(prev => ({
                          ...prev,
                          genetics_required: prev.genetics_required.includes(m)
                            ? prev.genetics_required.filter(x => x !== m)
                            : [...prev.genetics_required, m]
                        }));
                      }}
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Excluded Genetics (patient must NOT have)</label>
              <div className={styles.markerGrid}>
                {GENETIC_MARKERS.map(m => (
                  <label key={m} className={styles.markerLabel}>
                    <input type="checkbox"
                      checked={form.genetics_excluded.includes(m)}
                      onChange={() => {
                        setForm(prev => ({
                          ...prev,
                          genetics_excluded: prev.genetics_excluded.includes(m)
                            ? prev.genetics_excluded.filter(x => x !== m)
                            : [...prev.genetics_excluded, m]
                        }));
                      }}
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Free text criteria (kept for display) */}
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label>Additional Inclusion Details (free text, one per line)</label>
            <textarea value={form.inclusion_criteria} onChange={e => setField('inclusion_criteria', e.target.value)}
              rows={6} placeholder={"Age \u226518\nECOG 0-2\nNPM1 mutated"} />
          </div>
          <div className={styles.field}>
            <label>Exclusion Criteria (one per line)</label>
            <textarea value={form.exclusion_criteria} onChange={e => setField('exclusion_criteria', e.target.value)}
              rows={6} placeholder={"Prior therapy for AML\nActive CNS involvement"} />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Saving...' : editing ? 'Update Trial' : 'Submit Trial'}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className={styles.cancelBtn}>Cancel</button>}
        </div>
      </form>

      {/* Admin-only sections */}
      {authMode === 'admin' && (
        <>
          {/* Access key management */}
          <div className={styles.section}>
            <h2>Access Keys</h2>
            <p className={styles.sectionHint}>Generate keys to give to hospitals and specialists so they can submit trials.</p>

            <form onSubmit={handleCreateKey} className={styles.keyForm}>
              <input type="text" placeholder="Person name" value={newKeyForm.issued_to}
                onChange={e => setNewKeyForm(prev => ({ ...prev, issued_to: e.target.value }))} required />
              <input type="text" placeholder="Organisation" value={newKeyForm.organisation}
                onChange={e => setNewKeyForm(prev => ({ ...prev, organisation: e.target.value }))} required />
              <input type="email" placeholder="Email (optional)" value={newKeyForm.email}
                onChange={e => setNewKeyForm(prev => ({ ...prev, email: e.target.value }))} />
              <button type="submit" className={styles.submitBtn}>Generate Key</button>
            </form>

            {accessKeys.length > 0 && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Issued To</th>
                    <th>Organisation</th>
                    <th>Uses</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accessKeys.map(ak => (
                    <tr key={ak.key} className={!ak.isActive ? styles.revokedRow : ''}>
                      <td><code className={styles.keyCode}>{ak.key}</code></td>
                      <td>{ak.issuedTo}</td>
                      <td>{ak.organisation}</td>
                      <td>{ak.uses}</td>
                      <td>{ak.isActive ? 'Active' : 'Revoked'}</td>
                      <td>
                        {ak.isActive && (
                          <button onClick={() => handleRevokeKey(ak.key)} className={styles.deleteBtn}>Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Existing trials table */}
          <div className={styles.section}>
            <h2>Existing Trials</h2>
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Category</th><th>Sites</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {trials.map(trial => (
                  <tr key={trial.id}>
                    <td><strong>{trial.name}</strong><br /><span className={styles.trialId}>{trial.id}</span></td>
                    <td>{trial.category}</td>
                    <td className={styles.sitesCell}>{(trial.sites || '').substring(0, 60)}{(trial.sites || '').length > 60 ? '...' : ''}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button onClick={() => handleEdit(trial)} className={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(trial.id)} className={styles.deleteBtn}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
