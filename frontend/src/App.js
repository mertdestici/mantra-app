import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import MantraScreen from './components/MantraScreen';
import RephraseScreen from './components/RephraseScreen';
import PlayerScreen from './components/PlayerScreen';
import './App.css';


export default function App() {
  const [screen, setScreen] = useState('menu');
  const [currentMantra, setCurrentMantra] = useState('');
  const [currentMantraId, setCurrentMantraId] = useState(null); // ilk başta ID boş

  return (
    <div className="app-container">
      {screen === 'menu' && (
        <MainMenu
          onGoToMantra={() => setScreen('mantra')}
          onGoToPlayer={() => setScreen('player')}
        />
      )}

      {screen === 'mantra' && (
        <MantraScreen
          mantra={currentMantra}
          setMantra={setCurrentMantra}
          mantraId={currentMantraId}
          setMantraId={setCurrentMantraId}
          onRephrase={() => setScreen('rephrase')}
          onBackToMenu={() => setScreen('menu')}
        />
      )}

      {screen === 'rephrase' && (
        <RephraseScreen
          originalMantra={currentMantra}
          mantraId={currentMantraId}
          onBack={() => setScreen('mantra')}
          onSave={(updatedMantra) => {
            setCurrentMantra(updatedMantra);
            setScreen('mantra');
          }}
        />
      )}

      {screen === 'player' && (
        <PlayerScreen onBackToMenu={() => setScreen('menu')} />
      )}
    </div>
  );
}
