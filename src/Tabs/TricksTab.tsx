import React, { useState } from 'react';
import { Emoji } from '../Resources/Emoji';
import type { PlantProfileContentUpdate } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import Button from '../Components/Button';
import CustomPlantInfoEditor from '../Components/CustomPlantInfoEditor';

const TricksTab: React.FC<{ plant: Plant; onSavePlantContent: (update: PlantProfileContentUpdate) => Promise<boolean> }> = ({ plant, onSavePlantContent }) => {
  const [editing, setEditing] = useState(false);
  // Use the shared editor for built-in profiles without changing their catalog defaults.
  if (editing) return <CustomPlantInfoEditor plant={plant} section="tricks" onSave={onSavePlantContent} onCancel={() => setEditing(false)} />;
  if (plant.isCustom && !plant.customInfo?.tricks) return (
    <div role="status" style={{ padding: 18, borderRadius: 12, background: '#F5F9F0', color: '#5A7A4A', fontSize: 14, textAlign: 'center' }}>
      <div style={{ marginBottom: 10 }}>Plant tricks have not been added for this plant yet.</div>
      <Button onClick={() => setEditing(true)} icon={Emoji.plus} color="#4A8C3A">Add information</Button>
    </div>
  );
  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button onClick={() => setEditing(true)} icon={Emoji.edit} color="#4A8C3A">Edit information</Button>
    </div>
    {plant.tricks.map((trick, index) => (
      <div key={index} style={{ background: '#F5F9F0', borderRadius: 14, padding: '12px 14px', borderLeft: `4px solid ${plant.accent}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 18 }}>{trick.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: plant.accent }}>{trick.title}</span>
        </div>
        <div style={{ fontSize: 14, color: '#3A5A2A', lineHeight: 1.55 }}>{trick.body}</div>
      </div>
    ))}
  </div>
  );
};

export default TricksTab;
