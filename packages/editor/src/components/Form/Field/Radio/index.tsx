import React from 'react';
import styles from './RadioField.module.css';
import { FieldLabel } from '../_shared/FieldLabel';
import { HelperText } from '../_shared/HelperText';

type RadioFieldSize = 'small' | 'medium' | 'large';

export type RadioOption = {
  value: string | number | boolean | object | null | undefined;
  label: string;
};

export type RadioFieldProps = {
  id: string;
  label?: React.ReactNode;
  options: RadioOption[];
  helperText?: string;
  horizontal?: boolean;
  className?: string;
  icon?: React.ReactNode;
  size?: RadioFieldSize;
  readOnly?: boolean;
  name?: string;
  value?: RadioOption['value'];
  onChange?: (value: RadioOption['value']) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'onChange' | 'name'>;

// Define size-specific CSS custom properties
const sizeStyles: Record<RadioFieldSize, React.CSSProperties> = {
  small: {
    '--radio-size': '1rem',
  } as React.CSSProperties,
  medium: {
    '--radio-size': '1.125rem',
  } as React.CSSProperties,
  large: {
    '--radio-size': '1.5rem',
  } as React.CSSProperties,
};

export function RadioField({
  id,
  label,
  options,
  helperText,
  horizontal = true,
  className,
  size,
  readOnly,
  name,
  value,
  onChange,
  disabled,
  icon,
  ...inputProps
}: RadioFieldProps) {
  const containerClasses = [styles.container, disabled ? styles.disabled : '', className || ''].filter(Boolean).join(' ');
  const optionsContainerClasses = [styles.optionsContainer, horizontal ? styles.horizontal : styles.vertical].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={size ? sizeStyles[size] : undefined}>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <div className={optionsContainerClasses}>
        {options.map((option, idx) => {
          const isSelected = typeof value !== 'undefined' ? value === option.value : false;

          return (
            <div key={`${id}-${idx}`} className={styles.radioOption}>
              <input
                type='radio'
                id={`${id}-${idx}`}
                name={readOnly ? undefined : name || id}
                value={String(idx)}
                className={styles.radioInput}
                disabled={readOnly || disabled}
                checked={isSelected}
                onChange={readOnly ? undefined : () => onChange?.(option.value)}
                {...inputProps}
              />
              <label htmlFor={`${id}-${idx}`} className={styles.radioLabel}>
                <span className={styles.radioButton} data-selected={readOnly ? isSelected : undefined}></span>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      <HelperText helperText={helperText} />
    </div>
  );
}
