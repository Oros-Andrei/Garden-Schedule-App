import React, { useState } from 'react';
import { PLANTS } from '../Resources/Constants';
import { Emoji } from '../Resources/Emoji';
import type { PlantProfileContentUpdate } from '../Resources/GardenData';
import type { Disease, Fertilizer, Plant, PlantDetails, Severity, Trick } from '../Resources/Types';
import Button from './Button';
import Dropdown from './Dropdown';
import NumberTextBox from './NumberTextBox';
import TextArea from './TextArea';
import TextInput from './TextInput';

type Section = PlantProfileContentUpdate['section'];

interface CustomPlantInfoEditorProps {
  plant: Plant;
  section: Section;
  onSave: (update: PlantProfileContentUpdate) => Promise<boolean>;
  onCancel: () => void;
}

const sectionLabels: Record<Section, string> = {
  care: 'Care information', fertilizer: 'Fertilizer information', tricks: 'Plant tricks', diseases: 'Disease information',
};

// Build choices from the app's emoji catalog and built-in plant tips, skipping UI-only glyphs.
const nonEmojiControlGlyphs = new Set<string>([
  Emoji.edit, Emoji.star, Emoji.chevronDown, Emoji.previousMonth, Emoji.nextMonth, Emoji.close,
]);
const trickEmojiOptions = Array.from(new Set([
  ...Object.values(Emoji).filter(emoji => !nonEmojiControlGlyphs.has(emoji)),
  ...PLANTS.flatMap(plant => plant.tricks.map(trick => trick.icon)),
  '🗑️',
])).map(emoji => ({ value: emoji, label: emoji }));

