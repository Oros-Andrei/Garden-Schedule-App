import React from 'react';
import { Emoji } from '../Resources/Emoji';
import type { PlantSetup } from '../Resources/GardenData';
import type { CalendarCareEvent, CareEvent } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import { POT_MATERIAL_OPTIONS, POT_SIZE_OPTIONS, POT_TYPE_OPTIONS, SOIL_OPTIONS } from '../Resources/Constants';
import Button from '../Components/Button';
import DatePicker from '../Components/DatePicker';
import Dropdown from '../Components/Dropdown';
import Calendar from '../Components/Calendar';
import TextBox from '../Components/TextBox';

export const loadPlantSetup = (plant: Plant): PlantSetup => {
  const initialSoil = [...SOIL_OPTIONS].sort((a, b) => b.length - a.length)
    .find(option => plant.substrate.toLowerCase().includes(option.toLowerCase())) ?? 'General';
  const defaults: PlantSetup = {
    substrate: initialSoil, potType: 'Custom', potMaterial: plant.pot, potSize: plant.potSize, pottedOn: '', repotted: '',
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
        pottedOn: typeof parsed.pottedOn === 'string' ? parsed.pottedOn : defaults.pottedOn,
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

const getNextRepotDate = (pottedOn: string, repotted: string): Date | null => {
  const validDates = [pottedOn, repotted].filter(value => {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!dateMatch) return false;
    const [, yearText, monthText, dayText] = dateMatch;
    const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
    return date.getFullYear() === Number(yearText) && date.getMonth() === Number(monthText) - 1 && date.getDate() === Number(dayText);
  });
  const sortedDates = validDates.sort();
  const baseDate = sortedDates[sortedDates.length - 1] ?? '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseDate);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const sourceDate = new Date(year, month - 1, day);
  if (sourceDate.getFullYear() !== year || sourceDate.getMonth() !== month - 1 || sourceDate.getDate() !== day) return null;

  const nextYear = year + 1;
  const dayInNextYear = Math.min(day, new Date(nextYear, month, 0).getDate());
  const nextDate = new Date(nextYear, month - 1, dayInNextYear);
  return nextDate;
};

const toDateValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date): string => (
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
);

interface SetupTabProps {
  plant: Plant;
  setup: PlantSetup;
  setupDraft: PlantSetup;
  editing: boolean;
  onEdit: () => void;
  onChange: (changes: Partial<PlantSetup>) => void;
  onSave: () => void;
  onCancel: () => void;
  careEvents: CalendarCareEvent[];
  plants: Plant[];
  onLogCareEvent: (plantId: string, event: CareEvent) => void;
}

const SetupTab: React.FC<SetupTabProps> = ({ plant, setup, setupDraft, editing, onEdit, onChange, onSave, onCancel, careEvents, plants, onLogCareEvent }) => {
  const calendarPotted = editing ? setupDraft.pottedOn : setup.pottedOn;
  const calendarRepotted = editing ? setupDraft.repotted : setup.repotted;
  const nextRepotDate = getNextRepotDate(calendarPotted, calendarRepotted);

  return (
  <div className="setup-calendar-layout">
    <div>
    {!editing ? (
      <div>
        <div className="setup-grid">
          <div style={labelStyle(plant.accent)}>{Emoji.seedling} Substrate</div>
          <Dropdown ariaLabel="Soil type" value={setup.substrate} disabled accent={plant.accent}
            options={SOIL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>{Emoji.amphora} Pot type</div>
          <Dropdown ariaLabel="Pot type" value={setup.potType} disabled accent={plant.accent}
            options={POT_TYPE_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>{Emoji.brick} Pot material</div>
          <Dropdown ariaLabel="Pot material" value={setup.potMaterial} disabled accent={plant.accent}
            options={POT_MATERIAL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>{Emoji.ruler} Pot size</div>
          <Dropdown ariaLabel="Pot size" value={setup.potSize} disabled accent={plant.accent} options={POT_SIZE_OPTIONS} />
          <div style={labelStyle(plant.accent)}>{Emoji.calendar} Potted in</div>
          <DatePicker ariaLabel="Potted date" value={setup.pottedOn} disabled accent={plant.accent} />
          <div style={labelStyle(plant.accent)}>{Emoji.calendar} Repotted in</div>
          <DatePicker ariaLabel="Repotted date" value={setup.repotted} disabled accent={plant.accent} />
          <div style={labelStyle(plant.accent)}>{Emoji.calendar} Next repot</div>
          <TextBox ariaLabel="Next repot date" value={nextRepotDate ? formatDate(nextRepotDate) : ''} placeholder="Not set" accent={plant.accent} />
        </div>
        <div style={{ display: 'flex', marginTop: 16 }}>
          <Button onClick={onEdit} icon={Emoji.edit} color={plant.accent}>Edit all</Button>
        </div>
      </div>
    ) : (
      <div>
        <div className="setup-grid">
          <div style={labelStyle(plant.accent)}>{Emoji.seedling} Substrate</div>
          <Dropdown ariaLabel="Soil type" value={setupDraft.substrate}
            onChange={substrate => onChange({ substrate })}
            accent={plant.accent} options={SOIL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>{Emoji.amphora} Pot type</div>
          <Dropdown ariaLabel="Pot type" value={setupDraft.potType}
            onChange={potType => onChange({ potType })}
            accent={plant.accent} options={POT_TYPE_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>{Emoji.brick} Pot material</div>
          <Dropdown ariaLabel="Pot material" value={setupDraft.potMaterial}
            onChange={potMaterial => onChange({ potMaterial })}
            accent={plant.accent} options={POT_MATERIAL_OPTIONS.map(option => ({ value: option, label: option }))} />
          <div style={labelStyle(plant.accent)}>{Emoji.ruler} Pot size</div>
          <Dropdown ariaLabel="Pot size" value={setupDraft.potSize}
            onChange={potSize => onChange({ potSize })}
            accent={plant.accent} options={POT_SIZE_OPTIONS} />
          <div style={labelStyle(plant.accent)}>{Emoji.calendar} Potted in</div>
          <DatePicker ariaLabel="Potted date" value={setupDraft.pottedOn}
            onChange={pottedOn => onChange({ pottedOn })} accent={plant.accent} />
          <div style={labelStyle(plant.accent)}>{Emoji.calendar} Repotted in</div>
          <DatePicker ariaLabel="Repotted date" value={setupDraft.repotted}
            onChange={repotted => onChange({ repotted })} accent={plant.accent} />
          <div style={labelStyle(plant.accent)}>{Emoji.calendar} Next repot</div>
          <TextBox ariaLabel="Next repot date" value={nextRepotDate ? formatDate(nextRepotDate) : ''} placeholder="Not set" accent={plant.accent} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <Button onClick={onSave} icon={Emoji.seedling} color="#4A8C3A">Save</Button>
          <Button onClick={onCancel} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
        </div>
      </div>
    )}
    </div>
    <Calendar plant={plant} pottedOn={calendarPotted} repotted={calendarRepotted}
      nextRepot={nextRepotDate ? toDateValue(nextRepotDate) : ''} careEvents={careEvents} plants={plants} onLogCareEvent={onLogCareEvent} />
  </div>
  );
};

const labelStyle = (accent: string): React.CSSProperties => ({
  fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent,
});

export default SetupTab;
