import React, { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange?: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  accent?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange = () => {},
  ariaLabel,
  placeholder,
  accent = '#5A7A4A',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={rootRef} style={{ position: 'relative', flex: '0 0 auto', width: 'max-content', maxWidth: '100%' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        aria-disabled={disabled}
        onClick={() => { if (!disabled) setOpen(current => !current); }}
        onKeyDown={event => {
          if (disabled) return;
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        style={{
          width: '100%', minHeight: 36, padding: '8px 11px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          border: `1px solid ${open ? accent : '#C8D8B8'}`, borderRadius: 12,
          background: 'white', color: selectedOption ? '#3A5A2A' : '#8A9A80',
          font: "14px 'Quicksand', 'Trebuchet MS', sans-serif", textAlign: 'left', cursor: disabled ? 'default' : 'pointer',
          boxShadow: open ? `0 0 0 2px ${accent}22` : '0 1px 3px rgba(40,70,30,0.06)',
          opacity: 1,
        }}
      >
        <span style={{ display: 'grid', minWidth: 0, whiteSpace: 'nowrap' }}>
          {selectedOption?.label ?? placeholder ?? 'Choose an option'}
        </span>
        {!disabled && <span aria-hidden="true" style={{ color: accent, fontSize: 10 }}>{open ? '▴' : '▾'}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute', zIndex: 20, top: 'calc(100% + 5px)', left: 0, right: 0,
            maxHeight: 150, overflowY: 'auto', padding: 5,
            width: 'max-content', minWidth: '100%', maxWidth: 'min(320px, calc(100vw - 40px))',
            border: '1px solid #D5E2CB', borderRadius: 12,
            background: 'rgba(255,255,255,0.98)',
            boxShadow: '0 8px 22px rgba(35,65,25,0.16)',
          }}
        >
          {options.map(option => (
            <button
              type="button" role="option" aria-selected={value === option.value}
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              style={optionStyle(value === option.value, accent)}
            >{option.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

const optionStyle = (selected: boolean, accent: string): React.CSSProperties => ({
  width: '100%', display: 'block', padding: '8px 9px', border: 'none', whiteSpace: 'nowrap',
  borderRadius: 8, background: selected ? `${accent}18` : 'transparent',
  color: selected ? accent : '#3A5A2A', font: "14px 'Quicksand', 'Trebuchet MS', sans-serif",
  textAlign: 'left', cursor: 'pointer',
});

export default Dropdown;
