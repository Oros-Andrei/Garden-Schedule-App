import React, { useState } from 'react';
import { Emoji } from '../Resources/Emoji';
import type { PlantProfileContentUpdate } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import Button from '../Components/Button';
import CustomPlantInfoEditor from '../Components/CustomPlantInfoEditor';

const NPKPieChart: React.FC<{ n: number; p: number; k: number }> = ({ n, p, k }) => {
  const total = n + p + k;
  const nutrients = [
    { label: 'Nitrogen — leaves & growth', value: n, color: '#5A9E4A' },
    { label: 'Phosphorus — roots & flowers', value: p, color: '#E07820' },
    { label: 'Potassium — immunity & stems', value: k, color: '#7BAFD4' },
  ];
  // Normalize the NPK ratio into slices that add up to exactly 100 percent.
  const exactShares = nutrients.map(item => total > 0 ? item.value / total * 100 : 0);
  const shares = exactShares.map(Math.floor);
  const remainingPoints = total > 0 ? 100 - shares.reduce((sum, value) => sum + value, 0) : 0;
  [...exactShares.keys()]
    .sort((first, second) => (exactShares[second] - shares[second]) - (exactShares[first] - shares[first]))
    .slice(0, remainingPoints)
    .forEach(index => { shares[index] += 1; });

  let angle = -90;
  const slices = nutrients.map((item, index) => {
    const startAngle = angle;
    angle += shares[index] * 3.6;
    const endAngle = angle;
    const start = { x: 80 + 68 * Math.cos(startAngle * Math.PI / 180), y: 80 + 68 * Math.sin(startAngle * Math.PI / 180) };
    const end = { x: 80 + 68 * Math.cos(endAngle * Math.PI / 180), y: 80 + 68 * Math.sin(endAngle * Math.PI / 180) };
    const largeArc = shares[index] > 50 ? 1 : 0;
    return { ...item, percent: shares[index], path: `M 80 80 L ${start.x} ${start.y} A 68 68 0 ${largeArc} 1 ${end.x} ${end.y} Z` };
  });

  // Reduce the chart footprint so it can sit beside the fertilizer type and schedule.
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(85px, 112px) minmax(0, 1fr)', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 160 160" role="img" aria-label={total > 0 ? 'NPK distribution totals 100 percent' : 'No NPK values entered'} style={{ width: '100%', maxWidth: 112 }}>
        {total > 0 ? slices.filter(slice => slice.percent > 0).map(slice => slice.percent === 100
          ? <circle key={slice.label} cx="80" cy="80" r="68" fill={slice.color} aria-label={`${slice.label}: 100%`} />
          : <path key={slice.label} d={slice.path} fill={slice.color} stroke="white" strokeWidth="1.5"
            aria-label={`${slice.label}: ${slice.percent}%`} />)
          : <circle cx="80" cy="80" r="68" fill="#E8F0E0" />}
      </svg>
      <div style={{ display: 'grid', gap: 5 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#3A5A2A' }}>Total: {total > 0 ? '100%' : '0%'}</div>
        {slices.map(slice => <div key={slice.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7, fontSize: 12, color: '#5A7A4A' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span aria-hidden="true" style={{ width: 9, height: 9, flexShrink: 0, borderRadius: '50%', background: slice.color }} />
            {slice.label}
          </span>
          <strong style={{ color: '#3A5A2A' }}>{slice.percent}%</strong>
        </div>)}
      </div>
    </div>
  );
};

const FertilizerTab: React.FC<{ plant: Plant; onSavePlantContent: (update: PlantProfileContentUpdate) => Promise<boolean> }> = ({ plant, onSavePlantContent }) => {
  const [editing, setEditing] = useState(false);
  // Use the shared editor for built-in profiles without changing their catalog defaults.
  if (editing) return <CustomPlantInfoEditor plant={plant} section="fertilizer" onSave={onSavePlantContent} onCancel={() => setEditing(false)} />;
  if (plant.isCustom && !plant.customInfo?.fertilizer) return (
    <div role="status" style={{ padding: 18, borderRadius: 12, background: '#F5F9F0', color: '#5A7A4A', fontSize: 14, textAlign: 'center' }}>
      <div style={{ marginBottom: 10 }}>Fertilizer information has not been added for this plant yet.</div>
      <Button onClick={() => setEditing(true)} icon={Emoji.plus} color="#4A8C3A">Add information</Button>
    </div>
  );
  return (
    <div>
      {/* Keep the chart and its two key fertilizer details together in a compact, wrapping row. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 13 }}>
        <div style={{ background: '#F5F9F0', borderRadius: 14, padding: '10px 12px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: plant.accent }}>{Emoji.testTube} NPK Ratio</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: plant.accent, letterSpacing: 1 }}>{plant.fertilizer.npkLabel}</div>
          </div>
          <NPKPieChart n={plant.fertilizer.npk.n} p={plant.fertilizer.npk.p} k={plant.fertilizer.npk.k} />
        </div>
        <div style={{ background: '#F5F9F0', borderRadius: 14, padding: '12px 14px', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 6 }}>{Emoji.lotionBottle} Fertilizer Type</div>
          <div style={{ fontSize: 14, color: '#3A5A2A', fontWeight: 600 }}>{plant.fertilizer.type}</div>
        </div>
        <div style={{ background: '#F5F9F0', borderRadius: 14, padding: '12px 14px', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 6 }}>{Emoji.calendar} Schedule</div>
          <div style={{ fontSize: 14, color: '#3A5A2A' }}>{plant.fertilizer.schedule}</div>
        </div>
      </div>
      <div style={{ background: '#F5F9F0', borderRadius: 12, padding: '10px 13px', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 5 }}>{Emoji.farmer} How to Apply</div>
        <div style={{ fontSize: 14, color: '#3A5A2A', lineHeight: 1.55 }}>{plant.fertilizer.method}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 6 }}>{Emoji.plus} Extras & Supplements</div>
        {plant.fertilizer.extras.map((extra, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#3A5A2A', marginBottom: 5, alignItems: 'flex-start' }}>
            <span style={{ color: '#7ABB8A', flexShrink: 0 }}>{Emoji.star}</span><span>{extra}</span>
          </div>
        ))}
      </div>
      <div style={{ background: '#FFF0F0', border: '1.5px solid #FFCCCC', borderRadius: 12, padding: '9px 13px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#C04040', marginBottom: 4 }}>{Emoji.prohibited} Avoid</div>
        <div style={{ fontSize: 14, color: '#7A2020' }}>{plant.fertilizer.avoid}</div>
      </div>
      {/* Keep the edit action at the bottom-right after all fertilizer guidance. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Button onClick={() => setEditing(true)} icon={Emoji.edit} color="#4A8C3A">Edit information</Button>
      </div>
    </div>
  );
};

export default FertilizerTab;
