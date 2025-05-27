import React, { useEffect, useRef, useState } from 'react';

export default function PlayerScreen({ onBackToMenu }) {
  const bgAudioRef = useRef(null);
  const mantraAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        const response = await fetch('http://localhost:4000/api/mantra/audio');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audio.src = url;
        await audio.play();
      } catch (error) {
        console.error('Mantra sesi yüklenemedi:', error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="screen-container" style={{ textAlign: 'center', padding: '40px', position: 'relative' }}>
      <h1 style={{ marginBottom: '30px' }}>🎧 Mantra Player</h1>

      {/* Sağ üst susturma butonu */}
      <button
        className="btn rephrase"
        onClick={toggleMute}
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        {isMuted ? '🔇' : '🔈'}
      </button>

      {/* Ortadaki oynat/duraklat butonu */}
      <button
        className="btn like"
        style={{ fontSize: '24px', padding: '20px 40px', marginBottom: '40px' }}
        onClick={toggleMantra}
      >
        {isPlaying ? '⏸ Duraklat' : '▶️ Oynat'}
      </button>

      {/* Geri dönme butonu */}
      <div>
        <button className="btn back" onClick={onBackToMenu}>🔙 Ana Menüye Dön</button>
      </div>

      {/* Ses elemanları */}
      <audio ref={bgAudioRef} src="/audio/background.mp3" preload="auto" />
      <audio ref={mantraAudioRef} preload="auto" />
    </div>
  );
}
