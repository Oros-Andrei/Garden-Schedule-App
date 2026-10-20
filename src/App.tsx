import React, { useState } from 'react';
import { PLANTS, CATEGORIES } from './data';
import type { Plant, Disease, Severity, TabId } from './types';

// ─── SEVERITY CONFIG ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  high:   { color: '#C04040', bg: '#FFF0F0', border: '#FFCCCC', label: '🔴 Urgent' },
  medium: { color: '#B06010', bg: '#FFF8E8', border: '#FFD080', label: '🟡 Attention' },
  low:    { color: '#2A6A3A', bg: '#F0FAF2', border: '#A8D8B0', label: '🟢 Minor' },
};

const TABS: string[] = ['🌿 Care', '🧪 Fertilizer', '✨ Tricks', '🩺 Diseases'];

// ─── WATER DROPLET ────────────────────────────────────────────────────────────
const WaterDroplet: React.FC<{ ml: number; maxMl?: number; color: string; accent: string }> = ({
  ml, maxMl = 1000, color, accent,
}) => {
  const pct   = Math.min(ml / maxMl, 1);
  const dropH = 54;
  const fillH = Math.round(dropH * pct);
  const fillY = 10 + (dropH - fillH);
  const id    = `drop-${ml}-${accent.replace('#', '')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="52" height="72" viewBox="0 0 52 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={id}>
            <path d="M26 4 C26 4 6 30 6 46 C6 58 15 66 26 66 C37 66 46 58 46 46 C46 30 26 4 26 4 Z" />
          </clipPath>
        </defs>
        <path d="M26 4 C26 4 6 30 6 46 C6 58 15 66 26 66 C37 66 46 58 46 46 C46 30 26 4 26 4 Z"
          fill="#E8F4FC" stroke="#B0D8EC" strokeWidth="1.5" />
        {ml > 0 && (
          <rect x="0" y={fillY} width="52" height={fillH + 10}
            fill={color} opacity="0.75" clipPath={`url(#${id})`} />
        )}
        {ml > 0 && pct < 0.99 && (
          <path
            d={`M6 ${fillY} Q16 ${fillY - 5} 26 ${fillY} Q36 ${fillY + 5} 46 ${fillY}`}
            fill="none" stroke={color} strokeWidth="2" opacity="0.9" clipPath={`url(#${id})`}
          />
        )}
        <ellipse cx="19" cy="36" rx="4" ry="7" fill="rgba(255,255,255,0.35)" transform="rotate(-20 19 36)" />
        <path d="M26 4 C26 4 6 30 6 46 C6 58 15 66 26 66 C37 66 46 58 46 46 C46 30 26 4 26 4 Z"
          fill="none" stroke={accent} strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color: ml === 0 ? '#A0B8C8' : accent }}>
        {ml === 0 ? '—' : `${ml} ml`}
      </div>
      <div style={{ fontSize: 10, color: '#8AA8B8', textAlign: 'center', maxWidth: 52 }}>
        {ml === 0 ? 'no water' : 'per session'}
      </div>
    </div>
  );
};

// ─── NPK BAR ──────────────────────────────────────────────────────────────────
const NPKBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({
  label, value, max, color,
}) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#5A7A4A' }}>{label}</span>
      <span style={{ fontSize: 11, color: '#5A7A4A' }}>{value}%</span>
    </div>
    <div style={{ height: 8, background: '#E8F0E0', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${(value / max) * 100}%`,
        background: color, borderRadius: 4, transition: 'width 0.6s ease',
      }} />
    </div>
  </div>
);

// ─── DISEASE CARD ─────────────────────────────────────────────────────────────
const DiseaseCard: React.FC<{ disease: Disease; accent: string }> = ({ disease, accent }) => {
  const [open, setOpen] = useState(false);
  const s = SEVERITY_CONFIG[disease.severity];
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: open ? s.bg : '#F5F9F0',
        border: `1.5px solid ${open ? s.border : '#E0ECD0'}`,
        borderRadius: 14, padding: '11px 14px', cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2A4A1A', lineHeight: 1.35, flex: 1 }}>
          {disease.symptom}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: s.color,
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 20, padding: '2px 7px', whiteSpace: 'nowrap',
          }}>{s.label}</span>
          <span style={{
            fontSize: 14, color: accent,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s', display: 'inline-block',
          }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#7A6A2A', marginBottom: 3 }}>
              🔍 Cause
            </div>
            <div style={{ fontSize: 13, color: '#5A4A1A', lineHeight: 1.5 }}>{disease.cause}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '9px 12px', borderLeft: `3px solid ${accent}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 4 }}>
              💊 How to Fix
            </div>
            <div style={{ fontSize: 13, color: '#2A4A1A', lineHeight: 1.55 }}>{disease.fix}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PLANT DETAIL PANEL ───────────────────────────────────────────────────────
