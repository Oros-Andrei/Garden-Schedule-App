import React from 'react';

interface TextBoxProps {
  value: string;
  placeholder?: string;
  ariaLabel: string;
  accent?: string;
}

const TextBox: React.FC<TextBoxProps> = ({
  value,
  placeholder = '',
  ariaLabel,
  accent = '#5A7A4A',
}) => (
  <output
    aria-label={ariaLabel}
    style={{
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', width: 'max-content', maxWidth: '100%', height: 36,
      padding: '8px 11px', border: '1px solid #C8D8B8', borderRadius: 12,
      background: 'white', color: value ? '#3A5A2A' : '#8A9A80', cursor: 'default', pointerEvents: 'none',
      font: "14px 'Quicksand', 'Trebuchet MS', sans-serif",
      boxShadow: '0 1px 3px rgba(40,70,30,0.06)', outlineColor: accent,
    }}
  >{value || placeholder}</output>
);

export default TextBox;