// Reuse one editor so built-in and custom plant guidance saves use the same controls.
const CustomPlantInfoEditor: React.FC<CustomPlantInfoEditorProps> = ({ plant, section, onSave, onCancel }) => {
  const [details, setDetails] = useState<PlantDetails>(plant.details);
  const [summerMl, setSummerMl] = useState(plant.details.watering.summerMl ? String(plant.details.watering.summerMl) : '');
  const [winterMl, setWinterMl] = useState(plant.details.watering.winterMl ? String(plant.details.watering.winterMl) : '');
  const [fertilizer, setFertilizer] = useState<Fertilizer>(plant.fertilizer);
  const [npkDraft, setNpkDraft] = useState({
    n: plant.fertilizer.npk.n ? String(plant.fertilizer.npk.n) : '',
    p: plant.fertilizer.npk.p ? String(plant.fertilizer.npk.p) : '',
    k: plant.fertilizer.npk.k ? String(plant.fertilizer.npk.k) : '',
  });
  const [tricks, setTricks] = useState<Trick[]>(plant.tricks.length ? plant.tricks : [{ icon: '🌱', title: '', body: '' }]);
  const [diseases, setDiseases] = useState<Disease[]>(plant.diseases.length ? plant.diseases : [{ symptom: '', severity: 'medium', cause: '', fix: '' }]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const toNumber = (value: string) => Number(value) || 0;
    const savedDetails = { ...details, watering: { ...details.watering, summerMl: toNumber(summerMl), winterMl: toNumber(winterMl) } };
    const savedFertilizer = { ...fertilizer, npk: { n: toNumber(npkDraft.n), p: toNumber(npkDraft.p), k: toNumber(npkDraft.k) } };
    const savedTricks = tricks.filter(trick => trick.icon.trim() || trick.title.trim() || trick.body.trim());
    const savedDiseases = diseases.filter(disease => disease.symptom.trim() || disease.cause.trim() || disease.fix.trim());
    const update: PlantProfileContentUpdate = section === 'care' ? { section, details: savedDetails }
      : section === 'fertilizer' ? { section, fertilizer: savedFertilizer }
      : section === 'tricks' ? { section, tricks: savedTricks }
      : { section, diseases: savedDiseases };
    if (await onSave(update)) onCancel();
  };

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 13, padding: 16, borderRadius: 14, background: '#F5F9F0', border: '1px solid #DDE9D3' }}>
      <h3 style={{ margin: 0, color: '#2A4A1A', fontFamily: "'Lora', Georgia, serif", fontSize: 18 }}>{sectionLabels[section]}</h3>
      {section === 'care' && <>
        <div style={fieldGridStyle}>
          <Field label="Summer watering"><TextArea ariaLabel="Summer watering" rows={2} value={details.watering.summer}
            onChange={value => setDetails(current => ({ ...current, watering: { ...current.watering, summer: value } }))} /></Field>
          <Field label="Summer amount (ml)"><NumberTextBox ariaLabel="Summer amount in milliliters" value={summerMl} onChange={setSummerMl} /></Field>
          <Field label="Winter watering"><TextArea ariaLabel="Winter watering" rows={2} value={details.watering.winter}
            onChange={value => setDetails(current => ({ ...current, watering: { ...current.watering, winter: value } }))} /></Field>
          <Field label="Winter amount (ml)"><NumberTextBox ariaLabel="Winter amount in milliliters" value={winterMl} onChange={setWinterMl} /></Field>
          <Field label="Light"><TextArea ariaLabel="Light" rows={2} value={details.light}
            onChange={value => setDetails(current => ({ ...current, light: value }))} /></Field>
          <Field label="Temperature"><TextArea ariaLabel="Temperature" rows={2} value={details.temp}
            onChange={value => setDetails(current => ({ ...current, temp: value }))} /></Field>
        </div>
        <Field label="Warning (optional)"><TextArea ariaLabel="Warning" rows={2} value={details.warning ?? ''}
          onChange={value => setDetails(current => ({ ...current, warning: value }))} /></Field>
        <Field label="Care notes (one note per line)"><TextArea ariaLabel="Care notes, one note per line" rows={4} value={details.tips.join('\n')}
          onChange={value => setDetails(current => ({ ...current, tips: value.split('\n') }))} /></Field>
      </>}
      {section === 'fertilizer' && <>
        <div style={fieldGridStyle}>
          <Field label="Fertilizer type"><TextInput ariaLabel="Fertilizer type" value={fertilizer.type}
            onChange={value => setFertilizer(current => ({ ...current, type: value }))} /></Field>
          <Field label="Schedule"><TextArea ariaLabel="Fertilizer schedule" rows={2} value={fertilizer.schedule}
            onChange={value => setFertilizer(current => ({ ...current, schedule: value }))} /></Field>
          <Field label="NPK label"><TextInput ariaLabel="NPK label" placeholder="10-10-10" value={fertilizer.npkLabel}
            onChange={value => setFertilizer(current => ({ ...current, npkLabel: value }))} /></Field>
          {(['n', 'p', 'k'] as const).map((nutrient, index) => <Field key={nutrient} label={`${['Nitrogen', 'Phosphorus', 'Potassium'][index]} (%)`}>
            <NumberTextBox ariaLabel={`${['Nitrogen', 'Phosphorus', 'Potassium'][index]} percentage`} value={npkDraft[nutrient]}
              onChange={value => setNpkDraft(current => ({ ...current, [nutrient]: value }))} />
          </Field>)}
        </div>
        <Field label="How to apply"><TextArea ariaLabel="How to apply fertilizer" rows={3} value={fertilizer.method}
          onChange={value => setFertilizer(current => ({ ...current, method: value }))} /></Field>
        <Field label="Extras (one per line)"><TextArea ariaLabel="Fertilizer extras, one per line" rows={3} value={fertilizer.extras.join('\n')}
          onChange={value => setFertilizer(current => ({ ...current, extras: value.split('\n') }))} /></Field>
        <Field label="What to avoid"><TextArea ariaLabel="What to avoid" rows={2} value={fertilizer.avoid}
          onChange={value => setFertilizer(current => ({ ...current, avoid: value }))} /></Field>
      </>}
      {section === 'tricks' && <>
        {tricks.map((trick, index) => <div key={index} style={repeatItemStyle}>
          {/* Keep the small emoji picker first and leave most of the row for the title. */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px minmax(0, 1fr)', alignItems: 'end', gap: 8 }}>
            <Dropdown compact ariaLabel="Trick emoji" value={trick.icon} accent={plant.accent}
              options={trickEmojiOptions.some(option => option.value === trick.icon) ? trickEmojiOptions : [{ value: trick.icon, label: trick.icon }, ...trickEmojiOptions]}
              onChange={value => setTricks(current => current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, icon: value } : item))} />
            <Field label="Title"><TextInput ariaLabel="Trick title" value={trick.title} onChange={value => setTricks(current => current.map((item, itemIndex) =>
              itemIndex === index ? { ...item, title: value } : item))} /></Field>
          </div>
          <Field label="Description"><TextArea ariaLabel="Trick description" rows={3} value={trick.body} onChange={value => setTricks(current => current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, body: value } : item))} /></Field>
          {tricks.length > 1 && <Button onClick={() => setTricks(current => current.filter((_, itemIndex) => itemIndex !== index))}
            icon="🗑️" color="#C04040" size="compact">Remove trick</Button>}
        </div>)}
        <Button onClick={() => setTricks(current => [...current, { icon: '🌱', title: '', body: '' }])} icon={Emoji.plus} color="#4A8C3A">Add another trick</Button>
      </>}
      {section === 'diseases' && <>
        {diseases.map((disease, index) => <div key={index} style={repeatItemStyle}>
          <Field label="Symptom"><TextArea ariaLabel="Disease symptom" rows={2} value={disease.symptom} onChange={value => setDiseases(current => current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, symptom: value } : item))} /></Field>
          <Field label="Severity"><Dropdown ariaLabel="Disease severity" value={disease.severity}
            onChange={value => setDiseases(current => current.map((item, itemIndex) => itemIndex === index
              ? { ...item, severity: value as Severity } : item))} accent={plant.accent} fullWidth
            options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} /></Field>
          <Field label="Cause"><TextArea ariaLabel="Disease cause" rows={2} value={disease.cause} onChange={value => setDiseases(current => current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, cause: value } : item))} /></Field>
          <Field label="How to fix"><TextArea ariaLabel="How to fix disease" rows={3} value={disease.fix} onChange={value => setDiseases(current => current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, fix: value } : item))} /></Field>
          {diseases.length > 1 && <Button onClick={() => setDiseases(current => current.filter((_, itemIndex) => itemIndex !== index))}
            icon="🗑️" color="#C04040" size="compact">Remove disease</Button>}
        </div>)}
        <Button onClick={() => setDiseases(current => [...current, { symptom: '', severity: 'medium', cause: '', fix: '' }])}
          icon={Emoji.plus} color="#4A8C3A">Add another disease</Button>
      </>}
      {/* Lead with the save action and use the plant icon as its cue. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <Button type="submit" icon={Emoji.seedling} color="#4A8C3A">Save</Button>
        <Button type="button" onClick={onCancel} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
      </div>
    </form>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'grid', gap: 5, color: '#526A48', fontSize: 13, fontWeight: 700 }}>
    {label}{children}
  </div>
);

const fieldGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 };
const repeatItemStyle: React.CSSProperties = { display: 'grid', gap: 10, padding: 12, borderRadius: 12, background: 'white', border: '1px solid #DDE9D3' };

export default CustomPlantInfoEditor;
