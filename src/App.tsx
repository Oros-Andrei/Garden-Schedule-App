import React, { useState } from 'react';
import { CATEGORIES, PLANTS } from './Resources/Constants';
import PlantDetail from './Components/PlantDetail';

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [openCats,   setOpenCats]     = useState<Record<string, boolean>>({
    succulents: true, tropicals: true, citrus: true, vegetables: true,
  });

  const selectedPlant = PLANTS.find(p => p.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const toggleCat = (id: string) => {
    setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{
      fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
      background: 'linear-gradient(135deg,#F0F7E8 0%,#E8F4E0 50%,#F5EFE0 100%)',
      minHeight: '100vh',
    }}>
      <style>{`
        @media (min-width: 800px) {
          .garden-layout { display: flex !important; align-items: flex-start; gap: 24px; padding: 0 32px 32px !important; width: 100%; max-width: none !important; }
          .garden-sidebar { width: 40%; min-width: 320px; max-width: 560px; flex-shrink: 0; padding-top: 0 !important; }
          .garden-plant-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .garden-detail  { flex: 1; min-width: 0; margin: 0 !important; position: sticky; top: 20px; }
          .garden-empty   { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 400px; }
        }
        @media (max-width: 799px) {
          .garden-detail  { margin: 16px 14px 28px !important; }
          .garden-empty   { display: none !important; }
        }
        .setup-grid { display: grid; grid-template-columns: max-content minmax(0, 1fr); column-gap: 10px; row-gap: 14px; align-items: center; }
        @media (max-width: 480px) {
          .setup-grid { grid-template-columns: max-content minmax(0, 1fr); column-gap: 6px; row-gap: 12px; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: '28px 20px 18px' }}>
        <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', color: '#7A9A6A', marginBottom: 6 }}>
          Andrei's Garden
        </div>
        <h1 style={{ fontSize: 26, color: '#2A4A1A', margin: 0 }}>Plant Care Guide</h1>
      </div>

      {/* ── Two-column layout ── */}
      <div className={`garden-layout${selectedPlant ? ' has-selection' : ''}`} style={{ padding: '0 14px 32px', maxWidth: 480, margin: '0 auto' }}>

        {/* LEFT — categories + plant grid */}
        <div className="garden-sidebar" style={{ paddingTop: 0 }}>
          {CATEGORIES.map(cat => {
            const catPlants = PLANTS.filter(p => p.category === cat.id);
            if (!catPlants.length) return null;
            const isOpen = openCats[cat.id];

            return (
              <div key={cat.id} style={{ marginBottom: 18 }}>
                <button
                  onClick={() => toggleCat(cat.id)}
                  style={{
                    width: '100%', background: cat.bg, border: 'none', borderRadius: 14,
                    padding: '9px 14px', marginBottom: isOpen ? 10 : 0,
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</span>
                  <span style={{ fontSize: 14, color: cat.color, opacity: 0.7, marginLeft: 'auto' }}>
                    {catPlants.length} plant{catPlants.length > 1 ? 's' : ''}
                  </span>
                  <span style={{
                    fontSize: 14, color: cat.color,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s', display: 'inline-block',
                  }}>▾</span>
                </button>

                {isOpen && (
                  <div className="garden-plant-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {catPlants.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        style={{
                          background: selectedId === p.id ? p.color : 'rgba(255,255,255,0.85)',
                          border: `2.5px solid ${selectedId === p.id ? p.accent : 'rgba(120,160,90,0.2)'}`,
                          borderRadius: 18, padding: '11px 6px 9px', cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: selectedId === p.id ? `0 4px 18px ${p.color}99` : '0 2px 8px rgba(0,0,0,0.05)',
                          transform: selectedId === p.id ? 'scale(1.04)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        }}
                      >
                        <div style={{ width: 58, height: 58 }}><p.icon accent={p.accent} /></div>
                        <div style={{
                          fontSize: 14, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
                          color: selectedId === p.id ? p.accent : '#3A5A2A',
                        }}>
                          {p.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — detail panel or empty state */}
        {selectedPlant ? (
          <div className="garden-detail">
            <PlantDetail key={selectedPlant.id} plant={selectedPlant} onClose={() => setSelectedId(null)} />
          </div>
        ) : (
          <div className="garden-empty">
            <div style={{ textAlign: 'center', opacity: 0.4 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
              <div style={{ fontSize: 14, color: '#3A5A2A', fontStyle: 'italic' }}>
                Select a plant to see its care details
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
