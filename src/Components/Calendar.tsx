import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { WEEKDAYS } from '../Resources/Constants';
import { Emoji } from '../Resources/Emoji';
import type { CalendarCareEvent, CareEvent, CareEventType, FertilizerMethod, GardenOptions } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import Button from './Button';
import StyledScrollArea from './StyledScrollArea';
import Dropdown from './Dropdown';

interface PlantCalendarProps {
  plant: Plant;
  pottedOn: string;
  repotted: string;
  nextRepot: string;
  careEvents: CalendarCareEvent[];
  plants: Plant[];
  // Settings-provided lists keep all event choices synchronized with the settings dialog.
  options: GardenOptions;
  onLogCareEvent: (plantId: string, event: CareEvent) => void;
  onDeleteCareEvent: (plantId: string, event: CareEvent) => void;
}

// Keep source records attached so day details can remove the matching event.
type CalendarEvent = { key: string; label: string; color: string; record?: CalendarCareEvent };

// Match each calendar action to its requested water, plant-care, and pot color.
const CARE_COLORS: Record<CareEventType, string> = {
  watering: '#2787C9', fertilizing: '#91C96B', potted: '#8B5A2B', repotted: '#292929', location: '#F0C644',
};

const parseDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

const toDateValue = (date: Date): string => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

const formatDate = (value: string): string => {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date) : 'Not set';
};

