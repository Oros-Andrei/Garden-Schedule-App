import React, { useEffect, useState } from 'react';
import { POT_MATERIAL_OPTIONS, SOIL_OPTIONS, WEEKDAYS } from '../Resources/Constants';
import { Emoji } from '../Resources/Emoji';
import type { CalendarCareEvent, CareEvent, CareEventType, FertilizerMethod } from '../Resources/GardenData';
import type { Plant } from '../Resources/Types';
import Button from './Button';
import Dropdown from './Dropdown';

interface PlantCalendarProps {
  plant: Plant;
  pottedOn: string;
  repotted: string;
  nextRepot: string;
  careEvents: CalendarCareEvent[];
  plants: Plant[];
  onLogCareEvent: (plantId: string, event: CareEvent) => void;
}

type CalendarEvent = { key: string; label: string; color: string };

const CARE_COLORS: Record<CareEventType, string> = {
  watering: '#328B83', fertilizing: '#8B62A8', potted: '#4A86C5', repotted: '#C0574A',
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

const Calendar: React.FC<PlantCalendarProps> = ({ plant, pottedOn, repotted, nextRepot, careEvents, plants, onLogCareEvent }) => {
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateValue(new Date()));
  const [addingEvent, setAddingEvent] = useState(false);
  const [showEventsDate, setShowEventsDate] = useState<string | null>(null);
  const [eventType, setEventType] = useState<CareEventType>('watering');
  const [eventPlantId, setEventPlantId] = useState(plant.id);
  const [fertilizerMethod, setFertilizerMethod] = useState<FertilizerMethod | ''>('');
  const [eventPotMaterial, setEventPotMaterial] = useState('');
  const [eventSubstrate, setEventSubstrate] = useState('');

  const resetEventForm = () => {
    setEventType('watering');
    setEventPlantId(plant.id);
    setFertilizerMethod('');
    setEventPotMaterial('');
    setEventSubstrate('');
  };

  const openAddEvent = () => {
    resetEventForm();
    setAddingEvent(true);
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
    if (dateValue === pottedOn && !careEvents.some(item => item.plantId === plant.id && item.event.type === 'potted' && item.event.date === dateValue)) {
      events.push({ key: 'potted', label: `${plant.name} · Potted`, color: CARE_COLORS.potted });
    }
    if (dateValue === repotted && !careEvents.some(item => item.plantId === plant.id && item.event.type === 'repotted' && item.event.date === dateValue)) {
      events.push({ key: 'repotted', label: `${plant.name} · Repotted`, color: CARE_COLORS.repotted });
    }
    if (dateValue === nextRepot) events.push({ key: 'next-repot', label: 'Next repot', color: '#D59A2A' });
    careEvents.filter(item => item.event.date === dateValue).forEach(item => events.push({
      key: `${item.plantId}-${item.event.id}`,
      label: `${item.plantName} · ${eventLabel(item.event)}`,
      color: CARE_COLORS[item.event.type],
    }));
    return events;
  };

  return (
    <section aria-label={`${plant.name} calendar and care schedule`} style={{
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gridTemplateRows: `auto repeat(${weekCount}, ${weekRowHeight}px)`, gap: 3 }}>
        {WEEKDAYS.map(day => <div key={day} style={{ padding: '6px 2px', textAlign: 'center', color: '#71856A', fontSize: 11, fontWeight: 700, border: '1px solid #D8E2D2', borderRadius: 8, background: 'rgba(255,255,255,0.5)' }}>{day}</div>)}
        {Array.from({ length: firstOffset }, (_, index) => <div key={`blank-${index}`} aria-hidden="true" style={{ height: '100%', boxSizing: 'border-box', border: '1px solid #D8E2D2', borderRadius: 9, background: '#F4F7F1' }} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const dateValue = toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1));
          const events = eventsForDate(dateValue);
          const isToday = dateValue === today;
          const isSelected = dateValue === selectedDate;
          const ariaEvents = events.map(event => event.label).join(', ');
          return (
            <div key={dateValue} role="group" tabIndex={0}
              aria-label={`${formatDate(dateValue)}${ariaEvents ? `: ${ariaEvents}` : ''}`}
              onClick={() => setSelectedDate(dateValue)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedDate(dateValue);
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
                {events.slice(0, visibleEventCount).map(event => <div key={event.key} title={event.label} style={{
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', borderRadius: 3,
                  padding: '2px 3px', background: event.color, color: 'white', fontSize: 9, lineHeight: 1.15,
                }}>{event.label}</div>)}
                {events.length > visibleEventCount && <div style={{ color: '#65745E', fontSize: 9, paddingLeft: 2 }}>+{events.length - visibleEventCount} more</div>}
              </div>
              {isSelected && <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: 3 }}>
                <Button onClick={openAddEvent} icon={Emoji.plus} ariaLabel={`Add event on ${formatDate(dateValue)}`} color={plant.accent} size="compact">{''}</Button>
                {events.length > 0 && <Button onClick={() => setShowEventsDate(dateValue)} icon={Emoji.magnifyingGlass}
                  ariaLabel={`View ${events.length} event${events.length === 1 ? '' : 's'} on ${formatDate(dateValue)}`} color={plant.accent} size="compact">{''}</Button>}
              </div>}
            </div>
          );
        })}
        {Array.from({ length: trailingOffset }, (_, index) => <div key={`trailing-${index}`} aria-hidden="true" style={{ height: '100%', boxSizing: 'border-box', border: '1px solid #D8E2D2', borderRadius: 9, background: '#F4F7F1' }} />)}
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
                ]} />
            </div>
            {eventType === 'fertilizing' && <div>
              <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Fertilizer</div>
              <Dropdown ariaLabel="Fertilizer type" value={fertilizerMethod} onChange={value => setFertilizerMethod(value as FertilizerMethod)} accent={plant.accent}
                placeholder="Choose fertilizer"
                options={[
                  { value: 'Cucumber water', label: 'Cucumber water' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Banana Water', label: 'Banana Water' },
                ]} />
            </div>}
            {(eventType === 'potted' || eventType === 'repotted') && <>
              <div>
                <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Pot material</div>
                <Dropdown ariaLabel="Pot material" value={eventPotMaterial} onChange={setEventPotMaterial} accent={plant.accent}
                  placeholder="Pot material" options={POT_MATERIAL_OPTIONS.map(value => ({ value, label: value }))} />
              </div>
              <div>
                <div style={{ marginBottom: 6, color: '#53684B', fontSize: 12, fontWeight: 700 }}>Soil</div>
                <Dropdown ariaLabel="Soil type" value={eventSubstrate} onChange={setEventSubstrate} accent={plant.accent}
                  placeholder="Soil" options={SOIL_OPTIONS.map(value => ({ value, label: value }))} />
              </div>
            </>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button onClick={addCareEvent} icon={Emoji.seedling} color="#4A8C3A"
              disabled={(eventType === 'fertilizing' && !fertilizerMethod)
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
        <div role="dialog" aria-modal="true" aria-labelledby="calendar-day-events-title" style={{
          width: 'min(100%, 420px)', maxHeight: 'min(80vh, 600px)', overflowY: 'auto',
          padding: 22, border: `1px solid ${plant.accent}55`, borderRadius: 20,
          background: '#FBFDF8', boxShadow: '0 18px 55px rgba(25,45,20,0.28)',
        }}>
          <h2 id="calendar-day-events-title" style={{ margin: '0 0 4px', color: '#2A4A1A', fontSize: 19 }}>Events for this day</h2>
          <div style={{ marginBottom: 16, color: '#71856A', fontSize: 13 }}>{formatDate(showEventsDate)}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {eventsForDate(showEventsDate).map(event => <div key={event.key} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10,
              background: `${event.color}14`, color: '#40563A', fontSize: 13,
            }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, flexShrink: 0, borderRadius: 3, background: event.color }} />
              {event.label}
            </div>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <Button onClick={() => setShowEventsDate(null)} color={plant.accent}>Close</Button>
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

const eventLabel = (event: CareEvent): string => {
  if (event.type === 'watering') return 'Watered';
  if (event.type === 'fertilizing') return `Fertilized${event.fertilizerMethod ? ` · ${event.fertilizerMethod}` : ''}`;
  if (event.type === 'potted' || event.type === 'repotted') {
    const action = event.type === 'potted' ? 'Potted' : 'Repotted';
    const details = [event.potMaterial, event.substrate].filter(Boolean).join(' · ');
    return details ? `${action} · ${details}` : action;
  }
  return 'Event';
};

export default Calendar;
