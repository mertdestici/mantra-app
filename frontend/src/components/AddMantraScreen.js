import React, { useState } from 'react';
import { apiUrl } from '../utils/api';

export default function AddMantraScreen({ onBack, onCreated }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please write a mantra first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/mantras'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add mantra.');
      }

      const created = await response.json();
      onCreated(created);
    } catch (err) {
      console.error('Add mantra failed:', err);
      setError(err.message || 'Failed to add mantra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-container add-mantra-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">Library</p>
          <h1 className="screen-title">Add New Mantra</h1>
          <p className="screen-subtitle">
            Capture a new affirmation or phrase to keep it in your daily rotation.
          </p>
        </div>
        <button className="btn ghost" onClick={onBack}>
          Back to Flow
        </button>
      </div>

      <div className="textarea-wrapper">
        <label htmlFor="new-mantra-input">Mantra</label>
        <textarea
          id="new-mantra-input"
          className="mantra-input"
          rows="5"
          placeholder="Write something grounding, empowering, or centering..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="info-panel" style={{ color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      <div className="action-bar center">
        <button className="btn back" onClick={onBack} disabled={isSubmitting}>
          Cancel
        </button>
        <button className="btn save" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Mantra'}
        </button>
      </div>
    </div>
  );
}
