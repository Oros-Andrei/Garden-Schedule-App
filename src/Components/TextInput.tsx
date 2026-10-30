import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
}

// Keep editable single-line fields consistent across custom plant forms.
const TextInput: React.FC<TextInputProps> = ({ value, onChange, ariaLabel, placeholder = '' }) => (
  <input
    type="text"
    aria-label={ariaLabel}
    placeholder={placeholder}
    value={value}
    onChange={event => onChange(event.target.value)}
    style={inputStyle}
  />
);

// Match the default height of every custom plant form control.
const inputStyle: React.CSSProperties = {
  boxSizing: 'border-box', width: '100%', height: 54, minHeight: 54, padding: '8px 10px',
  border: '1px solid #C8D8B8', borderRadius: 10, background: 'white', color: '#3A5A2A',
  font: "14px 'Quicksand', 'Trebuchet MS', sans-serif",
};

export default TextInput;
