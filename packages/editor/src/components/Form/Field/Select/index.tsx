import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import styles from './SelectField.module.css';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';
import { FieldOption } from '@typings/fields';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';

import {
  useFloating,
  flip,
  shift,
  offset,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  autoUpdate,
  size as floatingSize,
} from '@floating-ui/react';
import { Column } from '@components/Layout';

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
  const lastInteraction = useRef<'keyboard' | 'pointer' | null>(null);
  const justClosedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const equals = useMemo(() => (isOptionEqualToValue ? isOptionEqualToValue : (a: T, b: T) => a === b), [isOptionEqualToValue]);

  // --- Floating UI setup (auto placement, shift, small offset, scroll-dismiss) ---
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({ mainAxis: 2, crossAxis: 0 }),
      flip({ fallbackPlacements: ['top-start'] }), // if no room, go above
      shift({ padding: 8 }),
      floatingSize({
        apply({ rects, elements /*, availableWidth, availableHeight */ }) {
          Object.assign(elements.floating.style, {
            // use minWidth if you want it to be at least the anchor width
            minWidth: `${rects.reference.width}px`,

            // optional: cap height if your list can get long
            // maxHeight: `${Math.min(320, availableHeight - 16)}px`,
            // overflow: 'auto',
          });
        },
      }),
    ],
  });
  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
    referencePress: false,
    ancestorScroll: true, // close on scroll
  });

  const role = useRole(context, { role: 'listbox' });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

  // tie your existing reference element to Floating UI
  useEffect(() => {
    refs.setReference(containerRef.current);
  }, [refs]);

  // --- Same-origin iframe click -> close (manual, per your ColorField) ---
  const { iframe } = usePuckIframeElements();
  useEffect(() => {
    if (!isOpen) return;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;
    const handleInsideIframe = () => setIsOpen(false);
    doc.addEventListener('pointerdown', handleInsideIframe, { passive: true });
    return () => doc.removeEventListener('pointerdown', handleInsideIframe);
  }, [isOpen, iframe]);

  // set modality (once)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // treat Tab/Arrow nav as keyboard modality
      if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        lastInteraction.current = 'keyboard';
      }
    };
    const onPointer = () => {
      lastInteraction.current = 'pointer';
    };

    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, []);

  const selectedValues = useMemo<T[]>(
    () => (multiple ? (Array.isArray(value) ? value : []) : value !== undefined ? [value as T] : []),
    [multiple, value]
  );

  const handleSelect = useCallback(
    (option: T) => {
      if (disabled || readOnly) return;
      if (multiple) {
        const exists = selectedValues.some(v => equals(v, option));
        const next = exists ? selectedValues.filter(v => !equals(v, option)) : [...selectedValues, option];
        (onChange as MultipleSelectProps<T>['onChange'])?.(next);
      } else {
        (onChange as SingleSelectProps<T>['onChange'])?.(option);
        // mark "just closed" so refocus doesn't reopen
        justClosedRef.current = true;
        setIsOpen(false);
        // clear AFTER focus has bounced back to the reference
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            justClosedRef.current = false;
          });
        });
      }
    },
    [disabled, readOnly, multiple, onChange, equals, selectedValues]
  );

  // --- Keyboard navigation (migrated from your old hook behavior) ---
  const handleNavigateDown = useCallback(() => {
    if (options.length > 0) {
      setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
    }
  }, [options]);
  const handleNavigateUp = useCallback(() => {
    setHighlightedIndex(prev => Math.max(prev - 1, 0));
  }, []);
  const handleSelectCurrent = useCallback(() => {
    if (highlightedIndex >= 0 && highlightedIndex < options.length) {
      handleSelect(options[highlightedIndex]);
    }
  }, [highlightedIndex, options, handleSelect]);

  const renderOptionNode = (option: T): string | React.ReactNode => {
    if (renderOption) return renderOption(option);
    if (typeof (option as unknown) === 'string') return option as unknown as string;
    // if label and description are present, return a Column with both
    if (option && typeof option === 'object' && 'label' in option && 'description' in option) {
      return (
        <Column gap='0.125rem' alignItems='flex-start' justifyContent='center'>
          <span>{option.label}</span>
          <span style={{ opacity: 0.75 }}>{option.description}</span>
        </Column>
      );
    }
    // fallback to label if it exists
    if (option && typeof option === 'object' && 'label' in option) return option.label as string;
    throw new Error(`Select: non-string options require renderOption to be provided for field ${name}.`);
  };

  const handleRemove = (option: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple) return;
    const next = selectedValues.filter(v => !equals(v, option));
    (onChange as MultipleSelectProps<T>['onChange'])?.(next);
  };
  // Reset highlighted index when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    if (disabled || readOnly) return;
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const onFocus: React.FocusEventHandler<HTMLDivElement> = e => {
    if (disabled || readOnly || isOpen) return;
    if (justClosedRef.current) return; // don't reopen immediately after close

    // Open only when reached via keyboard (Tab/focus-visible),
    // not programmatic focus after click.
    const target = e.currentTarget as HTMLElement;
    const focusVisible = target.matches?.(':focus-visible');
    const isKeyboard = lastInteraction.current === 'keyboard' || focusVisible;

    if (isKeyboard) setIsOpen(true);
  };

  // add this effect (near your other effects)
  useEffect(() => {
    if (!isOpen || disabled || readOnly) return;

    const onDocKey = (e: KeyboardEvent) => {
      // avoid interfering with text inputs inside the dropdown (if any)
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingField = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (isTypingField) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNavigateDown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNavigateUp();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectCurrent();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, [isOpen, disabled, readOnly, handleNavigateDown, handleNavigateUp, handleSelectCurrent]);

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
          setIsOpen(o => !o);
        }}
        onMouseDown={() => {
          lastInteraction.current = 'pointer';
        }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        role='combobox'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-controls={isOpen ? `${id}-options` : undefined}
        tabIndex={0}
        ref={containerRef}
        {...getReferenceProps()}
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

        {/* Floating UI portal instead of renderPortal */}
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} returnFocus={false}>
              <div
                id={`${id}-options`}
                role='listbox'
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps({ className: styles.dropdown })}
              >
                <div className={styles.optionsList}>
                  {options.map((option, idx) => {
                    const selected = selectedValues.some(v => equals(v, option));
                    return (
                      <div
                        key={idx}
                        role='option'
                        aria-selected={selected}
                        className={`${styles.option} ${selected ? styles.selectedOption : ''} ${idx === highlightedIndex ? styles.highlightedOption : ''}`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
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
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>

      {/* Hidden inputs for form submissions when name is provided */}
      {name && !multiple && selectedValues[0] !== undefined && (
        <input
          type='hidden'
          id={id}
          name={name}
          value={typeof selectedValues[0] === 'string' ? (selectedValues[0] as unknown as string) : JSON.stringify(selectedValues[0])}
        />
      )}
      {name && multiple && selectedValues.length > 0 && (
        <div style={{ display: 'none' }}>
          {selectedValues.map((val, i) => (
            <input
              key={i}
              type='hidden'
              name={`${name}[]`}
              value={typeof val === 'string' ? (val as unknown as string) : JSON.stringify(val)}
            />
          ))}
        </div>
      )}

      <HelperText helperText={helperText} error={error} />
    </div>
  );
}
