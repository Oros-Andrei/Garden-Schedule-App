import React, { useEffect, useRef, useState } from 'react';
import { WEEKDAYS } from '../Constants';

interface DatePickerProps {
  value: string;
  onChange?: (value: string) => void;
  ariaLabel: string;
  accent?: string;
  disabled?: boolean;
}

const parseDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
    ? date
    : null;
};

const toDateValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (value: string): string => {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
    : 'Not set';
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange = () => {},
  ariaLabel,
  accent = '#5A7A4A',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [selectingMonthYear, setSelectingMonthYear] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selected = parseDate(value) ?? new Date();
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });
  const [draftDate, setDraftDate] = useState(() => value || toDateValue(new Date()));
  const rootRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const selectedDate = parseDate(value);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!selectingMonthYear || !yearListRef.current || !selectedYearRef.current) return;
    yearListRef.current.scrollTop = selectedYearRef.current.offsetTop - yearListRef.current.offsetTop
      - (yearListRef.current.clientHeight - selectedYearRef.current.offsetHeight) / 2;
  }, [selectingMonthYear, visibleMonth]);

  const firstOffset = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const todayValue = toDateValue(new Date());
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(visibleMonth);
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(currentYear - 100, visibleMonth.getFullYear());
  const lastYear = Math.max(currentYear + 20, visibleMonth.getFullYear());
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
  const months = Array.from({ length: 12 }, (_, month) => ({
    value: month,
    label: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(2000, month, 1)),
  }));

  const updateDraftMonth = (year: number, month: number) => {
    const currentDraft = parseDate(draftDate) ?? new Date();
    const day = Math.min(currentDraft.getDate(), new Date(year, month + 1, 0).getDate());
    setDraftDate(toDateValue(new Date(year, month, day)));
    setVisibleMonth(new Date(year, month, 1));
  };

  const openPicker = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
      return;
    }
    const initialDateValue = parseDate(value) ? value : toDateValue(new Date());
    const initialDate = parseDate(initialDateValue) ?? new Date();
    setDraftDate(initialDateValue);
    setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setSelectingMonthYear(false);
    setOpen(true);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', flex: '0 0 auto', width: 'max-content', maxWidth: '100%' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        aria-disabled={disabled}
        onClick={openPicker}
        style={{
          boxSizing: 'border-box', width: 'max-content', minHeight: 36, padding: '8px 11px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          border: `1px solid ${open ? accent : '#C8D8B8'}`, borderRadius: 12,
          background: 'white', color: selectedDate ? '#3A5A2A' : '#8A9A80',
          font: "14px 'Quicksand', 'Trebuchet MS', sans-serif", textAlign: 'left', cursor: disabled ? 'default' : 'pointer',
          boxShadow: open ? `0 0 0 2px ${accent}22` : '0 1px 3px rgba(40,70,30,0.06)',
          opacity: 1,
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>{formatDate(value)}</span>
        {!disabled && <span aria-hidden="true" style={{ color: accent, fontSize: 10 }}>{open ? '▴' : '▾'}</span>}
      </button>

      {open && !disabled && (
        <div
          role="dialog"
          aria-label={`${ariaLabel} calendar`}
          style={{
            position: 'absolute', zIndex: 25, top: 'calc(100% + 5px)', left: 0,
            width: 260, maxWidth: 'min(260px, calc(100vw - 40px))',
            padding: 12, border: '1px solid #D5E2CB', borderRadius: 14,
            background: 'rgba(255,255,255,0.99)', boxShadow: '0 8px 22px rgba(35,65,25,0.16)',
          }}
        >
          {!selectingMonthYear ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <button
                  type="button"
                  aria-label="Choose month and year"
                  aria-expanded={selectingMonthYear}
                  onClick={() => setSelectingMonthYear(current => !current)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${accent}40`, background: `${accent}12`, color: '#3A5A2A', font: "700 14px 'Quicksand', 'Trebuchet MS', sans-serif", cursor: 'pointer', padding: '6px 10px', borderRadius: 9 }}
                >
                  {monthLabel}
                  <span aria-hidden="true" style={{ color: accent, fontSize: 10 }}>{selectingMonthYear ? '▴' : '▾'}</span>
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {WEEKDAYS.map(day => (
                  <div key={day} style={{ padding: '4px 0', textAlign: 'center', color: '#8A9A80', font: "700 11px 'Quicksand', 'Trebuchet MS', sans-serif" }}>
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstOffset }, (_, index) => <span key={`blank-${index}`} />)}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
                  const dateValue = toDateValue(date);
                  const selected = draftDate === dateValue;
                  const today = todayValue === dateValue;
                  return (
                    <button
                      type="button"
                      key={dateValue}
                      aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date)}
                      aria-pressed={selected}
                      onClick={() => setDraftDate(dateValue)}
                      style={{
                        width: 30, height: 30, justifySelf: 'center', borderRadius: '50%',
                        border: today && !selected ? `1px solid ${accent}` : '1px solid transparent',
                        background: selected ? accent : 'transparent',
                        color: selected ? 'white' : '#3A5A2A',
                        font: "14px 'Quicksand', 'Trebuchet MS', sans-serif", cursor: 'pointer',
                      }}
                    >{day}</button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{ font: "700 14px 'Quicksand', 'Trebuchet MS', sans-serif", color: '#3A5A2A' }}>Choose month &amp; year</span>
              </div>
              <div
                ref={yearListRef}
                aria-label="Years"
                style={{ maxHeight: 108, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 10, padding: '2px 3px' }}
              >
                {years.map(year => {
                  const selected = visibleMonth.getFullYear() === year;
                  return (
                    <button
                      type="button"
                      key={year}
                      ref={selected ? selectedYearRef : undefined}
                      aria-pressed={selected}
                      onClick={() => updateDraftMonth(year, visibleMonth.getMonth())}
                      style={choiceButtonStyle(selected, accent)}
                    >{year}</button>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {months.map(month => {
                  const selected = visibleMonth.getMonth() === month.value;
                  return (
                    <button
                      type="button"
                      key={month.value}
                      aria-pressed={selected}
                      onClick={() => {
                        updateDraftMonth(visibleMonth.getFullYear(), month.value);
                      }}
                      style={choiceButtonStyle(selected, accent)}
                    >{month.label}</button>
                  );
                })}
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #E7EFE0' }}>
            <button
              type="button"
              onClick={() => {
                if (selectingMonthYear) {
                  const resetValue = parseDate(value) ? value : toDateValue(new Date());
                  const resetDate = parseDate(resetValue) ?? new Date();
                  setDraftDate(resetValue);
                  setVisibleMonth(new Date(resetDate.getFullYear(), resetDate.getMonth(), 1));
                  setSelectingMonthYear(false);
                  return;
                }
                setOpen(false);
              }}
              style={{ minHeight: 32, padding: '6px 12px', border: '1px solid #D5E2CB', borderRadius: 10, background: 'white', color: '#5A7A4A', font: "700 13px 'Quicksand', 'Trebuchet MS', sans-serif", cursor: 'pointer' }}
            >Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (selectingMonthYear) {
                  setSelectingMonthYear(false);
                  return;
                }
                onChange(draftDate);
                setOpen(false);
              }}
              style={{ minHeight: 32, padding: '6px 14px', border: `1px solid ${accent}`, borderRadius: 10, background: accent, color: 'white', font: "700 13px 'Quicksand', 'Trebuchet MS', sans-serif", cursor: 'pointer' }}
            >OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

const choiceButtonStyle = (selected: boolean, accent: string): React.CSSProperties => ({
  minHeight: 28, padding: '4px 5px', border: '1px solid transparent', borderRadius: 8,
  background: selected ? `${accent}18` : 'transparent', color: selected ? accent : '#3A5A2A',
  font: "13px 'Quicksand', 'Trebuchet MS', sans-serif", cursor: 'pointer',
});

export default DatePicker;
