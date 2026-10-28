import React, { useState } from 'react';
import { Emoji } from '../Resources/Emoji';
import { PLANTS, TABS } from '../Resources/Constants';
import type { CalendarCareEvent, CareEvent, PlantSetup } from '../Resources/GardenData';
import type { Plant, TabId } from '../Resources/Types';
import CareTab from '../Tabs/CareTab';
import DiseasesTab from '../Tabs/DiseasesTab';
import FertilizerTab from '../Tabs/FertilizerTab';
import SetupTab, { loadPlantSetup } from '../Tabs/SetupTab';
import TricksTab from '../Tabs/TricksTab';

interface PlantDetailProps {
  plant: Plant;
  onClose: () => void;
}

const syncPottingEvents = (events: CalendarCareEvent[], plantId: string, plantName: string, setup: PlantSetup): CalendarCareEvent[] => {
  const otherEvents = events.filter(item => item.plantId !== plantId ||
    (item.event.type !== 'potted' && item.event.type !== 'repotted'));
  const pottingEvents: CalendarCareEvent[] = [];
  if (setup.pottedOn) pottingEvents.push({
    plantId, plantName,
    event: { id: `potted-${setup.pottedOn}`, type: 'potted', date: setup.pottedOn, potMaterial: setup.potMaterial, substrate: setup.substrate },
  });
  if (setup.repotted) pottingEvents.push({
    plantId, plantName,
    event: { id: `repotted-${setup.repotted}`, type: 'repotted', date: setup.repotted, potMaterial: setup.potMaterial, substrate: setup.substrate },
  });
  return [...otherEvents, ...pottingEvents];
};

