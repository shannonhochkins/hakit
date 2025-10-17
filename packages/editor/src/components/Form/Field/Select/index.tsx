import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDropdownPortal, closeAllDropdowns } from '../_shared/useDropdownPortal';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import styles from './SelectField.module.css';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';
import { FieldOption } from '@typings/fields';

type SelectFieldSize = 'small' | 'medium' | 'large';
type SelectAdornmentVariant = 'default' | 'icon' | 'custom';

type SelectAdornmentProps = {
  content: React.ReactNode;
  variant?: SelectAdornmentVariant;
  className?: string;
};

type CommonSelectProps<T extends FieldOption> = {
  id: string;
  label?: React.ReactNode;
  placeholder?: string;
  options: ReadonlyArray<T>;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  readOnly?: boolean;
  startAdornment?: React.ReactNode | SelectAdornmentProps;
  endAdornment?: React.ReactNode | SelectAdornmentProps;
  className?: string;
  size?: SelectFieldSize;
  name?: string;
  renderOption?: (option: T) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  style?: React.CSSProperties;
};

type SingleSelectProps<T extends FieldOption> = CommonSelectProps<T> & {
  multiple?: false;
  value?: T;
  onChange?: (value: T) => void;
  renderValue?: (value: T) => React.ReactNode;
};

type MultipleSelectProps<T extends FieldOption> = CommonSelectProps<T> & {
  multiple: true;
  value?: T[];
  onChange?: (value: T[]) => void;
  renderValue?: (values: T[]) => React.ReactNode;
};

export type SelectFieldProps<T extends FieldOption = FieldOption> = SingleSelectProps<T> | MultipleSelectProps<T>;

