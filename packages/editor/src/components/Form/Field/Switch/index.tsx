import React from 'react';
import styles from './SwitchField.module.css';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';

type SwitchFieldSize = 'small' | 'medium' | 'large';

type SwitchFieldProps = {
  id: string;
  label?: React.ReactNode;
  helperText?: string;
  checked?: boolean;
  className?: string;
  size?: SwitchFieldSize;
  name?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'size'>;

// Define size-specific CSS custom properties
const sizeStyles: Record<SwitchFieldSize, React.CSSProperties> = {
  small: {
    '--switch-width': '2rem',
    '--switch-height': '1.125rem',
    '--switch-thumb-size': '0.875rem',
    '--switch-container-height': '2rem',
  } as React.CSSProperties,
  medium: {
    '--switch-width': '2.25rem',
    '--switch-height': '1.25rem',
    '--switch-thumb-size': '1rem',
    '--switch-container-height': '2.5rem',
  } as React.CSSProperties,
  large: {
    '--switch-width': '3rem',
    '--switch-height': '1.5rem',
    '--switch-thumb-size': '1.25rem',
    '--switch-container-height': '3rem',
  } as React.CSSProperties,
};

export function SwitchField({
  id,
  label,
  helperText,
  checked = false,
  className,
  size,
  name,
  icon,
  readOnly,
  ...inputProps
}: SwitchFieldProps) {
  const containerClasses = [styles.container, inputProps.disabled ? styles.disabled : '', className || ''].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={size ? sizeStyles[size] : undefined}>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <div className={styles.switchWrapper}>
        <input type='checkbox' id={id} name={name} checked={checked} className={styles.switchInput} {...inputProps} />
        <label htmlFor={id} className={styles.switchLabel}>
          <span className={styles.switchButton}></span>
        </label>
      </div>
      <HelperText helperText={helperText} />
    </div>
  );
}
