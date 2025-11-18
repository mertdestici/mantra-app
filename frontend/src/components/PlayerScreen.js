import React, { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../utils/api';

export default function PlayerScreen({ onBackToMenu }) {
  const bgAudioRef = useRef(null);
  const mantraAudioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.volume = 0.1;
      bgAudio.loop = true;
      bgAudio.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const audio = mantraAudioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [isSeeking]);

  const toggleMute = () => {
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const loadMantraAudio = async () => {
    setIsLoadingAudio(true);
    setErrorMessage('');
    try {
      const response = await fetch(apiUrl('/api/mantra/audio'));
      if (!response.ok) throw new Error('Unable to fetch mantra audio.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      audioUrlRef.current = url;

      const audio = mantraAudioRef.current;
      if (audio) {
        audio.src = url;
        setAudioReady(true);
        setDuration(0);
        setCurrentTime(0);
      }
    } catch (error) {
      setAudioReady(false);
      setErrorMessage(error.message || 'Mantra audio could not be loaded.');
      throw error;
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playMantra = async ({ restart = false } = {}) => {
    const audio = mantraAudioRef.current;
    if (!audio || isLoadingAudio) return;

    try {
      if (!audioReady) {
        await loadMantraAudio();
      }
      if (restart) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      await audio.play();
      setIsPlaying(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Mantra audio could not be played:', error);
      setIsPlaying(false);
      setErrorMessage(error.message || 'Mantra audio could not be played.');
    }
  };

  const pauseMantra = () => {
    const audio = mantraAudioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseMantra();
    } else {
      playMantra();
    }
  };

  const skipMantra = (seconds) => {
    const audio = mantraAudioRef.current;
    if (!audio || !audioReady) return;
    const nextTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration || audio.currentTime);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekChange = (event) => {
    const value = parseFloat(event.target.value);
    setCurrentTime(value);
  };
  const handleSeekEnd = (event) => {
    const audio = mantraAudioRef.current;
    if (!audio) return;
    const value = parseFloat(event.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
    setIsSeeking(false);
  };

  const formatTime = (value) => {
    if (!Number.isFinite(value)) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
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
          <p className="card-value">
            {isLoadingAudio ? 'Loading' : isPlaying ? 'Playing' : audioReady ? 'Ready' : 'Idle'}
          </p>

          <div className="player-progress">
            <span className="timestamp">{formatTime(currentTime)}</span>
            <input
              className="progress-input"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              disabled={!audioReady && !isPlaying}
            />
            <span className="timestamp">{formatTime(duration)}</span>
          </div>

          <div className="transport-controls">
            <button className="transport-btn" onClick={() => skipMantra(-10)} disabled={!audioReady}>
              <span className="icon">⏪</span>
              <span>-10s</span>
            </button>
            <button className={`play-btn ${isPlaying ? 'active' : ''}`} onClick={togglePlayPause} disabled={isLoadingAudio && !audioReady}>
              {isLoadingAudio && !audioReady ? (
                <span className="spinner" />
              ) : (
                <span className="icon">{isPlaying ? '❚❚' : '▶'}</span>
              )}
            </button>
            <button className="transport-btn" onClick={() => skipMantra(10)} disabled={!audioReady}>
              <span>+10s</span>
              <span className="icon">⏩</span>
            </button>
            <button
              className="transport-btn ghost"
              onClick={() => playMantra({ restart: true })}
              disabled={isLoadingAudio || (!audioReady && !isPlaying)}
            >
              ↺ Start
            </button>
          </div>

          {errorMessage && (
            <div className="hint" style={{ color: '#ff6b6b', marginTop: '12px' }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      <audio ref={bgAudioRef} src="/audio/background.mp3" preload="auto" />
      <audio ref={mantraAudioRef} preload="auto" />
    </div>
  );
}