const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onClose }) => {
  const [tab, setTab] = useState<TabId>(0);
  const [setup, setSetup] = useState<PlantSetup>(() => loadPlantSetup(plant));
  const [editingSetup, setEditingSetup] = useState(false);
  const [setupDraft, setSetupDraft] = useState<PlantSetup>(setup);
  const [careEvents, setCareEvents] = useState<CalendarCareEvent[]>(() => PLANTS.flatMap(savedPlant => {
    try {
      const saved = localStorage.getItem(`garden-care-events-${savedPlant.id}`);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((event): event is CareEvent =>
        event && typeof event === 'object' &&
        ['watering', 'fertilizing', 'potted', 'repotted'].includes((event as CareEvent).type) &&
        typeof (event as CareEvent).date === 'string' && typeof (event as CareEvent).id === 'string')
        .map(event => ({ plantId: savedPlant.id, plantName: savedPlant.name, event }));
    } catch { return []; }
  }));

  const logCareEvent = async (plantId: string, event: CareEvent) => {
    const selectedPlant = PLANTS.find(item => item.id === plantId);
    if (!selectedPlant) return;
    const updatedEvents = [
      ...careEvents.filter(item => !(item.plantId === plantId && item.event.type === event.type &&
        ((event.type === 'potted' || event.type === 'repotted') || item.event.date === event.date))),
      { plantId, plantName: selectedPlant.name, event },
    ];
    setCareEvents(updatedEvents);
    try {
      const plantEvents = updatedEvents.filter(item => item.plantId === plantId).map(item => item.event);
      localStorage.setItem(`garden-care-events-${plantId}`, JSON.stringify(plantEvents));
    } catch { /* Keep the event visible for this session if browser storage is unavailable. */ }

    if (event.type === 'potted' || event.type === 'repotted') {
      const existingSetup = loadPlantSetup(selectedPlant);
      const updatedSetup: PlantSetup = {
        ...existingSetup,
        potMaterial: event.potMaterial ?? existingSetup.potMaterial,
        substrate: event.substrate ?? existingSetup.substrate,
        ...(event.type === 'potted' ? { pottedOn: event.date } : { repotted: event.date }),
      };
      try { localStorage.setItem(`garden-setup-${plantId}`, JSON.stringify(updatedSetup)); }
      catch { /* Keep the event visible for this session if browser storage is unavailable. */ }
      if (plantId === plant.id) {
        setSetup(updatedSetup);
        setSetupDraft(updatedSetup);
      }
    }

    try {
      await window.gardenDesktop?.logCareEvent({ id: plantId, name: selectedPlant.name, event });
    } catch (error) {
      console.error('Unable to save the care event to the garden data file.', error);
      window.alert('The event is visible for this session, but could not be saved to the garden data file.');
    }
  };

  const saveSetup = async () => {
    const updatedSetup = {
      ...setupDraft,
      potMaterial: setupDraft.potMaterial.trim(),
      potSize: setupDraft.potSize.trim(),
    };
    setSetup(updatedSetup);
    const updatedEvents = syncPottingEvents(careEvents, plant.id, plant.name, updatedSetup);
    setCareEvents(updatedEvents);
    try {
      localStorage.setItem(`garden-setup-${plant.id}`, JSON.stringify(updatedSetup));
      localStorage.setItem(`garden-care-events-${plant.id}`, JSON.stringify(
        updatedEvents.filter(item => item.plantId === plant.id).map(item => item.event),
      ));
    } catch { /* Keep the edits for this session if browser storage is unavailable. */ }

    try {
      await window.gardenDesktop?.saveSetup({ id: plant.id, name: plant.name, setup: updatedSetup });
    } catch (error) {
      console.error('Unable to save the garden data file.', error);
      window.alert('Your changes are visible for this session, but could not be saved to the garden data file.');
    }
    setEditingSetup(false);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.93)', borderRadius: 22,
      border: `2px solid ${plant.color}`, boxShadow: `0 8px 32px ${plant.color}55`,
      overflow: 'visible',
    }}>
      <div style={{
        background: `linear-gradient(135deg,${plant.color},${plant.accent}22)`,
        padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 12,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
      }}>
        <div style={{ width: 54, height: 54, flexShrink: 0 }}>
          <plant.icon accent={plant.accent} />
        </div>
        <div>
          <div className="plant-name" style={{ fontSize: 18, color: '#1A3A0A' }}>{plant.name}</div>
          <div style={{ fontSize: 14, color: '#5A7A4A', fontStyle: 'italic', marginTop: 1 }}>{plant.latin}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '2px 8px', fontSize: 14, color: '#4A6A3A' }}>
              {Emoji.amphora} {setup.potType}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '2px 8px', fontSize: 14, color: '#4A6A3A' }}>
              {Emoji.ruler} {setup.potSize}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close plant profile"
          title="Close plant profile"
          style={{
            marginLeft: 'auto', alignSelf: 'flex-start', flexShrink: 0,
            width: 34, height: 34, border: '1px solid rgba(80,80,80,0.2)',
            borderRadius: '50%', background: 'rgba(255,255,255,0.75)',
            color: '#4A5A3A', fontSize: 22, lineHeight: 1, cursor: 'pointer',
          }}
        >{Emoji.close}</button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1.5px solid #E8F0E0' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'rgba(255,255,255,1)' : 'rgba(240,247,234,0.6)',
            borderBottom: tab === t.id ? `2.5px solid ${plant.accent}` : '2.5px solid transparent',
            fontSize: 14, fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? plant.accent : '#7A9A6A',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        {tab === 0 && (
          <SetupTab
            plant={plant}
            setup={setup}
            setupDraft={setupDraft}
            editing={editingSetup}
            onEdit={() => {
              setSetupDraft({ ...setup });
              setEditingSetup(true);
            }}
            onChange={changes => setSetupDraft(current => ({ ...current, ...changes }))}
            onSave={saveSetup}
            onCancel={() => setEditingSetup(false)}
            careEvents={careEvents}
            plants={PLANTS}
            onLogCareEvent={logCareEvent}
          />
        )}
        {tab === 1 && <CareTab plant={plant} />}
        {tab === 2 && <FertilizerTab plant={plant} />}
        {tab === 3 && <TricksTab plant={plant} />}
        {tab === 4 && <DiseasesTab plant={plant} />}
      </div>
    </div>
  );
};

export default PlantDetail;
