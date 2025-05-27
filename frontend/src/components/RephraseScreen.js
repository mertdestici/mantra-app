import React, { useState } from 'react';

export default function RephraseScreen({ originalMantra, onBack, onSave, mantraId }) {
  const [input, setInput] = useState('');
  const [rephrased, setRephrased] = useState(originalMantra);

  const handleRephraseAI = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/rephraseAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: originalMantra,
          rephrasedText: input
         })
      });
      const data = await response.json();
      setRephrased(data.rephrased || input + ' (rephrased)');
    } catch (error) {
      console.error('Rephrase error:', error);
    }
  };

  const handleRephrase = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: originalMantra,
          rephrasedText: input
         })
      });
      const data = await response.json();
      setRephrased(data.rephrased || input + ' (rephrased)');
    } catch (error) {
      console.error('Rephrase error:', error);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('http://localhost:4000/api/save', {
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
    <div className="screen-container">
      <h1 className="mantra-text">{rephrased}</h1>
      <textarea
        className="mantra-input"
        rows="4"
        placeholder="Write your version here or write "
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <div className="button-group">
        <button className="btn rephrase" onClick={handleRephrase}>🔄 Rephrase</button>
        <button className="btn rephrase" onClick={handleRephraseAI}>🔄 Rephrase with AI</button>
        <button className="btn save" onClick={handleSave}>💾 Save</button>
        <button className="btn back" onClick={onBack}>🔙 Back</button>
      </div>
    </div>
  );
}
