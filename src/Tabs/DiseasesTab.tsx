import React, { useState } from 'react';
import { SEVERITY_CONFIG } from '../Resources/Constants';
import { Emoji } from '../Resources/Emoji';
import type { PlantProfileContentUpdate } from '../Resources/GardenData';
import type { Disease, Plant } from '../Resources/Types';
import Button from '../Components/Button';
import CustomPlantInfoEditor from '../Components/CustomPlantInfoEditor';

const DiseaseCard: React.FC<{ disease: Disease; accent: string }> = ({ disease, accent }) => {
  const [open, setOpen] = useState(false);
  const severity = SEVERITY_CONFIG[disease.severity];
  return (
    <div
      onClick={() => setOpen(current => !current)}
      style={{
        background: open ? severity.bg : '#F5F9F0',
        border: `1.5px solid ${open ? severity.border : '#E0ECD0'}`,
        borderRadius: 14, padding: '11px 14px', cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2A4A1A', lineHeight: 1.35, flex: 1 }}>{disease.symptom}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: severity.color, background: severity.bg, border: `1px solid ${severity.border}`, borderRadius: 20, padding: '2px 7px', whiteSpace: 'nowrap' }}>
            {severity.label}
          </span>
          <span style={{ fontSize: 14, color: accent, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>{Emoji.chevronDown}</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#7A6A2A', marginBottom: 3 }}>{Emoji.magnifyingGlass} Cause</div>
            <div style={{ fontSize: 14, color: '#5A4A1A', lineHeight: 1.5 }}>{disease.cause}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '9px 12px', borderLeft: `3px solid ${accent}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 4 }}>{Emoji.pill} How to Fix</div>
            <div style={{ fontSize: 14, color: '#2A4A1A', lineHeight: 1.55 }}>{disease.fix}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const DiseasesTab: React.FC<{ plant: Plant; onSavePlantContent: (update: PlantProfileContentUpdate) => Promise<boolean> }> = ({ plant, onSavePlantContent }) => {
  const [editing, setEditing] = useState(false);
  // Use the shared editor for built-in profiles without changing their catalog defaults.
  if (editing) return <CustomPlantInfoEditor plant={plant} section="diseases" onSave={onSavePlantContent} onCancel={() => setEditing(false)} />;
  if (plant.isCustom && !plant.customInfo?.diseases) return (
    <div role="status" style={{ padding: 18, borderRadius: 12, background: '#F5F9F0', color: '#5A7A4A', fontSize: 14, textAlign: 'center' }}>
      <div style={{ marginBottom: 10 }}>Disease information has not been added for this plant yet.</div>
      <Button onClick={() => setEditing(true)} icon={Emoji.plus} color="#4A8C3A">Add information</Button>
    </div>
  );
  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button onClick={() => setEditing(true)} icon={Emoji.edit} color="#4A8C3A">Edit information</Button>
    </div>
    <div style={{ fontSize: 14, color: '#7A9A6A', marginBottom: 2 }}>Tap a symptom to see the cause and fix.</div>
    {plant.diseases.map((disease, index) => <DiseaseCard key={index} disease={disease} accent={plant.accent} />)}
  </div>
  );
};

export default DiseasesTab;
