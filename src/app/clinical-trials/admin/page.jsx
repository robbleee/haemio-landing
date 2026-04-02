'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

const CATEGORIES = ['Newly Diagnosed', 'Relapsed/Refractory', 'Supportive Care', 'Transplant'];

const EMPTY_FORM = {
  trial_id: '',
  category: 'Newly Diagnosed',
  name: '',
  description: '',
  weblink: '',
  inclusion_criteria: '',
  exclusion_criteria: '',
  contact: '',
  sites: '',
};

export default function ClinicalTrialsAdmin() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [trials, setTrials] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null); // trial_id being edited
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchTrials = async () => {
    try {
      const res = await fetch('/api/clinical-trials');
      const data = await res.json();
      setTrials(data.trials || []);
    } catch {
      showMessage('Failed to load trials', 'error');
    }
  };

  const handleAuth = async () => {
    if (!apiKey.trim()) return;
    // Verify key works by trying to fetch — the GET is public, so we just store the key
    // The actual validation happens on POST/PUT/DELETE
    setAuthenticated(true);
    fetchTrials();
  };

  useEffect(() => {
    if (authenticated) fetchTrials();
  }, [authenticated]);

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.trial_id || !form.name || !form.category) {
      showMessage('Trial ID, Name, and Category are required', 'error');
      return;
    }

    setLoading(true);
    const payload = {
      trial_id: form.trial_id.toLowerCase().replace(/\s+/g, '-'),
      category: form.category,
      name: form.name,
      description: form.description,
      weblink: form.weblink,
      inclusion_criteria: form.inclusion_criteria
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      exclusion_criteria: form.exclusion_criteria
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      contact: form.contact,
      sites: form.sites,
    };

    try {
      let res;
      if (editing) {
        res = await fetch(`/api/clinical-trials?id=${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/clinical-trials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        showMessage(editing ? 'Trial updated' : 'Trial created');
        setForm(EMPTY_FORM);
        setEditing(null);
        fetchTrials();
      } else {
        showMessage(data.detail || data.error || 'Failed', 'error');
      }
    } catch {
      showMessage('Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trial) => {
    setEditing(trial.id);
    setForm({
      trial_id: trial.id,
      category: trial.category,
      name: trial.name,
      description: trial.description || '',
      weblink: trial.weblink || '',
      inclusion_criteria: (trial.inclusionCriteria || []).join('\n'),
      exclusion_criteria: (trial.exclusionCriteria || []).join('\n'),
      contact: trial.contact || '',
      sites: trial.sites || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (trialId) => {
    if (!confirm(`Delete trial "${trialId}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/clinical-trials?id=${trialId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey },
      });

      if (res.ok) {
        showMessage('Trial deleted');
        fetchTrials();
      } else {
        const data = await res.json();
        showMessage(data.detail || 'Failed to delete', 'error');
      }
    } catch {
      showMessage('Delete request failed', 'error');
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  // Auth gate
  if (!authenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.authCard}>
          <h1>Clinical Trials Admin</h1>
          <p>Enter your access key to manage trials.</p>
          <div className={styles.authRow}>
            <input
              type="password"
              placeholder="Access key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className={styles.authInput}
            />
            <button onClick={handleAuth} className={styles.authBtn}>Enter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Clinical Trials Admin</h1>
        <p>{trials.length} trials in database</p>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Add / Edit form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{editing ? `Editing: ${editing}` : 'Add New Trial'}</h2>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Trial ID</label>
            <input
              type="text"
              value={form.trial_id}
              onChange={e => setField('trial_id', e.target.value)}
              placeholder="e.g. my-trial-name"
              disabled={!!editing}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. MY-TRIAL"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Category</label>
            <select value={form.category} onChange={e => setField('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label>Weblink</label>
            <input
              type="url"
              value={form.weblink}
              onChange={e => setField('weblink', e.target.value)}
              placeholder="https://clinicaltrials.gov/study/NCT..."
            />
          </div>

          <div className={styles.field}>
            <label>Contact</label>
            <input
              type="text"
              value={form.contact}
              onChange={e => setField('contact', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className={styles.field}>
            <label>Sites</label>
            <input
              type="text"
              value={form.sites}
              onChange={e => setField('sites', e.target.value)}
              placeholder="Hospital A, Hospital B, Hospital C"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            rows={3}
            placeholder="Brief description of the trial..."
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label>Inclusion Criteria (one per line)</label>
            <textarea
              value={form.inclusion_criteria}
              onChange={e => setField('inclusion_criteria', e.target.value)}
              rows={6}
              placeholder={"Age \u226518\nECOG 0-2\nNPM1 mutated"}
            />
          </div>

          <div className={styles.field}>
            <label>Exclusion Criteria (one per line)</label>
            <textarea
              value={form.exclusion_criteria}
              onChange={e => setField('exclusion_criteria', e.target.value)}
              rows={6}
              placeholder={"Prior therapy for AML\nActive CNS involvement"}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Saving...' : editing ? 'Update Trial' : 'Add Trial'}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing trials table */}
      <div className={styles.tableWrapper}>
        <h2>Existing Trials</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Sites</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trials.map(trial => (
              <tr key={trial.id}>
                <td>
                  <strong>{trial.name}</strong>
                  <br />
                  <span className={styles.trialId}>{trial.id}</span>
                </td>
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
    </div>
  );
}
