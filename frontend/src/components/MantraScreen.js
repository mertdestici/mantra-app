import React, { useEffect, useCallback } from 'react';

export default function MantraScreen({ mantra, setMantra, mantraId, setMantraId, onRephrase, onBackToMenu }) {
  const getNewMantra = useCallback(async (afterId = 0) => {
    try {
      if (afterId == null || isNaN(afterId)) afterId = 1;
      const res = await fetch(`http://localhost:4000/api/mantras/next/${afterId}`);
      if (!res.ok) throw new Error("Yeni mantra bulunamadı.");

      const data = await res.json();
      setMantra(data.content);
      setMantraId(data.id);
    } catch (err) {
      console.error("Yeni mantra getirilemedi:", err);
      setMantra("Başka mantra kalmadı.");
    }
  }, [setMantra, setMantraId]);

  const handleDislike = async () => {
    if (!mantraId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/mantras/${mantraId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Silme başarısız");
      getNewMantra(mantraId);
    } catch (err) {
      console.error("Mantra silinemedi:", err);
      setMantra("Silme sırasında hata oluştu.");
    }
  };

  useEffect(() => {
    if (!mantra) {
      getNewMantra(mantraId || 0);
    }
  }, [mantra, mantraId, getNewMantra]); // sadece ilk kez

  return (
    <div className="screen-container">
      <h1 className="mantra-text">{mantra}</h1>
      <div className="button-group">
        <button className="btn like" onClick={() => getNewMantra(mantraId)}>👍 Like</button>
        <button className="btn dislike" onClick={handleDislike}>👎 Dislike</button>
        <button className="btn rephrase" onClick={onRephrase}>✏️ Rephrase</button>
      </div>
      <div style={{ marginTop: '40px' }}>
        <button className="btn back" onClick={onBackToMenu}>🔙 Ana Menüye Dön</button>
      </div>
    </div>
  );
}
