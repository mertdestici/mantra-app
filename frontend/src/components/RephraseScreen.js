import React, { useState } from 'react';
import { apiUrl } from '../utils/api';

export default function RephraseScreen({ originalMantra, onBack, onSave, mantraId }) {
  const [input, setInput] = useState('');
  const [rephrased, setRephrased] = useState(originalMantra);

  const handleRephraseAI = async () => {
    try {
      const response = await fetch(apiUrl('/api/rephraseAI'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalMantra,
          rephrasedText: input
        })
      });
      const data = await response.json();
      setRephrased(data.rephrased || input);
    } catch (error) {
      console.error('Rephrase error:', error);
    }
  };

  const handleRephrase = async () => {
    try {
      const response = await fetch(apiUrl('/api/rephrase'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalMantra,
          rephrasedText: input
        })
      });
      const data = await response.json();
      setRephrased(data.rephrased || input);
    } catch (error) {
      console.error('Rephrase error:', error);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(apiUrl('/api/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mantraId, text: rephrased })
      });
      onSave(rephrased);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="screen-container rephrase-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">Editor</p>
          <h1 className="screen-title">Personalize your mantra</h1>
          <p className="screen-subtitle">
            Infuse your own language, then save to make the mantra flow entirely yours.
          </p>
        </div>
        <button className="btn ghost" onClick={onBack}>
          Return to Flow
        </button>
      </div>

      <div className="mantra-card">
        <p className="mantra-text">{rephrased || originalMantra}</p>
      </div>

      <div className="textarea-wrapper">
        <label htmlFor="rephrase-input">Your version</label>
        <textarea
          id="rephrase-input"
          className="mantra-input"
          rows="4"
          placeholder="Adjust the tone, shorten the rhythm, or add new words."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="action-bar center">
        <button className="btn rephrase" onClick={handleRephrase}>
          Rephrase
        </button>
        <button className="btn rephrase" onClick={handleRephraseAI}>
          Rephrase with AI
        </button>
        <button className="btn save" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
