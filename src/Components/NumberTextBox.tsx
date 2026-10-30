import React from 'react';

interface NumberTextBoxProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

// Use a decimal text entry so numeric fields have no spinner controls.
const NumberTextBox: React.FC<NumberTextBoxProps> = ({ value, onChange, ariaLabel }) => (
  <input
    type="text"
    inputMode="decimal"
    aria-label={ariaLabel}
    value={value}
    onChange={event => {
      const normalized = event.target.value.replace(',', '.');
      if (/^\d*\.?\d*$/.test(normalized)) onChange(normalized);
    }}
    style={numberStyle}
  />
);

// Match the default height of every custom plant form control.
const numberStyle: React.CSSProperties = {
  boxSizing: 'border-box', width: '100%', height: 54, minHeight: 54, padding: '8px 10px',
  border: '1px solid #C8D8B8', borderRadius: 10, background: 'white', color: '#3A5A2A',
  font: "14px 'Quicksand', 'Trebuchet MS', sans-serif",
};

export default NumberTextBox;
