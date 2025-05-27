import React from 'react';

export default function MainMenu({ onGoToMantra, onGoToPlayer }) {
  return (
    <div className="screen-container" style={{ textAlign: 'center', padding: '50px' }}>
      <h1 className="mantra-text" style={{ fontSize: '32px', marginBottom: '40px' }}>
        Sertlaç Mantra App
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', margin: '0 auto' }}>
        <button className="btn like" onClick={onGoToMantra}>🧘 Go to Mantras</button>
        <button className="btn rephrase" onClick={onGoToPlayer}>🎧 Go to Player</button>
      </div>
    </div>
  );
}