export function SelectField<T extends FieldOption = FieldOption>({
  id,
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  helperText,
  icon,
  error = false,
  success = false,
  disabled = false,
  readOnly = false,
  startAdornment,
  endAdornment,
  multiple = false,
  className,
  size = 'medium',
  name,
  renderOption,
  renderValue,
  isOptionEqualToValue,
  style,
}: SelectFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const equals = useMemo(() => (isOptionEqualToValue ? isOptionEqualToValue : (a: T, b: T) => a === b), [isOptionEqualToValue]);

  // Navigation functions (must be declared before use)
  const handleNavigateDown = () => {
    if (options.length > 0) {
      setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
    }
  };

  const handleNavigateUp = () => {
    setHighlightedIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSelectCurrent = () => {
    if (highlightedIndex >= 0 && highlightedIndex < options.length) {
      handleSelect(options[highlightedIndex]);
    }
  };

  const { renderPortal } = useDropdownPortal({
    anchorRef: containerRef,
    isOpen,
    onRequestClose: () => setIsOpen(false),
    onRequestOpen: () => setIsOpen(true),
    onNavigateDown: handleNavigateDown,
    onNavigateUp: handleNavigateUp,
    onSelectCurrent: handleSelectCurrent,
  });

  const selectedValues = useMemo<T[]>(
    () => (multiple ? (Array.isArray(value) ? value : []) : value !== undefined ? [value as T] : []),
    [multiple, value]
  );

  const renderOptionNode = (option: T): string | React.ReactNode => {
    if (renderOption) return renderOption(option);
    if (typeof (option as unknown) === 'string') return option as unknown as string;
    // fallback to label if it exists
    if (option && typeof option === 'object' && 'label' in option) return option.label as string;
    throw new Error(`Select: non-string options require renderOption to be provided for field ${name}.`);
  };

  const handleSelect = (option: T) => {
    if (disabled || readOnly) return;
    if (multiple) {
      const exists = selectedValues.some(v => equals(v, option));
      const next = exists ? selectedValues.filter(v => !equals(v, option)) : [...selectedValues, option];
      (onChange as MultipleSelectProps<T>['onChange'])?.(next);
    } else {
      (onChange as SingleSelectProps<T>['onChange'])?.(option);
      setIsOpen(false);
    }
  };

  const handleRemove = (option: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple) return;
    const next = selectedValues.filter(v => !equals(v, option));
    (onChange as MultipleSelectProps<T>['onChange'])?.(next);
  };

  const handleFocus = () => {
    if (!disabled && !readOnly) {
      closeAllDropdowns(() => setIsOpen(false));
      setIsOpen(true);
    }
  };

  // Reset highlighted index when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    } else {
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  const containerClasses = [
    styles.container,
    styles[size],
    error ? styles.error : '',
    success ? styles.success : '',
    disabled ? styles.disabled : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');
  const inputWrapperClasses = [styles.inputWrapper, 'select-input-wrapper'].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <div
        className={inputWrapperClasses}
        onClick={() => {
          if (disabled || readOnly) return;
          closeAllDropdowns(() => setIsOpen(false));
          setIsOpen(o => !o);
        }}
        onFocus={handleFocus}
        role='combobox'
        aria-expanded={isOpen}
        tabIndex={0}
        ref={containerRef}
      >
        {startAdornment &&
          (() => {
            const adornment = startAdornment;
            const isProps = typeof adornment === 'object' && adornment !== null && 'content' in adornment;
            const content = isProps ? adornment.content : adornment;
            const variant = isProps ? adornment.variant : undefined;
            const extra = isProps ? adornment.className : undefined;
            let adornmentClass = styles.startAdornment;
            adornmentClass += ` ${styles[variant || 'default'] || ''}`;
            if (extra) adornmentClass += ` ${extra}`;
            return <div className={adornmentClass}>{content}</div>;
          })()}

        <div className={styles.valueContainer}>
          {multiple && selectedValues.length > 0 && (
            <div className={styles.chips}>
              {selectedValues.map((val, index) => (
                <div key={`${index}-chip`} className={styles.chip}>
                  <span className={styles.chipLabel}>{renderOptionNode(val)}</span>
                  {!readOnly && <XIcon size={14} className={styles.chipRemove} onClick={e => handleRemove(val, e)} />}
                </div>
              ))}
            </div>
          )}
          {(!multiple || selectedValues.length === 0) && (
            <div className={styles.placeholder}>
              {!multiple && selectedValues[0]
                ? ((renderValue as ((v: T) => React.ReactNode) | undefined)?.(selectedValues[0]) ?? renderOptionNode(selectedValues[0]))
                : placeholder}
            </div>
          )}
        </div>

        <div className={styles.rightControls}>
          {(() => {
            const adornment = endAdornment ?? {
              content: <ChevronDownIcon size={18} className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`} />,
              variant: 'default',
              className: undefined,
            };
            const isProps = typeof adornment === 'object' && adornment !== null && 'content' in adornment;
            const content = isProps ? adornment.content : adornment;
            const variant = isProps ? adornment.variant : undefined;
            const extra = isProps ? adornment?.className : undefined;
            let adornmentClass = styles.endAdornment;
            adornmentClass += ` ${styles[variant || 'default'] || ''}`;
            if (extra) adornmentClass += ` ${extra}`;
            return <div className={adornmentClass}>{content}</div>;
          })()}
        </div>

        {renderPortal(
          <div className={styles.dropdown}>
            <div className={styles.optionsList}>
              {options.map((option, idx) => {
                const selected = selectedValues.some(v => equals(v, option));
                return (
                  <div
                    key={idx}
                    className={`${styles.option} ${selected ? styles.selectedOption : ''}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                  >
                    {renderOptionNode(option)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hidden inputs for form submissions when name is provided */}
      {name && !multiple && selectedValues[0] !== undefined && (
        <input
          type='hidden'
          id={id}
          name={name}
          value={typeof selectedValues[0] === 'string' ? selectedValues[0] : JSON.stringify(selectedValues[0])}
        />
      )}
      {name && multiple && selectedValues.length > 0 && (
        <div style={{ display: 'none' }}>
          {selectedValues.map((val, i) => (
            <input key={i} type='hidden' name={`${name}[]`} value={typeof val === 'string' ? val : JSON.stringify(val)} />
          ))}
        </div>
      )}

      <HelperText helperText={helperText} error={error} />
    </div>
  );
}
