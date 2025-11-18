import React from 'react';

export default function MainMenu({ onGoToMantra, onGoToPlayer, onGoToAll }) {
  return (
    <div className="screen-container main-menu">
      <div className="screen-header">
        <div>
          <p className="eyebrow">Mantra Studio</p>
          <h1 className="screen-title">Design your ritual</h1>
          <p className="screen-subtitle">
            Discover mantras that feed your mind, rest in the sound chamber, and rebuild your words with intention.
          </p>
        </div>
      </div>

      <div className="menu-actions">
        <button className="btn like wide" onClick={onGoToMantra}>
          <span>Mantra Flow</span>
          <span className="btn-subtext">Receive new suggestions and pick your favorites</span>
        </button>
        <button className="btn rephrase wide" onClick={onGoToPlayer}>
          <span>Sound Chamber</span>
          <span className="btn-subtext">Meditation music and mantra recordings</span>
        </button>
        <button className="btn save wide" onClick={onGoToAll}>
          <span>All Mantras</span>
          <span className="btn-subtext">Open the full library</span>
        </button>
      </div>
    </div>
  );
}