const PlantDetail: React.FC<{ plant: Plant }> = ({ plant }) => {
  const [tab, setTab] = useState<TabId>(0);
  const maxNPK = Math.max(plant.fertilizer.npk.n, plant.fertilizer.npk.p, plant.fertilizer.npk.k, 30);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.93)', borderRadius: 22,
      border: `2px solid ${plant.color}`, boxShadow: `0 8px 32px ${plant.color}55`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg,${plant.color},${plant.accent}22)`,
        padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 54, height: 54, flexShrink: 0 }}>
          <plant.icon accent={plant.accent} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1A3A0A' }}>{plant.name}</div>
          <div style={{ fontSize: 12, color: '#5A7A4A', fontStyle: 'italic', marginTop: 1 }}>{plant.latin}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#4A6A3A' }}>
              🪴 {plant.pot}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#4A6A3A' }}>
              📏 {plant.potSize}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #E8F0E0' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i as TabId)} style={{
            flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
            background: tab === i ? 'rgba(255,255,255,1)' : 'rgba(240,247,234,0.6)',
            borderBottom: tab === i ? `2.5px solid ${plant.accent}` : '2.5px solid transparent',
            fontSize: 12, fontWeight: tab === i ? 700 : 400,
            color: tab === i ? plant.accent : '#7A9A6A',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '16px 18px 18px' }}>

        {/* ── TAB 0: CARE ── */}
        {tab === 0 && (
          <div>
            {plant.details.warning && (
              <div style={{ background: '#FFF8E8', border: '1.5px solid #FFD080', borderRadius: 12, padding: '9px 13px', marginBottom: 13, fontSize: 13, color: '#7A5010' }}>
                ⚠️ {plant.details.warning}
              </div>
            )}
            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 4 }}>Substrate</div>
              <div style={{ fontSize: 13, color: '#3A5A2A' }}>{plant.substrate}</div>
            </div>

            {/* Watering droplets */}
            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 10 }}>
                💧 Watering
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#F0F9FF', borderRadius: 14, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#4A8AAA', marginBottom: 2 }}>☀️ Summer</div>
                  <WaterDroplet ml={plant.details.watering.summerMl} maxMl={1000} color="#7BBFDF" accent="#3A80AA" />
                  <div style={{ fontSize: 11, color: '#2A5A7A', textAlign: 'center', lineHeight: 1.4 }}>{plant.details.watering.summer}</div>
                </div>
                <div style={{ background: '#F0F4FF', borderRadius: 14, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#5A5AAA', marginBottom: 2 }}>❄️ Winter</div>
                  <WaterDroplet ml={plant.details.watering.winterMl} maxMl={1000} color="#9090D0" accent="#4A4A9A" />
                  <div style={{ fontSize: 11, color: '#2A2A6A', textAlign: 'center', lineHeight: 1.4 }}>{plant.details.watering.winter}</div>
                </div>
              </div>
              <div style={{ background: '#F0F7E8', border: '1px solid #C8E0B0', borderRadius: 10, padding: '7px 12px', marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: 11, color: '#3A6A2A', lineHeight: 1.5 }}>
                  Amounts are per session based on pot size. The most reliable method:{' '}
                  <strong>water until it drains from the bottom</strong>, then don't water again until the soil is dry.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 13 }}>
              <div style={{ background: '#FFF9F0', borderRadius: 10, padding: '9px 11px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: plant.accent, marginBottom: 3 }}>☀️ Light</div>
                <div style={{ fontSize: 12, color: '#3A5A2A' }}>{plant.details.light}</div>
              </div>
              <div style={{ background: '#F0F8FF', borderRadius: 10, padding: '9px 11px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: plant.accent, marginBottom: 3 }}>🌡️ Temp</div>
                <div style={{ fontSize: 12, color: '#3A5A2A' }}>{plant.details.temp}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 7 }}>📋 Care Notes</div>
              {plant.details.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: '#3A5A2A', marginBottom: 5 }}>
                  <span style={{ color: plant.accent, flexShrink: 0 }}>→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 1: FERTILIZER ── */}
        {tab === 1 && (
          <div>
            <div style={{ background: '#F5F9F0', borderRadius: 14, padding: '12px 14px', marginBottom: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent }}>NPK Ratio</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: plant.accent, letterSpacing: 1 }}>{plant.fertilizer.npkLabel}</div>
              </div>
              <NPKBar label="N — Nitrogen (leaves & growth)"     value={plant.fertilizer.npk.n} max={maxNPK} color="#5A9E4A" />
              <NPKBar label="P — Phosphorus (roots & flowers)"   value={plant.fertilizer.npk.p} max={maxNPK} color="#E07820" />
              <NPKBar label="K — Potassium (immunity & stems)"   value={plant.fertilizer.npk.k} max={maxNPK} color="#7BAFD4" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 4 }}>Fertilizer Type</div>
              <div style={{ fontSize: 13, color: '#3A5A2A', fontWeight: 600 }}>{plant.fertilizer.type}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 4 }}>📅 Schedule</div>
              <div style={{ fontSize: 13, color: '#3A5A2A' }}>{plant.fertilizer.schedule}</div>
            </div>
            <div style={{ background: '#F5F9F0', borderRadius: 12, padding: '10px 13px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 5 }}>🧑‍🌾 How to Apply</div>
              <div style={{ fontSize: 13, color: '#3A5A2A', lineHeight: 1.55 }}>{plant.fertilizer.method}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: plant.accent, marginBottom: 6 }}>➕ Extras & Supplements</div>
              {plant.fertilizer.extras.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#3A5A2A', marginBottom: 5, alignItems: 'flex-start' }}>
                  <span style={{ color: '#7ABB8A', flexShrink: 0 }}>✦</span><span>{e}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#FFF0F0', border: '1.5px solid #FFCCCC', borderRadius: 12, padding: '9px 13px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#C04040', marginBottom: 4 }}>🚫 Avoid</div>
              <div style={{ fontSize: 13, color: '#7A2020' }}>{plant.fertilizer.avoid}</div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TRICKS ── */}
        {tab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plant.tricks.map((trick, i) => (
              <div key={i} style={{ background: '#F5F9F0', borderRadius: 14, padding: '12px 14px', borderLeft: `4px solid ${plant.accent}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 18 }}>{trick.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: plant.accent }}>{trick.title}</span>
                </div>
                <div style={{ fontSize: 13, color: '#3A5A2A', lineHeight: 1.55 }}>{trick.body}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: DISEASES ── */}
        {tab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: '#7A9A6A', marginBottom: 2 }}>Tap a symptom to see the cause and fix.</div>
            {plant.diseases.map((d, i) => (
              <DiseaseCard key={i} disease={d} accent={plant.accent} />
            ))}
          </div>
        )}

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
      fontFamily: 'Georgia, serif',
      background: 'linear-gradient(135deg,#F0F7E8 0%,#E8F4E0 50%,#F5EFE0 100%)',
      minHeight: '100vh',
    }}>
      <style>{`
        @media (min-width: 800px) {
          .garden-layout { display: flex !important; align-items: flex-start; gap: 24px; padding: 0 24px 32px !important; max-width: 1100px !important; }
          .garden-sidebar { width: 340px; flex-shrink: 0; padding-top: 0 !important; }
          .garden-detail  { flex: 1; min-width: 0; margin: 0 !important; position: sticky; top: 20px; }
          .garden-empty   { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 400px; }
        }
        @media (max-width: 799px) {
          .garden-detail  { margin: 16px 14px 28px !important; }
          .garden-empty   { display: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: '28px 20px 18px' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#7A9A6A', marginBottom: 6 }}>
          Andrei's Garden
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2A4A1A', margin: 0 }}>Plant Care Guide</h1>
        <p style={{ fontSize: 13, color: '#7A9A6A', marginTop: 5 }}>Click a plant to see its full profile</p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="garden-layout" style={{ padding: '0 14px 32px', maxWidth: 480, margin: '0 auto' }}>

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
                  <span style={{ fontSize: 11, color: cat.color, opacity: 0.7, marginLeft: 'auto' }}>
                    {catPlants.length} plant{catPlants.length > 1 ? 's' : ''}
                  </span>
                  <span style={{
                    fontSize: 13, color: cat.color,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s', display: 'inline-block',
                  }}>▾</span>
                </button>

                {isOpen && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
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
                          fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
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
            <PlantDetail key={selectedPlant.id} plant={selectedPlant} />
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
