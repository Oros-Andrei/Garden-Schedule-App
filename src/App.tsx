import React, { useState } from 'react';
import { CATEGORIES, PLANTS } from './Resources/Constants';
import type { CareEvent, GardenData, PlantSetup, SavedPlant } from './Resources/GardenData';
import GardenCalendar from './Components/GardenCalendar';
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

  const createBrowserBackup = (): GardenData => {
    const plants: SavedPlant[] = PLANTS.flatMap(plant => {
      let savedSetup: Partial<PlantSetup> = {};
      let savedSoil: string | null = null;
      let careEvents: CareEvent[] = [];
      try {
        const setupValue = localStorage.getItem(`garden-setup-${plant.id}`);
        if (setupValue) savedSetup = JSON.parse(setupValue) as Partial<PlantSetup>;
        savedSoil = localStorage.getItem(`garden-soil-${plant.id}`);
        const careValue = localStorage.getItem(`garden-care-events-${plant.id}`);
        if (careValue) careEvents = JSON.parse(careValue) as CareEvent[];
      } catch {
        // Skip malformed browser records; the original browser data remains untouched.
        return [];
      }

      if (!Object.keys(savedSetup).length && !savedSoil && careEvents.length === 0) return [];

      const setup: PlantSetup = {
        substrate: typeof savedSetup.substrate === 'string' ? savedSetup.substrate : savedSoil ?? 'General',
        potType: typeof savedSetup.potType === 'string' ? savedSetup.potType : 'Custom',
        potMaterial: typeof savedSetup.potMaterial === 'string' ? savedSetup.potMaterial : plant.pot,
        potSize: typeof savedSetup.potSize === 'string' ? savedSetup.potSize : plant.potSize,
        pottedOn: typeof savedSetup.pottedOn === 'string' ? savedSetup.pottedOn : '',
        repotted: typeof savedSetup.repotted === 'string' ? savedSetup.repotted : '',
      };

      return [{ id: plant.id, name: plant.name, source: 'built-in', setup, careEvents, photo: null, icon: null }];
    });

    return { formatVersion: 1, plants };
  };

  const exportGardenData = async () => {
    try {
      const backup = await window.gardenDesktop?.load() ?? createBrowserBackup();
      const content = new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: 'application/json' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'garden-data.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Unable to export the garden data file.', error);
      window.alert('Garden data could not be exported.');
    }
  };

  const importGardenData = async () => {
    if (!window.gardenDesktop) return;
    if (!window.confirm('Import a garden backup? Matching plant records in this app will be replaced by the backup.')) return;
    try {
      const imported = await window.gardenDesktop.importData();
      if (!imported) return;
      window.location.reload();
    } catch (error) {
      console.error('Unable to import the garden data file.', error);
      window.alert('That garden data file could not be imported. Your current data was left unchanged.');
    }
  };

  const openGardenDataFolder = async () => {
    try {
      const error = await window.gardenDesktop?.openDataFolder();
      if (error) window.alert(`Could not open the garden data folder: ${error}`);
    } catch (error) {
      console.error('Unable to open the garden data folder.', error);
    }
  };

  return (
    <div style={{
      fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
      background: 'linear-gradient(135deg,#F0F7E8 0%,#E8F4E0 50%,#F5EFE0 100%)',
      minHeight: '100vh',
    }}>
      <style>{`
        html { scrollbar-gutter: stable; }
        @media (min-width: 800px) {
          .garden-layout { display: flex !important; align-items: flex-start; gap: 24px; padding: 0 32px 32px !important; width: 100%; max-width: none !important; }
          .garden-sidebar { width: 40%; min-width: 320px; max-width: 560px; flex-shrink: 0; padding-top: 0 !important; }
          .garden-plant-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .garden-detail  { flex: 1; min-width: 0; margin: 0 !important; position: sticky; top: 20px; }
          .garden-empty   { flex: 1; min-width: 0; min-height: 400px; }
        }
        @media (max-width: 799px) {
          .garden-detail  { margin: 16px 14px 28px !important; }
          .garden-empty   { display: block !important; margin: 16px 14px 28px; }
        }
        .setup-calendar-layout { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: start; }
        @media (min-width: 800px) {
          .setup-calendar-layout { grid-template-columns: minmax(320px, 35fr) minmax(0, 65fr); align-items: center; }
        }
        .setup-grid { display: grid; grid-template-columns: max-content minmax(0, 1fr); column-gap: 10px; row-gap: 14px; align-items: center; }
        @media (max-width: 480px) {
          .setup-grid { grid-template-columns: max-content minmax(0, 1fr); column-gap: 6px; row-gap: 12px; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: '28px 20px 18px' }}>
        <h1 style={{ fontSize: 26, color: '#2A4A1A', margin: 0 }}>Plant Care Guide</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={exportGardenData} style={{ cursor: 'pointer', border: '1px solid #B8D0A8', borderRadius: 8, background: '#FFFFFFCC', color: '#3A5A2A', padding: '6px 10px', font: 'inherit', fontSize: 13 }}>
            Export JSON backup
          </button>
          {window.gardenDesktop && (
            <>
              <button type="button" onClick={importGardenData} style={{ cursor: 'pointer', border: '1px solid #B8D0A8', borderRadius: 8, background: '#FFFFFFCC', color: '#3A5A2A', padding: '6px 10px', font: 'inherit', fontSize: 13 }}>
                Import JSON backup
              </button>
              <button type="button" onClick={openGardenDataFolder} style={{ cursor: 'pointer', border: '1px solid #B8D0A8', borderRadius: 8, background: '#FFFFFFCC', color: '#3A5A2A', padding: '6px 10px', font: 'inherit', fontSize: 13 }}>
                Open data folder
              </button>
            </>
          )}
        </div>
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
            <GardenCalendar />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
