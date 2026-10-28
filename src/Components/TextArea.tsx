import React from 'react';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  rows?: number;
}

// Keep editable multi-line fields consistent across custom plant forms.
const TextArea: React.FC<TextAreaProps> = ({ value, onChange, ariaLabel, rows = 3 }) => (
  <textarea
    aria-label={ariaLabel}
    rows={rows}
    value={value}
    onChange={event => onChange(event.target.value)}
    style={textAreaStyle}
  />
);

// Match single-line controls while allowing extra room for longer notes.
const textAreaStyle: React.CSSProperties = {
  boxSizing: 'border-box', width: '100%', height: 54, minHeight: 54, padding: '8px 10px',
  border: '1px solid #C8D8B8', borderRadius: 10, background: 'white', color: '#3A5A2A',
  font: "14px 'Quicksand', 'Trebuchet MS', sans-serif", resize: 'vertical',
};

export default TextArea;
