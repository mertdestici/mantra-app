import React, { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

export default function AllMantrasScreen({ onBack }) {
  const [mantras, setMantras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMantras = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(apiUrl('/api/mantras'));
        if (!response.ok) throw new Error('Unable to load mantras.');
        const data = await response.json();
        setMantras(data);
      } catch (err) {
        console.error('Failed to fetch mantras:', err);
        setError(err.message || 'Failed to fetch mantras.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMantras();
  }, []);

  return (
    <div className="screen-container">
      <div className="screen-header">
        <div>
          <p className="eyebrow">Library</p>
          <h1 className="screen-title">All Mantras</h1>
          <p className="screen-subtitle">
            Browse everything stored in your collection. Each item is ordered chronologically.
          </p>
        </div>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>

      {isLoading && <div className="info-panel">Loading mantras...</div>}
      {error && (
        <div className="info-panel" style={{ color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="mantra-grid">
          {mantras.map((item) => (
            <div key={item.id} className="mantra-chip">
              <div className="chip-id">#{item.id}</div>
              <div className="chip-content">{item.content}</div>
            </div>
          ))}
          {!mantras.length && <div className="info-panel">No mantras available.</div>}
        </div>
      )}
    </div>
  );
}
