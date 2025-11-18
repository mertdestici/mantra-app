import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import MantraScreen from './components/MantraScreen';
import RephraseScreen from './components/RephraseScreen';
import PlayerScreen from './components/PlayerScreen';
import AddMantraScreen from './components/AddMantraScreen';
import AllMantrasScreen from './components/AllMantrasScreen';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [currentMantra, setCurrentMantra] = useState('');
  const [currentMantraId, setCurrentMantraId] = useState(null); // no mantra selected initially

  const handleMantraCreated = (newMantra) => {
    setCurrentMantra(newMantra.content);
    setCurrentMantraId(newMantra.id);
    setScreen('mantra');
  };

  return (
    <div className="app-container">
      {screen === 'menu' && (
        <MainMenu
          onGoToMantra={() => setScreen('mantra')}
          onGoToPlayer={() => setScreen('player')}
          onGoToAll={() => setScreen('allMantras')}
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
          onAddNewMantra={() => setScreen('addMantra')}
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

      {screen === 'addMantra' && (
        <AddMantraScreen onBack={() => setScreen('mantra')} onCreated={handleMantraCreated} />
      )}

      {screen === 'allMantras' && <AllMantrasScreen onBack={() => setScreen('menu')} />}

      {screen === 'player' && <PlayerScreen onBackToMenu={() => setScreen('menu')} />}
    </div>
  );
}
