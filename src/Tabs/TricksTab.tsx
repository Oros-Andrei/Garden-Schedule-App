import React from 'react';
import type { Plant } from '../Resources/Types';

const TricksTab: React.FC<{ plant: Plant }> = ({ plant }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

export default TricksTab;
