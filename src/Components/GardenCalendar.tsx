import React, { useState } from 'react';
import { PLANTS } from '../Resources/Constants';
import type { CalendarCareEvent, CareEvent } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import { loadPlantSetup } from '../Tabs/SetupTab';
import Calendar from './Calendar';

const isCareEvent = (value: unknown): value is CareEvent => Boolean(
  value && typeof value === 'object' &&
  ['watering', 'fertilizing', 'potted', 'repotted'].includes((value as CareEvent).type) &&
  typeof (value as CareEvent).date === 'string' && typeof (value as CareEvent).id === 'string',
);

const loadGardenEvents = (): CalendarCareEvent[] => PLANTS.flatMap(plant => {
  let events: CalendarCareEvent[] = [];
  try {
    const saved = localStorage.getItem(`garden-care-events-${plant.id}`);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (Array.isArray(parsed)) {
      events = parsed.filter(isCareEvent).map(event => ({ plantId: plant.id, plantName: plant.name, event }));
    }
  } catch { /* Continue with any valid setup dates if stored events cannot be read. */ }

  const setup = loadPlantSetup(plant);
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

const GardenCalendar: React.FC = () => {
  const [careEvents, setCareEvents] = useState<CalendarCareEvent[]>(loadGardenEvents);
  const calendarPlant: Plant = PLANTS[0];

  const logCareEvent = async (plantId: string, event: CareEvent) => {
    const targetPlant = PLANTS.find(plant => plant.id === plantId);
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
      const setup = loadPlantSetup(targetPlant);
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

  return <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
    <Calendar plant={calendarPlant} pottedOn="" repotted="" nextRepot=""
      careEvents={careEvents} plants={PLANTS} onLogCareEvent={logCareEvent} />
  </div>;
};

export default GardenCalendar;
