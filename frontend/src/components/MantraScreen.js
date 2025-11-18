import React, { useEffect, useCallback } from 'react';
import { apiUrl } from '../utils/api';

export default function MantraScreen({
  mantra,
  setMantra,
  mantraId,
  setMantraId,
  onRephrase,
  onBackToMenu,
  onAddNewMantra
}) {
  const getNewMantra = useCallback(
    async (afterId = 0) => {
      try {
        if (afterId == null || isNaN(afterId)) afterId = 1;
        const res = await fetch(apiUrl(`/api/mantras/next/${afterId}`));
        if (!res.ok) throw new Error('Unable to fetch a new mantra.');

        const data = await res.json();
        setMantra(data.content);
        setMantraId(data.id);
      } catch (err) {
        console.error('Failed to fetch mantra:', err);
        setMantra('No more mantras available.');
      }
    },
    [setMantra, setMantraId]
  );

  const handleDislike = async () => {
    if (!mantraId) return;

    try {
      const res = await fetch(apiUrl(`/api/mantras/${mantraId}`), {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Delete failed');
      getNewMantra(mantraId);
    } catch (err) {
      console.error('Mantra could not be removed:', err);
      setMantra('An error occurred during deletion.');
    }
  };

  useEffect(() => {
    if (!mantra) {
      getNewMantra(mantraId || 0);
    }
  }, [mantra, mantraId, getNewMantra]);

  return (
    <div className="screen-container mantra-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">Flow #{mantraId || '---'}</p>
          <h1 className="screen-title">Daily Mantra</h1>
          <p className="screen-subtitle">
            Remove anything that does not match your rhythm and rewrite it for a fresh perspective.
          </p>
        </div>
        <button className="btn ghost" onClick={onBackToMenu}>
          Main Menu
        </button>
      </div>

      <div className="mantra-card emphasis">
        <p className="mantra-text">{mantra || 'Loading a new mantra...'}</p>
      </div>

      <div className="action-bar">
        <button className="btn like" onClick={() => getNewMantra(mantraId)}>
          Next Mantra
        </button>
        <button className="btn rephrase" onClick={onRephrase}>
          Rewrite Mantra
        </button>
        <button className="btn dislike" onClick={handleDislike}>
          Remove from Library
        </button>
        <button className="btn save" onClick={onAddNewMantra}>
          Add New Mantra
        </button>
      </div>

      <div className="hint-row">
        <span className="pill">Each saved edit keeps the mantra library evolving.</span>
      </div>
    </div>
  );
}
