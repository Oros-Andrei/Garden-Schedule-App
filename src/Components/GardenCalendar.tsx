import React, { useState } from 'react';
import type { CalendarCareEvent, CareEvent, GardenOptions } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import { loadPlantSetup } from '../Tabs/SetupTab';
import Calendar from './Calendar';

const isCareEvent = (value: unknown): value is CareEvent => Boolean(
  value && typeof value === 'object' &&
  ['watering', 'fertilizing', 'potted', 'repotted'].includes((value as CareEvent).type) &&
  typeof (value as CareEvent).date === 'string' && typeof (value as CareEvent).id === 'string',
);

const loadGardenEvents = (plants: Plant[], options: GardenOptions): CalendarCareEvent[] => plants.flatMap(plant => {
  let events: CalendarCareEvent[] = [];
  try {
    const saved = localStorage.getItem(`garden-care-events-${plant.id}`);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (Array.isArray(parsed)) {
      events = parsed.filter(isCareEvent).map(event => ({ plantId: plant.id, plantName: plant.name, event }));
    }
  } catch { /* Continue with any valid setup dates if stored events cannot be read. */ }

  const setup = loadPlantSetup(plant, options.soils);
  const setupEvents: CalendarCareEvent[] = [];
  if (setup.pottedOn) setupEvents.push({
    plantId: plant.id, plantName: plant.name,
    event: { id: `potted-${setup.pottedOn}`, type: 'potted', date: setup.pottedOn, potMaterial: setup.potMaterial, substrate: setup.substrate },
  });
  if (setup.repotted) setupEvents.push({
    plantId: plant.id, plantName: plant.name,
    event: { id: `repotted-${setup.repotted}`, type: 'repotted', date: setup.repotted, potMaterial: setup.potMaterial, substrate: setup.substrate },
  });

  const replacedTypes = new Set(setupEvents.map(item => item.event.type));
  return [...events.filter(item => !replacedTypes.has(item.event.type)), ...setupEvents];
});

// Accept live settings so shared-calendar events use the configured choices.
const GardenCalendar: React.FC<{ plants: Plant[]; options: GardenOptions }> = ({ plants, options }) => {
  // Derive events from the same dynamic plant list used by the category view.
  const [careEvents, setCareEvents] = useState<CalendarCareEvent[]>(() => loadGardenEvents(plants, options));
  const calendarPlant: Plant = plants[0];

  const logCareEvent = async (plantId: string, event: CareEvent) => {
    const targetPlant = plants.find(plant => plant.id === plantId);
    if (!targetPlant) return;
    const replacesPlantType = event.type === 'potted' || event.type === 'repotted';
    const updatedEvents = [
      ...careEvents.filter(item => !(item.plantId === plantId && item.event.type === event.type &&
        (replacesPlantType || item.event.date === event.date))),
      { plantId, plantName: targetPlant.name, event },
    ];
    setCareEvents(updatedEvents);
    try {
      localStorage.setItem(`garden-care-events-${plantId}`, JSON.stringify(
        updatedEvents.filter(item => item.plantId === plantId).map(item => item.event),
      ));
    } catch { /* Keep the event visible for this session if browser storage is unavailable. */ }

    if (replacesPlantType) {
      const setup = loadPlantSetup(targetPlant, options.soils);
      const updatedSetup = {
        ...setup,
        potMaterial: event.potMaterial ?? setup.potMaterial,
        substrate: event.substrate ?? setup.substrate,
        ...(event.type === 'potted' ? { pottedOn: event.date } : { repotted: event.date }),
      };
      try { localStorage.setItem(`garden-setup-${plantId}`, JSON.stringify(updatedSetup)); }
      catch { /* The event remains visible for this session if browser storage is unavailable. */ }
    }

    try {
      await window.gardenDesktop?.logCareEvent({ id: plantId, name: targetPlant.name, event });
    } catch (error) {
      console.error('Unable to save the care event to the garden data file.', error);
      window.alert('The event is visible for this session, but could not be saved to the garden data file.');
    }
  };

  // Remove a saved record from the shared calendar and keep setup dates in sync.
  const deleteCareEvent = async (plantId: string, event: CareEvent) => {
    const targetPlant = plants.find(plant => plant.id === plantId);
    if (!targetPlant) return;
    const updatedEvents = careEvents.filter(item => !(item.plantId === plantId && item.event.id === event.id && item.event.type === event.type));
    setCareEvents(updatedEvents);
    try {
      localStorage.setItem(`garden-care-events-${plantId}`, JSON.stringify(
        updatedEvents.filter(item => item.plantId === plantId).map(item => item.event),
      ));
    } catch { /* Keep the event removed for this session if browser storage is unavailable. */ }

    let updatedSetup: ReturnType<typeof loadPlantSetup> | undefined;
    if (event.type === 'potted' || event.type === 'repotted') {
      const currentSetup = loadPlantSetup(targetPlant, options.soils);
      updatedSetup = {
        ...currentSetup,
        ...(event.type === 'potted' && currentSetup.pottedOn === event.date ? { pottedOn: '' } : {}),
        ...(event.type === 'repotted' && currentSetup.repotted === event.date ? { repotted: '' } : {}),
      };
      try { localStorage.setItem(`garden-setup-${plantId}`, JSON.stringify(updatedSetup)); }
      catch { /* Keep the cleared setup date for this session if browser storage is unavailable. */ }
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

  return <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
    <Calendar plant={calendarPlant} pottedOn="" repotted="" nextRepot=""
      careEvents={careEvents} plants={plants} options={options} onLogCareEvent={logCareEvent} onDeleteCareEvent={deleteCareEvent} />
  </div>;
};

export default GardenCalendar;
