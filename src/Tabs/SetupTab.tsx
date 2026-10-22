import React from 'react';
import type { Plant } from '../types';
import { POT_MATERIAL_OPTIONS, POT_SIZE_OPTIONS, POT_TYPE_OPTIONS, SOIL_OPTIONS } from '../Constants';
import Button from '../Components/Button';
import DatePicker from '../Components/DatePicker';
import Dropdown from '../Components/Dropdown';
import TextBox from '../Components/TextBox';

export type PlantSetup = {
  substrate: string;
  potType: string;
  potMaterial: string;
  potSize: string;
  repotted: string;
};

export const loadPlantSetup = (plant: Plant): PlantSetup => {
  const initialSoil = [...SOIL_OPTIONS].sort((a, b) => b.length - a.length)
    .find(option => plant.substrate.toLowerCase().includes(option.toLowerCase())) ?? 'General';
  const defaults: PlantSetup = {
    substrate: initialSoil, potType: 'Custom', potMaterial: plant.pot, potSize: plant.potSize, repotted: '',
  };
  try {
    const savedSetup = localStorage.getItem(`garden-setup-${plant.id}`);
    if (savedSetup) {
      const parsed = JSON.parse(savedSetup) as Partial<PlantSetup>;
      return {
        substrate: typeof parsed.substrate === 'string' && SOIL_OPTIONS.includes(parsed.substrate) ? parsed.substrate : defaults.substrate,
        potType: typeof parsed.potType === 'string' && POT_TYPE_OPTIONS.includes(parsed.potType) ? parsed.potType : defaults.potType,
        potMaterial: typeof parsed.potMaterial === 'string' ? parsed.potMaterial : defaults.potMaterial,
        potSize: typeof parsed.potSize === 'string' ? parsed.potSize : defaults.potSize,
        repotted: typeof parsed.repotted === 'string' ? parsed.repotted : defaults.repotted,
      };
    }
    const savedSoil = localStorage.getItem(`garden-soil-${plant.id}`);
    if (savedSoil) {
      const parsed = JSON.parse(savedSoil) as { substrate?: string };
      if (typeof parsed.substrate === 'string' && SOIL_OPTIONS.includes(parsed.substrate)) {
        return { ...defaults, substrate: parsed.substrate };
      }
    }
  } catch { /* Use the plant's defaults when saved data is unavailable. */ }
  return defaults;
};

const getNextRepotDate = (repotted: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(repotted);
  if (!match) return '';

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const sourceDate = new Date(year, month - 1, day);
  if (sourceDate.getFullYear() !== year || sourceDate.getMonth() !== month - 1 || sourceDate.getDate() !== day) return '';

  const nextYear = year + 1;
  const dayInNextYear = Math.min(day, new Date(nextYear, month, 0).getDate());
  const nextDate = new Date(nextYear, month - 1, dayInNextYear);
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(nextDate);
};

interface SetupTabProps {
  plant: Plant;
  setup: PlantSetup;
  setupDraft: PlantSetup;
  editing: boolean;
  onEdit: () => void;
  onChange: (changes: Partial<PlantSetup>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SetupTab: React.FC<SetupTabProps> = ({ plant, setup, setupDraft, editing, onEdit, onChange, onSave, onCancel }) => (
  <div>
    {!editing ? (
      <div>
        <div className="setup-grid">
          <div style={labelStyle(plant.accent)}>🌱 Substrate</div>
          <Dropdown ariaLabel="Soil type" value={setup.substrate} disabled accent={plant.accent}
            options={SOIL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>🏺 Pot type</div>
          <Dropdown ariaLabel="Pot type" value={setup.potType} disabled accent={plant.accent}
            options={POT_TYPE_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>🧱 Pot material</div>
          <Dropdown ariaLabel="Pot material" value={setup.potMaterial} disabled accent={plant.accent}
            options={POT_MATERIAL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>📏 Pot size</div>
          <Dropdown ariaLabel="Pot size" value={setup.potSize} disabled accent={plant.accent} options={POT_SIZE_OPTIONS} />
          <div style={labelStyle(plant.accent)}>📅 Repotted in</div>
          <DatePicker ariaLabel="Repotted date" value={setup.repotted} disabled accent={plant.accent} />
          <div style={labelStyle(plant.accent)}>📅 Next repot</div>
          <TextBox ariaLabel="Next repot date" value={getNextRepotDate(setup.repotted)} placeholder="Not set" accent={plant.accent} />
        </div>
        <div style={{ display: 'flex', marginTop: 16 }}>
          <Button onClick={onEdit} icon="✎" color={plant.accent}>Edit all</Button>
        </div>
      </div>
    ) : (
      <div>
        <div className="setup-grid">
          <div style={labelStyle(plant.accent)}>🌱 Substrate</div>
          <Dropdown ariaLabel="Soil type" value={setupDraft.substrate}
            onChange={substrate => onChange({ substrate })}
            accent={plant.accent} options={SOIL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>🏺 Pot type</div>
          <Dropdown ariaLabel="Pot type" value={setupDraft.potType}
            onChange={potType => onChange({ potType })}
            accent={plant.accent} options={POT_TYPE_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>🧱 Pot material</div>
          <Dropdown ariaLabel="Pot material" value={setupDraft.potMaterial}
            onChange={potMaterial => onChange({ potMaterial })}
            accent={plant.accent} options={POT_MATERIAL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>📏 Pot size</div>
          <Dropdown ariaLabel="Pot size" value={setupDraft.potSize}
            onChange={potSize => onChange({ potSize })}
            accent={plant.accent} options={POT_SIZE_OPTIONS} />
          <div style={labelStyle(plant.accent)}>📅 Repotted in</div>
          <DatePicker ariaLabel="Repotted date" value={setupDraft.repotted}
            onChange={repotted => onChange({ repotted })} accent={plant.accent} />
          <div style={labelStyle(plant.accent)}>📅 Next repot</div>
          <TextBox ariaLabel="Next repot date" value={getNextRepotDate(setupDraft.repotted)} placeholder="Not set" accent={plant.accent} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <Button onClick={onSave} icon="🌱" color="#4A8C3A">Save</Button>
          <Button onClick={onCancel} icon="🥀" color="#C04040">Cancel</Button>
        </div>
      </div>
    )}
  </div>
);

const labelStyle = (accent: string): React.CSSProperties => ({
  fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent,
});

export default SetupTab;
