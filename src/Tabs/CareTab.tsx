import React, { useState } from 'react';
import { Emoji } from '../Resources/Emoji';
import type { PlantProfileContentUpdate } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import Button from '../Components/Button';
import CustomPlantInfoEditor from '../Components/CustomPlantInfoEditor';

const WaterDroplet: React.FC<{ ml: number; maxMl?: number; color: string; accent: string }> = ({ ml, maxMl = 1000, color, accent }) => {
  const pct = Math.min(ml / maxMl, 1);
  const dropH = 54;
  const fillH = Math.round(dropH * pct);
  const fillY = 10 + (dropH - fillH);
  const id = `drop-${ml}-${accent.replace('#', '')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="52" height="72" viewBox="0 0 52 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs><clipPath id={id}><path d="M26 4 C26 4 6 30 6 46 C6 58 15 66 26 66 C37 66 46 58 46 46 C46 30 26 4 26 4 Z" /></clipPath></defs>
        <path d="M26 4 C26 4 6 30 6 46 C6 58 15 66 26 66 C37 66 46 58 46 46 C46 30 26 4 26 4 Z" fill="#E8F4FC" stroke="#B0D8EC" strokeWidth="1.5" />
        {ml > 0 && <rect x="0" y={fillY} width="52" height={fillH + 10} fill={color} opacity="0.75" clipPath={`url(#${id})`} />}
        {ml > 0 && pct < 0.99 && <path d={`M6 ${fillY} Q16 ${fillY - 5} 26 ${fillY} Q36 ${fillY + 5} 46 ${fillY}`} fill="none" stroke={color} strokeWidth="2" opacity="0.9" clipPath={`url(#${id})`} />}
        <ellipse cx="19" cy="36" rx="4" ry="7" fill="rgba(255,255,255,0.35)" transform="rotate(-20 19 36)" />
        <path d="M26 4 C26 4 6 30 6 46 C6 58 15 66 26 66 C37 66 46 58 46 46 C46 30 26 4 26 4 Z" fill="none" stroke={accent} strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize: 14, fontWeight: 700, color: ml === 0 ? '#A0B8C8' : accent }}>{ml === 0 ? '—' : `${ml} ml`}</div>
      <div style={{ fontSize: 14, color: '#8AA8B8', textAlign: 'center', maxWidth: 52 }}>{ml === 0 ? 'no water' : 'per session'}</div>
    </div>
  );
};

const CareTab: React.FC<{ plant: Plant; onSavePlantContent: (update: PlantProfileContentUpdate) => Promise<boolean> }> = ({ plant, onSavePlantContent }) => {
  const [editing, setEditing] = useState(false);
  // Use the same form to edit built-in guidance while retaining its starting content.
  if (editing) return <CustomPlantInfoEditor plant={plant} section="care" onSave={onSavePlantContent} onCancel={() => setEditing(false)} />;
  if (plant.isCustom && !plant.customInfo?.care) return (
    <div role="status" style={{ padding: 18, borderRadius: 12, background: '#F5F9F0', color: '#5A7A4A', fontSize: 14, textAlign: 'center' }}>
      <div style={{ marginBottom: 10 }}>Care information has not been added for this plant yet.</div>
      <Button onClick={() => setEditing(true)} icon={Emoji.plus} color="#4A8C3A">Add information</Button>
    </div>
  );
  return (
  <div>
    {plant.details.warning && (
      <div style={{ background: '#FFF8E8', border: '1.5px solid #FFD080', borderRadius: 12, padding: '9px 13px', marginBottom: 13, fontSize: 14, color: '#7A5010' }}>
        {Emoji.warning} {plant.details.warning}
      </div>
    )}
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 10 }}>{Emoji.droplet} Watering</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#F0F9FF', borderRadius: 14, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#4A8AAA', marginBottom: 2 }}>{Emoji.sun} Summer</div>
          <WaterDroplet ml={plant.details.watering.summerMl} maxMl={1000} color="#7BBFDF" accent="#3A80AA" />
          <div style={{ fontSize: 14, color: '#2A5A7A', textAlign: 'center', lineHeight: 1.4 }}>{plant.details.watering.summer}</div>
        </div>
        <div style={{ background: '#F0F4FF', borderRadius: 14, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#5A5AAA', marginBottom: 2 }}>{Emoji.snowflake} Winter</div>
          <WaterDroplet ml={plant.details.watering.winterMl} maxMl={1000} color="#9090D0" accent="#4A4A9A" />
          <div style={{ fontSize: 14, color: '#2A2A6A', textAlign: 'center', lineHeight: 1.4 }}>{plant.details.watering.winter}</div>
        </div>
      </div>
          {!plant.isCustom && <div style={{ background: '#F0F7E8', border: '1px solid #C8E0B0', borderRadius: 10, padding: '7px 12px', marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{Emoji.lightBulb}</span>
        <span style={{ fontSize: 14, color: '#3A6A2A', lineHeight: 1.5 }}>Amounts are per session based on pot size. The most reliable method: <strong>water until it drains from the bottom</strong>, then don't water again until the soil is dry.</span>
          </div>}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 13 }}>
      <div style={{ background: '#FFF9F0', borderRadius: 10, padding: '9px 11px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: plant.accent, marginBottom: 3 }}>{Emoji.sun} Light</div>
        <div style={{ fontSize: 14, color: '#3A5A2A' }}>{plant.details.light}</div>
      </div>
      <div style={{ background: '#F0F8FF', borderRadius: 10, padding: '9px 11px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: plant.accent, marginBottom: 3 }}>{Emoji.thermometer} Temp</div>
        <div style={{ fontSize: 14, color: '#3A5A2A' }}>{plant.details.temp}</div>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 7 }}>{Emoji.clipboard} Care Notes</div>
      {plant.details.tips.map((tip, index) => (
        <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, color: '#3A5A2A', marginBottom: 5 }}>
          <span style={{ color: plant.accent, flexShrink: 0 }}>→</span><span>{tip}</span>
        </div>
      ))}
    </div>
    {/* Keep the edit action at the bottom-right after all care guidance. */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
      <Button onClick={() => setEditing(true)} icon={Emoji.edit} color="#4A8C3A">Edit information</Button>
    </div>
  </div>
  );
};

export default CareTab;
