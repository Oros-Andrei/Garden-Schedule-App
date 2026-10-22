import React, { useState } from 'react';
import { CATEGORIES, PLANTS, TABS } from './Constants';
import type { Plant, TabId } from './types';
import CareTab from './Tabs/CareTab';
import DiseasesTab from './Tabs/DiseasesTab';
import FertilizerTab from './Tabs/FertilizerTab';
import SetupTab, { loadPlantSetup, type PlantSetup } from './Tabs/SetupTab';
import TricksTab from './Tabs/TricksTab';

// ─── PLANT DETAIL PANEL ───────────────────────────────────────────────────────
const PlantDetail: React.FC<{ plant: Plant; onClose: () => void }> = ({ plant, onClose }) => {
  const [tab, setTab] = useState<TabId>(0);
  const [setup, setSetup] = useState<PlantSetup>(() => loadPlantSetup(plant));
  const [editingSetup, setEditingSetup] = useState(false);
  const [setupDraft, setSetupDraft] = useState<PlantSetup>(setup);

  const saveSetup = () => {
    const updatedSetup = {
      ...setupDraft,
      potMaterial: setupDraft.potMaterial.trim(),
      potSize: setupDraft.potSize.trim(),
    };
    setSetup(updatedSetup);
    try {
      localStorage.setItem(`garden-setup-${plant.id}`, JSON.stringify(updatedSetup));
    } catch { /* Keep the edits for this session if browser storage is unavailable. */ }
    setEditingSetup(false);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.93)', borderRadius: 22,
      border: `2px solid ${plant.color}`, boxShadow: `0 8px 32px ${plant.color}55`,
      overflow: 'visible',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg,${plant.color},${plant.accent}22)`,
        padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 12,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
      }}>
        <div style={{ width: 54, height: 54, flexShrink: 0 }}>
          <plant.icon accent={plant.accent} />
        </div>
        <div>
          <div className="plant-name" style={{ fontSize: 18, color: '#1A3A0A' }}>{plant.name}</div>
          <div style={{ fontSize: 14, color: '#5A7A4A', fontStyle: 'italic', marginTop: 1 }}>{plant.latin}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '2px 8px', fontSize: 14, color: '#4A6A3A' }}>
              🏺 {setup.potType}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '2px 8px', fontSize: 14, color: '#4A6A3A' }}>
              📏 {setup.potSize}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close plant profile"
          title="Close plant profile"
          style={{
            marginLeft: 'auto', alignSelf: 'flex-start', flexShrink: 0,
            width: 34, height: 34, border: '1px solid rgba(80,80,80,0.2)',
            borderRadius: '50%', background: 'rgba(255,255,255,0.75)',
            color: '#4A5A3A', fontSize: 22, lineHeight: 1, cursor: 'pointer',
          }}
        >×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #E8F0E0' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'rgba(255,255,255,1)' : 'rgba(240,247,234,0.6)',
            borderBottom: tab === t.id ? `2.5px solid ${plant.accent}` : '2.5px solid transparent',
            fontSize: 14, fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? plant.accent : '#7A9A6A',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 18px 18px' }}>

        {tab === 0 && (
          <SetupTab
            plant={plant}
            setup={setup}
            setupDraft={setupDraft}
            editing={editingSetup}
            onEdit={() => {
              setSetupDraft({ ...setup });
              setEditingSetup(true);
            }}
            onChange={changes => setSetupDraft(current => ({ ...current, ...changes }))}
            onSave={saveSetup}
            onCancel={() => setEditingSetup(false)}
          />
        )}
        {tab === 1 && <CareTab plant={plant} />}
        {tab === 2 && <FertilizerTab plant={plant} />}
        {tab === 3 && <TricksTab plant={plant} />}
        {tab === 4 && <DiseasesTab plant={plant} />}

      </div>
    </div>
  );
};

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
