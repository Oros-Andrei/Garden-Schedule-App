import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  // Let submit buttons rely on their parent form's submit handler.
  onClick?: () => void;
  icon?: React.ReactNode | null;
  color?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  size?: 'compact' | 'regular';
  // Allow small contextual actions to retain shared button behavior and styling.
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick = () => {},
  icon = null,
  color = '#4A8C3A',
  type = 'button',
  disabled = false,
  title,
  ariaLabel,
  size = 'regular',
  style,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={ariaLabel}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      minHeight: size === 'compact' ? 28 : 36,
      padding: size === 'compact' ? '4px 9px' : '8px 11px',
      border: `1px solid ${color}55`, borderRadius: 999,
      background: `${color}12`, color,
      font: `700 14px 'Quicksand', 'Trebuchet MS', sans-serif`,
      whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, transition: 'background 0.15s, border-color 0.15s',
      ...style,
    }}
  >
    {icon != null && <span aria-hidden="true">{icon}</span>}
    {children}
  </button>
);

export default Button;
