import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { Emoji } from '../Resources/Emoji';
import { TABS } from '../Resources/Constants';
import type { CalendarCareEvent, CareEvent, GardenOptions, PlantProfileContentUpdate, PlantSetup } from '../Resources/GardenData';
import type { Plant, TabId } from '../Resources/Types';
import CareTab from '../Tabs/CareTab';
import DiseasesTab from '../Tabs/DiseasesTab';
import FertilizerTab from '../Tabs/FertilizerTab';
import SetupTab, { loadPlantSetup } from '../Tabs/SetupTab';
import TricksTab from '../Tabs/TricksTab';

interface PlantDetailProps {
  plant: Plant;
  plants: Plant[];
  // Pass configured choices through to setup and calendar UI.
  options: GardenOptions;
  onClose: () => void;
  // Reuse the app's compressed-photo persistence flow from the profile menu.
  onPhotoUpload: (file: File) => void;
  // Persist user-authored guidance for either plant source across the profile tabs.
  onSavePlantContent: (update: PlantProfileContentUpdate) => Promise<boolean>;
  onDelete?: () => void;
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

const PlantDetail: React.FC<PlantDetailProps> = ({ plant, plants, options, onClose, onPhotoUpload, onSavePlantContent, onDelete }) => {
  const [tab, setTab] = useState<TabId>(0);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [setup, setSetup] = useState<PlantSetup>(() => loadPlantSetup(plant, options.soils));
  const [editingSetup, setEditingSetup] = useState(false);
  const [setupDraft, setSetupDraft] = useState<PlantSetup>(setup);
  // Include custom plants so their calendar events can be logged from any profile.
  const [careEvents, setCareEvents] = useState<CalendarCareEvent[]>(() => plants.flatMap(savedPlant => {
    try {
      const saved = localStorage.getItem(`garden-care-events-${savedPlant.id}`);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((event): event is CareEvent =>
        event && typeof event === 'object' &&
        // Keep Location records visible alongside the plant's other care events.
        ['watering', 'fertilizing', 'potted', 'repotted', 'location'].includes((event as CareEvent).type) &&
        typeof (event as CareEvent).date === 'string' && typeof (event as CareEvent).id === 'string')
        .map(event => ({ plantId: savedPlant.id, plantName: savedPlant.name, event }));
    } catch { return []; }
  }));

  // Close profile actions when the user clicks outside the menu.
  useEffect(() => {
    if (!actionsMenuOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) setActionsMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [actionsMenuOpen]);

  const logCareEvent = async (plantId: string, event: CareEvent) => {
    const selectedPlant = plants.find(item => item.id === plantId);
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
    // Keep the home-card watering age synchronized with profile calendar edits.
    window.dispatchEvent(new Event('garden-care-events-updated'));

    if (event.type === 'potted' || event.type === 'repotted') {
      const existingSetup = loadPlantSetup(selectedPlant, options.soils);
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

  // Remove the matching care record and clear its setup date when applicable.
  const deleteCareEvent = async (plantId: string, event: CareEvent) => {
    const targetPlant = plants.find(item => item.id === plantId);
    if (!targetPlant) return;
    const updatedEvents = careEvents.filter(item => !(item.plantId === plantId && item.event.id === event.id && item.event.type === event.type));
    setCareEvents(updatedEvents);
    try {
      localStorage.setItem(`garden-care-events-${plantId}`, JSON.stringify(
        updatedEvents.filter(item => item.plantId === plantId).map(item => item.event),
      ));
    } catch { /* Keep the event removed for this session if browser storage is unavailable. */ }
    // Recalculate the home-card watering age after a profile record is removed.
    window.dispatchEvent(new Event('garden-care-events-updated'));

    let updatedSetup: PlantSetup | undefined;
    if (event.type === 'potted' || event.type === 'repotted') {
      const currentSetup = loadPlantSetup(targetPlant, options.soils);
      updatedSetup = {
        ...currentSetup,
        ...(event.type === 'potted' && currentSetup.pottedOn === event.date ? { pottedOn: '' } : {}),
        ...(event.type === 'repotted' && currentSetup.repotted === event.date ? { repotted: '' } : {}),
      };
      try { localStorage.setItem(`garden-setup-${plantId}`, JSON.stringify(updatedSetup)); }
      catch { /* Keep the cleared setup date for this session if browser storage is unavailable. */ }
      if (plantId === plant.id) {
        setSetup(updatedSetup);
        setSetupDraft(updatedSetup);
      }
    }

    try {
      await window.gardenDesktop?.deleteCareEvent({
        id: plantId, name: targetPlant.name, source: targetPlant.isCustom ? 'custom' : 'built-in',
        eventId: event.id, type: event.type, date: event.date, ...(updatedSetup ? { setup: updatedSetup } : {}),
      });
    } catch (error) {
      console.error('Unable to delete the care event from the garden data file.', error);
      window.alert('The event was removed from this session, but could not be deleted from the garden data file.');
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
        padding: '16px 10px 12px 18px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
      }} className="plant-profile-header">
        <div style={{ width: 54, height: 54, flexShrink: 0 }}>
          {/* Show an uploaded photo beside the name, falling back to the plant illustration. */}
          {plant.photo
            ? <img src={plant.photo} alt={`${plant.name} photo`} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 12 }} />
            : <plant.icon accent={plant.accent} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div className="plant-name" style={{ fontSize: 18, color: '#1A3A0A', lineHeight: 1.2 }}>{plant.name}</div>
            {/* Anchor Android profile actions below the close control. */}
            <div className="plant-profile-actions" ref={actionsMenuRef} style={{ position: 'relative', flexShrink: 0, alignSelf: 'center' }}>
              <Button onClick={() => setActionsMenuOpen(open => !open)} icon="⚙️" color="#2D6B28"
                ariaLabel={`Options for ${plant.name}`} style={{ background: '#E7F3E2', border: '1px solid #2D6B28', color: '#24561F' }}>
                Options
              </Button>
              {actionsMenuOpen && <div role="group" aria-label={`${plant.name} options`} style={{
                position: 'absolute', top: 'calc(100% + 5px)', right: 0, zIndex: 30,
                display: 'grid', gap: 7, minWidth: 190, padding: 10,
                border: '1px solid #D5E2CB', borderRadius: 14, background: 'rgba(255,255,255,0.98)',
                boxShadow: '0 8px 22px rgba(35,65,25,0.16)',
              }}>
                <Button onClick={() => { setActionsMenuOpen(false); photoInputRef.current?.click(); }} icon="📷" color="#4A8C3A">
                  Add/change photo
                </Button>
                {onDelete && <Button onClick={() => { setActionsMenuOpen(false); onDelete(); }} icon="🗑️" color="#C04040">
                  Delete plant
                </Button>}
              </div>}
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={event => {
                const file = event.currentTarget.files?.[0];
                if (file) onPhotoUpload(file);
                event.currentTarget.value = '';
              }} />
            </div>
          </div>
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
        {/* Keep the profile close control compact on Android phones. */}
        <button
          className="plant-profile-close"
          type="button"
          onClick={onClose}
          aria-label="Close plant profile"
          title="Close plant profile"
          style={{
            position: 'absolute', top: 8, right: 10, flexShrink: 0,
            width: 34, height: 34, border: '1px solid rgba(80,80,80,0.2)',
            borderRadius: '50%', background: 'rgba(255,255,255,0.75)',
            color: '#4A5A3A', fontSize: 22, lineHeight: 1, cursor: 'pointer',
          }}
        >{Emoji.close}</button>
      </div>

      <div className="plant-profile-tabs" style={{ display: 'flex', borderBottom: '1.5px solid #E8F0E0' }}>
        {TABS.map(t => {
          const [icon, ...label] = t.label.split(' ');
          return <button className="plant-profile-tab" key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'rgba(255,255,255,1)' : 'rgba(240,247,234,0.6)',
            borderBottom: tab === t.id ? `2.5px solid ${plant.accent}` : '2.5px solid transparent',
            fontSize: 14, fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? plant.accent : '#7A9A6A',
            transition: 'all 0.15s',
          }}><span className="plant-profile-tab-icon" aria-hidden="true">{icon}</span><span className="plant-profile-tab-label">{label.join(' ')}</span></button>;
        })}
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
            plants={plants}
            options={options}
            onLogCareEvent={logCareEvent}
            onDeleteCareEvent={deleteCareEvent}
          />
        )}
        {tab === 1 && <CareTab plant={plant} onSavePlantContent={onSavePlantContent} />}
        {tab === 2 && <FertilizerTab plant={plant} onSavePlantContent={onSavePlantContent} />}
        {tab === 3 && <TricksTab plant={plant} onSavePlantContent={onSavePlantContent} />}
        {tab === 4 && <DiseasesTab plant={plant} onSavePlantContent={onSavePlantContent} />}
      </div>
    </div>
  );
};

export default PlantDetail;