const Calendar: React.FC<PlantCalendarProps> = ({ plant, pottedOn, repotted, nextRepot, careEvents, plants, options, onLogCareEvent, onDeleteCareEvent }) => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateValue(new Date()));
  const [addingEvent, setAddingEvent] = useState(false);
  const [showEventsDate, setShowEventsDate] = useState<string | null>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<{ record: CalendarCareEvent; label: string } | null>(null);
  const [eventType, setEventType] = useState<CareEventType>('watering');
  const [eventPlantId, setEventPlantId] = useState(plant.id);
  const [fertilizerMethod, setFertilizerMethod] = useState<FertilizerMethod | ''>('');
  const [eventPotMaterial, setEventPotMaterial] = useState('');
  const [eventSubstrate, setEventSubstrate] = useState('');
  // Reset room selection with the other transient event-form values.
  const [eventRoom, setEventRoom] = useState('');

  const resetEventForm = () => {
    setEventType('watering');
    setEventPlantId(plant.id);
    setFertilizerMethod('');
    setEventPotMaterial('');
    setEventSubstrate('');
    setEventRoom('');
  };

  const openAddEvent = () => {
    resetEventForm();
    setAddingEvent(true);
  };

  // Keep taps focused on date selection; Android event details stay behind the Events action.
  const selectCalendarDate = (dateValue: string) => {
    setSelectedDate(dateValue);
  };

  const firstOffset = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const weekCount = Math.ceil((firstOffset + daysInMonth) / 7);
  const trailingOffset = weekCount * 7 - firstOffset - daysInMonth;
  const weekRowHeight = Math.max(88, Math.min(108, Math.floor((viewportHeight - 460) / weekCount)));
  const compactCells = weekRowHeight < 100;
  const visibleEventCount = compactCells ? 1 : 2;
  const today = toDateValue(new Date());
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(visibleMonth);
  const changeMonth = (offset: number) => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  // Ignore cached calendar records once their plant is no longer active.
  const activePlantIds = new Set(plants.map(item => item.id));
  const activeCareEvents = careEvents.filter(item => activePlantIds.has(item.plantId));

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  const addCareEvent = () => {
    const event: CareEvent = { id: `${eventType}-${selectedDate}`, type: eventType, date: selectedDate };
    if (eventType === 'fertilizing') {
      if (!fertilizerMethod) return;
      event.fertilizerMethod = fertilizerMethod;
    }
    if (eventType === 'location') {
      if (!eventRoom) return;
      event.room = eventRoom;
    }
    if (eventType === 'potted' || eventType === 'repotted') {
      if (!eventPotMaterial || !eventSubstrate) return;
      event.potMaterial = eventPotMaterial;
      event.substrate = eventSubstrate;
    }
    onLogCareEvent(eventPlantId, event);
    resetEventForm();
    setAddingEvent(false);
  };

  const eventsForDate = (dateValue: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    if (dateValue === pottedOn && !activeCareEvents.some(item => item.plantId === plant.id && item.event.type === 'potted' && item.event.date === dateValue)) {
      const event: CareEvent = { id: `potted-${pottedOn}`, type: 'potted', date: pottedOn };
      events.push({ key: 'potted', label: `${plant.name} · Potted`, color: CARE_COLORS.potted,
        record: { plantId: plant.id, plantName: plant.name, event } });
    }
    if (dateValue === repotted && !activeCareEvents.some(item => item.plantId === plant.id && item.event.type === 'repotted' && item.event.date === dateValue)) {
      const event: CareEvent = { id: `repotted-${repotted}`, type: 'repotted', date: repotted };
      events.push({ key: 'repotted', label: `${plant.name} · Repotted`, color: CARE_COLORS.repotted,
        record: { plantId: plant.id, plantName: plant.name, event } });
    }
    if (dateValue === nextRepot) events.push({ key: 'next-repot', label: 'Next repot', color: '#D59A2A' });
    activeCareEvents.filter(item => item.event.date === dateValue).forEach(item => events.push({
      key: `${item.plantId}-${item.event.id}`,
      label: `${item.plantName} · ${eventLabel(item.event)}`,
      color: CARE_COLORS[item.event.type],
      record: item,
    }));
    return events;
  };
  const selectedDayEvents = showEventsDate ? eventsForDate(showEventsDate) : [];
  const addRecordFromDayDetails = () => {
    if (!showEventsDate) return;
    setSelectedDate(showEventsDate);
    resetEventForm();
    setShowEventsDate(null);
    setAddingEvent(true);
  };

  return (
    <section className="garden-calendar" aria-label={`${plant.name} calendar and care schedule`} style={{
      minWidth: 0, padding: 16, border: '1px solid #DDE9D3', borderRadius: 22,
      background: 'linear-gradient(145deg,#FBFDF8,#F3F8EE)',
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} style={monthButtonStyle(plant.accent)}>{Emoji.previousMonth}</button>
          <div aria-live="polite" style={{ fontSize: 16, fontWeight: 700, color: '#2A4A1A', textAlign: 'center' }}>{monthLabel}</div>
          <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} style={monthButtonStyle(plant.accent)}>{Emoji.nextMonth}</button>
        </div>
      </div>

      <div className="garden-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gridTemplateRows: `auto repeat(${weekCount}, var(--garden-calendar-row-height, ${weekRowHeight}px))`, gap: 3 }}>
        {WEEKDAYS.map(day => <div className="garden-calendar-weekday" key={day} style={{ padding: '6px 2px', textAlign: 'center', color: '#71856A', fontSize: 11, fontWeight: 700, border: '1px solid #D8E2D2', borderRadius: 8, background: 'rgba(255,255,255,0.5)' }}>{day}</div>)}
        {Array.from({ length: firstOffset }, (_, index) => <div key={`blank-${index}`} aria-hidden="true" style={{ height: '100%', boxSizing: 'border-box', border: '1px solid #D8E2D2', borderRadius: 9, background: '#F4F7F1' }} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const dateValue = toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1));
          const events = eventsForDate(dateValue);
          const isToday = dateValue === today;
          const isSelected = dateValue === selectedDate;
          const ariaEvents = events.map(event => event.label).join(', ');
          return (
            <div className="garden-calendar-cell" key={dateValue} role="group" tabIndex={0}
              aria-label={`${formatDate(dateValue)}${ariaEvents ? `: ${ariaEvents}` : ''}`}
              onClick={() => selectCalendarDate(dateValue)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectCalendarDate(dateValue);
                }
              }}
              style={{
              minWidth: 0, minHeight: 0, height: '100%', boxSizing: 'border-box', padding: 3, border: '1px solid #D8E2D2', borderRadius: 9,
              display: 'flex', flexDirection: 'column', cursor: 'pointer',
              background: isSelected ? `${plant.accent}12` : 'rgba(255,255,255,0.72)',
              boxShadow: isSelected ? `inset 0 0 0 2px ${plant.accent}` : undefined,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span aria-hidden="true" style={{
                  width: compactCells ? 20 : 25, height: compactCells ? 20 : 25, padding: 0, border: isToday ? `1px solid ${plant.accent}` : '1px solid transparent',
                  borderRadius: '50%', background: isToday ? `${plant.accent}18` : 'transparent',
                  display: 'grid', placeItems: 'center', color: '#344B2E', fontSize: compactCells ? 11 : 12, fontWeight: isToday ? 700 : 500,
                }}>{index + 1}</span>
              </div>
              <div style={{ display: 'grid', gap: 2, marginTop: 2, overflow: 'hidden' }}>
                {/* Use dark text on the lighter fertilizer and location chip backgrounds. */}
                {events.slice(0, visibleEventCount).map(event => <div className="garden-calendar-event-label" key={event.key} title={event.label} style={{
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', borderRadius: 3,
                  padding: '2px 3px', background: event.color,
                  color: event.color === CARE_COLORS.fertilizing || event.color === CARE_COLORS.location ? '#26351F' : 'white',
                  fontSize: 9, lineHeight: 1.15,
                }}>{event.label}</div>)}
                {events.length > visibleEventCount && <div className="garden-calendar-event-overflow" style={{ color: '#65745E', fontSize: 9, paddingLeft: 2 }}>+{events.length - visibleEventCount} more</div>}
                {/* Show up to six phone markers in two rows without hiding event details from accessibility. */}
                {events.length > 0 && <div className="garden-calendar-event-markers" aria-hidden="true" style={{ display: 'none' }}>
                  <div className="garden-calendar-event-dot-grid">
                    {events.slice(0, 6).map(event => <span className="garden-calendar-event-dot" key={event.key} style={{ background: event.color }} />)}
                  </div>
                  {events.length > 6 && <span className="garden-calendar-event-count">+{events.length - 6}</span>}
                </div>}
              </div>
              {isSelected && <div className="calendar-cell-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: 3 }}>
                <Button onClick={openAddEvent} icon={Emoji.plus} ariaLabel={`Add event on ${formatDate(dateValue)}`} color={plant.accent} size="compact">{''}</Button>
                {events.length > 0 && <Button onClick={() => setShowEventsDate(dateValue)} icon={Emoji.magnifyingGlass}
                  ariaLabel={`View ${events.length} event${events.length === 1 ? '' : 's'} on ${formatDate(dateValue)}`} color={plant.accent} size="compact">{''}</Button>}
              </div>}
            </div>
          );
        })}
        {Array.from({ length: trailingOffset }, (_, index) => <div key={`trailing-${index}`} aria-hidden="true" style={{ height: '100%', boxSizing: 'border-box', border: '1px solid #D8E2D2', borderRadius: 9, background: '#F4F7F1' }} />)}
      </div>

      {/* Keep Android date actions outside the narrow day cells to prevent button overlap. */}
      <div className="calendar-selected-actions" aria-label={`Actions for ${formatDate(selectedDate)}`} style={{ display: 'none' }}>
        <div style={{ minWidth: 0, display: 'grid', gap: 2 }}>
          <strong style={{ color: '#344B2E', fontSize: 12 }}>{formatDate(selectedDate)}</strong>
          <span style={{ color: '#71856A', fontSize: 10 }}>{eventsForDate(selectedDate).length} events</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button onClick={openAddEvent} icon={Emoji.plus} ariaLabel={`Add event on ${formatDate(selectedDate)}`} color={plant.accent} size="compact">Add</Button>
          {eventsForDate(selectedDate).length > 0 && <Button onClick={() => setShowEventsDate(selectedDate)} icon={Emoji.magnifyingGlass}
            ariaLabel={`View events on ${formatDate(selectedDate)}`} color={plant.accent} size="compact">Events</Button>}
        </div>
      </div>

      {addingEvent && <div role="presentation" style={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center',
        padding: 20, background: 'rgba(24,35,20,0.42)',
      }}>
        <div role="dialog" aria-modal="true" aria-labelledby="calendar-event-title" style={{
          width: 'min(100%, 520px)', boxSizing: 'border-box', padding: 18, border: `1px solid ${plant.accent}55`, borderRadius: 20,
          background: '#FBFDF8', boxShadow: '0 18px 55px rgba(25,45,20,0.28)',
        }}>
          <h2 id="calendar-event-title" style={{ margin: '0 0 4px', color: '#2A4A1A', fontSize: 19 }}>Add calendar event</h2>
          <div style={{ marginBottom: 14, color: '#71856A', fontSize: 13 }}>{formatDate(selectedDate)}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Plant</div>
              <Dropdown ariaLabel="Plant for calendar event" value={eventPlantId} onChange={setEventPlantId} accent={plant.accent}
                options={plants.map(option => ({ value: option.id, label: option.name }))} />
            </div>
            <div>
              <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Event</div>
              <Dropdown ariaLabel="Calendar event type" value={eventType} onChange={value => setEventType(value as CareEventType)} accent={plant.accent}
                options={[
                  { value: 'watering', label: 'Watered' }, { value: 'fertilizing', label: 'Fertilized' },
                  { value: 'potted', label: 'Potted' }, { value: 'repotted', label: 'Repotted' },
                  { value: 'location', label: 'Location' },
                ]} />
            </div>
            {eventType === 'location' && <div>
              {/* Require an Add info room so Location entries stay consistent with setup choices. */}
              <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Room</div>
              <Dropdown ariaLabel="Room for location event" value={eventRoom} onChange={setEventRoom} accent={plant.accent}
                placeholder="Choose a room" options={options.rooms.map(value => ({ value, label: value }))} />
            </div>}
            {eventType === 'fertilizing' && <div>
              <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Fertilizer</div>
              <Dropdown ariaLabel="Fertilizer type" value={fertilizerMethod} onChange={value => setFertilizerMethod(value as FertilizerMethod)} accent={plant.accent}
                placeholder="Choose fertilizer"
                options={options.fertilizers.map(value => ({ value, label: value }))} />
            </div>}
            {(eventType === 'potted' || eventType === 'repotted') && <>
              <div>
                <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Pot material</div>
                <Dropdown ariaLabel="Pot material" value={eventPotMaterial} onChange={setEventPotMaterial} accent={plant.accent}
                  placeholder="Pot material" options={options.potMaterials.map(value => ({ value, label: value }))} />
              </div>
              <div>
                <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Soil</div>
                <Dropdown ariaLabel="Soil type" value={eventSubstrate} onChange={setEventSubstrate} accent={plant.accent}
                  placeholder="Soil" options={options.soils.map(value => ({ value, label: value }))} />
              </div>
            </>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button onClick={addCareEvent} icon={Emoji.seedling} color="#4A8C3A"
              disabled={(eventType === 'fertilizing' && !fertilizerMethod)
                || (eventType === 'location' && !eventRoom)
                || ((eventType === 'potted' || eventType === 'repotted') && (!eventPotMaterial || !eventSubstrate))}>Save</Button>
            <Button onClick={() => setAddingEvent(false)} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
          </div>
        </div>
      </div>}

      {showEventsDate && <div role="presentation" onMouseDown={event => {
        if (event.target === event.currentTarget) setShowEventsDate(null);
      }} style={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center',
        padding: 20, background: 'rgba(24,35,20,0.42)',
      }}>
        {/* Keep long day-event lists scrollable with the app's shared scrollbar. */}
        <StyledScrollArea role="dialog" ariaLabel="Events for this day" ariaModal ariaLabelledBy="calendar-day-events-title" style={{
          width: 'min(100%, 420px)', maxHeight: 'min(80vh, 600px)',
          padding: 22, border: `1px solid ${plant.accent}55`, borderRadius: 20,
          background: '#FBFDF8', boxShadow: '0 18px 55px rgba(25,45,20,0.28)',
        }}>
          <h2 id="calendar-day-events-title" style={{ margin: '0 0 4px', color: '#2A4A1A', fontSize: 19 }}>Events for this day</h2>
          <div style={{ marginBottom: 16, color: '#71856A', fontSize: 13 }}>{formatDate(showEventsDate)}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {isAndroid && selectedDayEvents.length === 0 && <div style={{ padding: '10px 2px', color: '#71856A', fontSize: 13 }}>No records on this day yet.</div>}
            {selectedDayEvents.map(event => <div key={event.key} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10,
              background: `${event.color}14`, color: '#40563A', fontSize: 13,
            }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, flexShrink: 0, borderRadius: 3, background: event.color }} />
              <span style={{ flex: 1 }}>{event.label}</span>
              {/* Show delete only for saved records; calculated next-repot reminders stay read-only. */}
              {event.record && <Button onClick={() => setPendingDeleteEvent({ record: event.record!, label: event.label })}
                icon="🗑️" color="#C04040" size="compact" ariaLabel={`Delete ${event.label}`} title="Delete event">
                Delete
              </Button>}
            </div>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            {isAndroid && <Button onClick={addRecordFromDayDetails} icon={Emoji.plus} color={plant.accent}>Add record</Button>}
            <Button onClick={() => setShowEventsDate(null)} color={plant.accent}>Close</Button>
          </div>
        </StyledScrollArea>
      </div>}

      {/* Confirm event removal in the app so a stray click cannot erase a record. */}
      {pendingDeleteEvent && <div role="presentation" onMouseDown={event => {
        if (event.target === event.currentTarget) setPendingDeleteEvent(null);
      }} style={{
        position: 'fixed', inset: 0, zIndex: 1101, display: 'grid', placeItems: 'center',
        padding: 20, background: 'rgba(24,35,20,0.52)',
      }}>
        <div role="alertdialog" aria-modal="true" aria-labelledby="calendar-delete-title"
          aria-describedby="calendar-delete-message" onMouseDown={event => event.stopPropagation()} style={{
            width: 'min(100%, 390px)', padding: 22, border: `1px solid ${plant.accent}55`, borderRadius: 20,
            background: '#FBFDF8', boxShadow: '0 18px 55px rgba(25,45,20,0.28)',
          }}>
          <h2 id="calendar-delete-title" style={{ margin: '0 0 8px', color: '#2A4A1A', fontSize: 19 }}>Confirm deletion</h2>
          <p id="calendar-delete-message" style={{ margin: 0, color: '#53684B', fontSize: 14, lineHeight: 1.5 }}>
            Are you sure you want to delete this event?
          </p>
          <p style={{ margin: '8px 0 0', color: '#71856A', fontSize: 13 }}>{pendingDeleteEvent.label}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button onClick={() => setPendingDeleteEvent(null)} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
            <Button onClick={() => {
              onDeleteCareEvent(pendingDeleteEvent.record.plantId, pendingDeleteEvent.record.event);
              setPendingDeleteEvent(null);
            }} icon="🗑️" color="#C04040">Delete event</Button>
          </div>
        </div>
      </div>}

    </section>
  );
};

const monthButtonStyle = (accent: string): React.CSSProperties => ({
  width: 34, height: 34, flexShrink: 0, border: `1px solid ${accent}40`, borderRadius: 9,
  background: 'white', color: accent, fontSize: 22, lineHeight: 1, cursor: 'pointer',
});

// Include the chosen room in calendar labels so location records are identifiable.
const eventLabel = (event: CareEvent): string => {
  if (event.type === 'watering') return 'Watered';
  if (event.type === 'fertilizing') return `Fertilized${event.fertilizerMethod ? ` · ${event.fertilizerMethod}` : ''}`;
  if (event.type === 'location') return `Location${event.room ? ` · ${event.room}` : ''}`;
  if (event.type === 'potted' || event.type === 'repotted') {
    const action = event.type === 'potted' ? 'Potted' : 'Repotted';
    const details = [event.potMaterial, event.substrate].filter(Boolean).join(' · ');
    return details ? `${action} · ${details}` : action;
  }
  return 'Event';
};

export default Calendar;
