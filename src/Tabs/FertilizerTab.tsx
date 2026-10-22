import React from 'react';
import type { Plant } from '../types';

const NPKBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#5A7A4A' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#5A7A4A' }}>{value}%</span>
    </div>
    <div style={{ height: 8, background: '#E8F0E0', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

const FertilizerTab: React.FC<{ plant: Plant }> = ({ plant }) => {
  const maxNPK = Math.max(plant.fertilizer.npk.n, plant.fertilizer.npk.p, plant.fertilizer.npk.k, 30);

  return (
    <div>
      <div style={{ background: '#F5F9F0', borderRadius: 14, padding: '12px 14px', marginBottom: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent }}>🧪 NPK Ratio</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: plant.accent, letterSpacing: 1 }}>{plant.fertilizer.npkLabel}</div>
        </div>
        <NPKBar label="N — Nitrogen (leaves & growth)" value={plant.fertilizer.npk.n} max={maxNPK} color="#5A9E4A" />
        <NPKBar label="P — Phosphorus (roots & flowers)" value={plant.fertilizer.npk.p} max={maxNPK} color="#E07820" />
        <NPKBar label="K — Potassium (immunity & stems)" value={plant.fertilizer.npk.k} max={maxNPK} color="#7BAFD4" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 4 }}>🧴 Fertilizer Type</div>
        <div style={{ fontSize: 14, color: '#3A5A2A', fontWeight: 600 }}>{plant.fertilizer.type}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 4 }}>📅 Schedule</div>
        <div style={{ fontSize: 14, color: '#3A5A2A' }}>{plant.fertilizer.schedule}</div>
      </div>
      <div style={{ background: '#F5F9F0', borderRadius: 12, padding: '10px 13px', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 5 }}>🧑‍🌾 How to Apply</div>
        <div style={{ fontSize: 14, color: '#3A5A2A', lineHeight: 1.55 }}>{plant.fertilizer.method}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 6 }}>➕ Extras & Supplements</div>
        {plant.fertilizer.extras.map((extra, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#3A5A2A', marginBottom: 5, alignItems: 'flex-start' }}>
            <span style={{ color: '#7ABB8A', flexShrink: 0 }}>✦</span><span>{extra}</span>
          </div>
        ))}
      </div>
      <div style={{ background: '#FFF0F0', border: '1.5px solid #FFCCCC', borderRadius: 12, padding: '9px 13px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#C04040', marginBottom: 4 }}>🚫 Avoid</div>
        <div style={{ fontSize: 14, color: '#7A2020' }}>{plant.fertilizer.avoid}</div>
      </div>
    </div>
  );
};

export default FertilizerTab;
