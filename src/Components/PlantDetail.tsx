import React, { useState } from 'react';
import { TABS } from '../Resources/Constants';
import type { Plant, TabId } from '../Resources/Types';
import CareTab from '../Tabs/CareTab';
import DiseasesTab from '../Tabs/DiseasesTab';
import FertilizerTab from '../Tabs/FertilizerTab';
import SetupTab, { loadPlantSetup, type PlantSetup } from '../Tabs/SetupTab';
import TricksTab from '../Tabs/TricksTab';

interface PlantDetailProps {
  plant: Plant;
  onClose: () => void;
}

const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onClose }) => {
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

export default PlantDetail;
