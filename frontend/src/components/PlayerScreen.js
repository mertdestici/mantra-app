import React, { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../utils/api';

export default function PlayerScreen({ onBackToMenu }) {
  const bgAudioRef = useRef(null);
  const mantraAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.volume = 0.1;
      bgAudio.loop = true;
      bgAudio.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleMantra = async () => {
    const audio = mantraAudioRef.current;
    if (!audio || isLoadingAudio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const response = await fetch(apiUrl('/api/mantra/audio'));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audio.src = url;
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Mantra audio could not be loaded:', error);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="screen-container player-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">Sound Chamber</p>
          <h1 className="screen-title">Mantra Player</h1>
          <p className="screen-subtitle">
            Control the background layers and tap once to hear the latest recording.
          </p>
        </div>
        <button className="btn ghost" onClick={onBackToMenu}>
          Main Menu
        </button>
      </div>

      <div className="player-panels">
        <div className="mantra-card audio-card">
          <span className="card-title">Background Music</span>
          <p className="card-value">{isMuted ? 'Muted' : 'Active'}</p>
          <button className="btn outline" onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        <div className="mantra-card audio-card emphasis">
          <span className="card-title">Mantra Playback</span>
          <p className="card-value">{isLoadingAudio ? 'Loading' : isPlaying ? 'Playing' : 'Ready'}</p>
          <button className="btn like" onClick={toggleMantra} disabled={isLoadingAudio}>
            {isLoadingAudio ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      <audio ref={bgAudioRef} src="/audio/background.mp3" preload="auto" />
      <audio ref={mantraAudioRef} preload="auto" />
    </div>
  );
}
