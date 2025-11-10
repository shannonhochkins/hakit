/* eslint-disable react/prop-types */
/**
 * AutocompleteField
 *
 * Generic, design-system aligned autocomplete with virtualization and adornments.
 *
 * Generics and modes
 * - Single mode (default):
 *   value?: T
 *   onChange?: (value: T) => void
 *   renderValue?: (value: T) => React.ReactNode
 * - Multiple mode:
 *   multiple: true
 *   value?: T[]
 *   onChange?: (value: T[]) => void
 *   renderValue?: (values: T[]) => React.ReactNode
 *
 * Options
 * - options: ReadonlyArray<T>
 * - renderOption?: (option: T) => React.ReactNode (preferred)
 * - isOptionEqualToValue?: (option: T, value: T) => boolean
 *
 * Adornments
 * - startAdornment / endAdornment: ReactNode or { content, variant, className }
 * - Default end adornment is a Chevron; Search icon is always shown
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ChevronDownIcon, XIcon, SearchIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import styles from './AutocompleteField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
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
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';
const getClassName = getClassNameFactory('Autocomplete', styles);

type AutocompleteFieldSize = 'small' | 'medium' | 'large';

type AutocompleteFieldAdornmentVariant = 'default' | 'icon';

type AutocompleteFieldAdornmentProps = {
  content: React.ReactNode;
  variant?: AutocompleteFieldAdornmentVariant;
  className?: string;
};

type CommonAutocompleteProps<T> = {
  id: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  placeholder?: string;
  options: ReadonlyArray<T>;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean | ((options: ReadonlyArray<T>, value: T | T[] | undefined) => boolean);
  readOnly?: boolean;
  startAdornment?: React.ReactNode | AutocompleteFieldAdornmentProps;
  endAdornment?: React.ReactNode | AutocompleteFieldAdornmentProps;
  className?: string;
  size?: AutocompleteFieldSize;
  listItemSize?: number;
  name?: string;
  noOptionsText?: string;
  includeEndIcon?: boolean;

  // Renderers
  renderOption?: (option: T) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  /**
   * Derive a grouping key for an option. Return a string to group the option under that header, or undefined for no group.
   * This mimics MUI's groupBy but allows arbitrary logic (e.g. starts-with checks, category mapping, ranges, etc.).
   */
  groupBy?: (option: T) => string | undefined;
  /**
   * Custom renderer for a group header label. Receives the group string and the array of options in that group.
   * If omitted, the raw group string is rendered.
   */
  renderGroupLabel?: (group: string, groupOptions: readonly T[]) => React.ReactNode;
};

export type SingleAutocompleteProps<T> = CommonAutocompleteProps<T> & {
  multiple?: false;
  value?: T;
  onChange?: (value: T) => void;
  onInputClick?: (e: React.MouseEvent) => void;
  renderValue?: (value: T) => React.ReactNode;
};

export type MultipleAutocompleteProps<T> = CommonAutocompleteProps<T> & {
  multiple: true;
  value?: T[];
  onChange?: (value: T[]) => void;
  onInputClick?: (e: React.MouseEvent) => void;
  renderValue?: (values: T[]) => React.ReactNode;
};

const isIconElement = (node: React.ReactNode): boolean => {
  if (!React.isValidElement(node)) return false;
  const type = node.type as { displayName?: string } | undefined;
  const displayName = type?.displayName;
  return typeof displayName === 'string' && displayName.includes('Icon');
};

const isProps = (val: unknown): val is AutocompleteFieldAdornmentProps =>
  typeof val === 'object' && val !== null && 'content' in (val as Record<string, unknown>);

// Heuristic for {label, value} shaped options; used for default rendering & equality fallback
const isOption = (o: unknown): o is { label: string; value: unknown } =>
  !!o && typeof o === 'object' && 'label' in (o as Record<string, unknown>) && 'value' in (o as Record<string, unknown>);

export type AutocompleteFieldProps<T = string> = SingleAutocompleteProps<T> | MultipleAutocompleteProps<T>;
export function AutocompleteField<T = string>({
  id,
  icon,
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  helperText,
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
  listItemSize = 32,
  includeEndIcon = true,
  noOptionsText = 'No options available',
  groupBy,
  renderGroupLabel,
  onInputClick,
}: AutocompleteFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options as T[]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastInteraction = useRef<'keyboard' | 'pointer' | null>(null);
  const justClosedRef = useRef(false);
  const hasEndInputAdornment = typeof endAdornment === 'object' && isProps(endAdornment) && endAdornment.className?.includes('input');

  const renderOptionNode = useCallback(
    (option: T) => {
      if (renderOption) return renderOption(option);
      if (typeof (option as unknown) === 'string') return option as unknown as string;
      if (isOption(option)) return option.label;
      throw new Error('Autocomplete: non-string options require renderOption to be provided.');
    },
    [renderOption]
  );

  const equals = useCallback(
    (a: T, b: T) => {
      if (isOption(a) && isOption(b)) return a.value === b.value;
      return isOptionEqualToValue ? isOptionEqualToValue(a, b) : a === b;
    },
    [isOptionEqualToValue]
  );

  const [selectedValues, setSelectedValues] = useState<T[]>(
    multiple ? (Array.isArray(value) ? value : []) : value !== undefined ? [value as T] : []
  );

  const noOptions = options.length === 0;
  const isDisabled = typeof disabled === 'function' ? disabled(options, value) : disabled || noOptions;
  const effectivePlaceholder = noOptions ? noOptionsText : placeholder;

  useEffect(() => {
    if (multiple) setSelectedValues(Array.isArray(value) ? value : []);
    else setSelectedValues(value !== undefined ? [value as T] : []);
  }, [value, multiple]);

  useEffect(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) {
      setFilteredOptions(options as T[]);
    } else {
      setFilteredOptions(
        options.filter(option => {
          if (typeof option === 'string') return option.toLowerCase().includes(q);
          if (isOption(option)) return option.label.toLowerCase().includes(q) || String(option.value).toLowerCase().includes(q);
          return JSON.stringify(option).toLowerCase().includes(q);
        }) as T[]
      );
    }
  }, [inputValue, options]);

  // auto close if nothing to show
  useEffect(() => {
    if (isOpen && filteredOptions.length === 0) setIsOpen(false);
  }, [isOpen, filteredOptions.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  // ---------- Floating UI ----------
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    middleware: [
      offset({ mainAxis: 2, crossAxis: 0 }),
      flip({ fallbackPlacements: ['top-start'] }),
      shift({ padding: 8 }),
      floatingSize({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
    referencePress: false,
    ancestorScroll: true,
  });
  const role = useRole(context, { role: 'listbox' });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

  useEffect(() => {
    refs.setReference(containerRef.current);
  }, [refs]);

  // ---------- Handlers ----------
  const handleOptionClick = useCallback(
    (option: T) => {
      if (isDisabled || readOnly) return;

      if (multiple) {
        const exists = selectedValues.some(v => equals(v, option));
        const newValues = exists ? selectedValues.filter(val => !equals(val, option)) : [...selectedValues, option];
        setSelectedValues(newValues);
        (onChange as MultipleAutocompleteProps<T>['onChange'])?.(newValues);
      } else {
        setSelectedValues([option]);
        setInputValue('');
        // guard against immediate focus reopen
        justClosedRef.current = true;
        setIsOpen(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            justClosedRef.current = false;
          });
        });
        (onChange as SingleAutocompleteProps<T>['onChange'])?.(option);
      }
    },
    [isDisabled, readOnly, multiple, selectedValues, equals, onChange]
  );

  // Close when clicking inside same-origin preview iframe
  const { iframe } = usePuckIframeElements();
  useEffect(() => {
    if (!isOpen) return;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;
    const close = () => setIsOpen(false);
    doc.addEventListener('pointerdown', close, { passive: true });
    return () => doc.removeEventListener('pointerdown', close);
  }, [isOpen, iframe]);

  // ----- Grouping & Flattening -----
  type FlattenedRow = { type: 'group'; group: string; options: T[] } | { type: 'option'; option: T; group?: string };
  const flattenedOptions: FlattenedRow[] = React.useMemo(() => {
    if (!groupBy) return filteredOptions.map(o => ({ type: 'option', option: o }));
    const groupMap = new Map<string, T[]>();
    const ungrouped: T[] = [];
    for (const opt of filteredOptions) {
      const g = groupBy(opt);
      if (g) {
        if (!groupMap.has(g)) groupMap.set(g, []);
        groupMap.get(g)!.push(opt);
      } else {
        ungrouped.push(opt);
      }
    }
    const rows: FlattenedRow[] = [];
    for (const [g, opts] of groupMap.entries()) {
      rows.push({ type: 'group', group: g, options: opts });
      for (const o of opts) rows.push({ type: 'option', option: o, group: g });
    }
    for (const o of ungrouped) rows.push({ type: 'option', option: o });
    return rows;
  }, [filteredOptions, groupBy]);

  useEffect(() => {
    if (!isOpen || isDisabled || readOnly) return;
    const onDocKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(i => {
          let next = Math.min(i + 1, flattenedOptions.length - 1);
          while (next < flattenedOptions.length && flattenedOptions[next].type === 'group') {
            next = Math.min(next + 1, flattenedOptions.length - 1);
          }
          return next;
        });
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(i => {
          let prev = Math.max(i - 1, 0);
          while (prev >= 0 && flattenedOptions[prev].type === 'group') {
            prev = Math.max(prev - 1, 0);
          }
          return prev;
        });
      } else if (key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < flattenedOptions.length) {
          const row = flattenedOptions[highlightedIndex];
          if (row.type === 'option') handleOptionClick(row.option);
        }
      } else if (key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, [isOpen, isDisabled, readOnly, highlightedIndex, flattenedOptions, handleOptionClick, noOptionsText, inputValue]);

  // Reset highlighted index when opening respecting groups
  useEffect(() => {
    if (isOpen) {
      const firstIndex = flattenedOptions.findIndex(r => r.type === 'option');
      setHighlightedIndex(firstIndex);
    } else setHighlightedIndex(-1);
  }, [isOpen, flattenedOptions]);

  const handleRemoveValue = (valueToRemove: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(val => !equals(val, valueToRemove));
    setSelectedValues(newValues);
    if (multiple) {
      (onChange as MultipleAutocompleteProps<T>['onChange'])?.(newValues);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen && !isDisabled && !readOnly) setIsOpen(true);
  };
  const onInputFocus: React.FocusEventHandler<HTMLInputElement> = e => {
    if (isDisabled || readOnly || isOpen) return;
    if (justClosedRef.current) return;

    // open only for keyboard modality (tab/focus-visible)
    const target = e.currentTarget as HTMLElement;
    const focusVisible = target.matches?.(':focus-visible');
    const isKeyboard = lastInteraction.current === 'keyboard' || focusVisible;

    if (isKeyboard) setIsOpen(true);
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    if (disabled || readOnly) return;
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const containerClasses = getClassName(
    {
      Autocomplete: true,
      small: size === 'small',
      large: size === 'large',
      error: error || (isOpen && flattenedOptions.filter(r => r.type === 'option').length === 0),
      success,
      disabled: isDisabled,
      hasStartAdornment: !!startAdornment,
    },
    className
  );
  const hasStatusIcon = error || success;
  const inputWrapperClasses = getClassName('inputWrapper');

  return (
    <div className={containerClasses}>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <div className={inputWrapperClasses} ref={containerRef} {...getReferenceProps()}>
        {startAdornment &&
          (() => {
            const adornment = startAdornment as AutocompleteFieldAdornmentProps | React.ReactNode;
            const content = isProps(adornment) ? adornment.content : adornment;
            const variant = isProps(adornment) ? adornment.variant : undefined;
            const extra = isProps(adornment) ? adornment.className : undefined;
            let adornmentClass = getClassName('startAdornment');
            if (variant) adornmentClass += ` ${getClassName(variant)}`;
            else if (isIconElement(content)) adornmentClass += ` ${getClassName('icon')}`;
            else adornmentClass += ` ${getClassName('default')}`;
            if (extra) adornmentClass += ` ${extra}`;

            return <div className={adornmentClass}>{content}</div>;
          })()}

        <div
          className={getClassName('valueContainer')}
          onClick={() => inputRef.current?.focus()}
          onMouseDown={() => {
            lastInteraction.current = 'pointer';
          }}
        >
          {multiple && selectedValues.length > 0 && (
            <div className={getClassName('chips')}>
              {selectedValues.map((val, index) => (
                <div key={`${index}-chip`} className={getClassName('chip')}>
                  <span className={getClassName('chipLabel')}>{renderOptionNode(val)}</span>
                  {!readOnly && <XIcon size={14} className={getClassName('chipRemove')} onClick={e => handleRemoveValue(val, e)} />}
                </div>
              ))}
            </div>
          )}

          {(!multiple || selectedValues.length === 0) && !inputValue && (
            <div className={getClassName('placeholder')}>
              {!multiple && selectedValues[0]
                ? ((renderValue as ((v: T) => React.ReactNode) | undefined)?.(selectedValues[0]) ?? renderOptionNode(selectedValues[0]))
                : effectivePlaceholder}
            </div>
          )}

          <input
            ref={inputRef}
            id={id}
            name={name}
            className={getClassName('input')}
            value={inputValue}
            onChange={onInputChange}
            onFocus={onInputFocus}
            onKeyDown={onInputKeyDown}
            onClick={onInputClick}
            disabled={isDisabled}
            readOnly={readOnly}
            autoComplete='off'
            aria-autocomplete='list'
            aria-expanded={isOpen}
          />
        </div>

        <div className={getClassName('rightControls')}>
          {!hasStatusIcon && includeEndIcon && (
            <SearchIcon
              size={18}
              className={getClassName('searchIcon')}
              onClick={() => !isDisabled && !readOnly && setIsOpen(o => !o)}
              onMouseDown={() => {
                lastInteraction.current = 'pointer';
              }}
            />
          )}
          {(() => {
            const defaultAdornment: AutocompleteFieldAdornmentProps = {
              content: <ChevronDownIcon size={18} className={`${getClassName('chevron')} ${isOpen ? getClassName('chevronUp') : ''}`} />,
              variant: 'default',
              className: undefined,
            };
            const source = endAdornment ?? defaultAdornment;
            const content: React.ReactNode = isProps(source) ? source.content : source;
            const variant = isProps(source) ? source.variant : undefined;
            const extraClass = isProps(source) ? source.className : undefined;
            let adornmentClass = getClassName('endAdornment');
            if (variant) adornmentClass += ` ${getClassName(variant)}`;
            else if (isIconElement(content)) adornmentClass += ` ${getClassName('icon')}`;
            else adornmentClass += ` ${getClassName('default')}`;
            if (extraClass) adornmentClass += ` ${extraClass}`;
            if (hasEndInputAdornment) adornmentClass = getClassName('endAdornment-input') + ` ${extraClass ?? ''}`;
            return (
              <div
                className={adornmentClass}
                onClick={() => !isDisabled && !readOnly && setIsOpen(o => !o)}
                onMouseDown={() => {
                  lastInteraction.current = 'pointer';
                }}
              >
                {content}
              </div>
            );
          })()}
        </div>

        {error && (
          <div className={getClassName('statusIcon')}>
            <AlertCircleIcon size={18} className={getClassName('errorIcon')} />
          </div>
        )}
        {success && (
          <div className={getClassName('statusIcon')}>
            <CheckCircleIcon size={18} className={getClassName('successIcon')} />
          </div>
        )}

        {/* Floating UI portal */}
        {isOpen && flattenedOptions.some(r => r.type === 'option') && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} returnFocus={false} initialFocus={-1} guards={false}>
              <div
                id={`${id}-options`}
                role='listbox'
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps({ className: getClassName('dropdown') })}
              >
                <List
                  height={Math.min(flattenedOptions.length * listItemSize, 200)}
                  width={'100%'}
                  itemCount={flattenedOptions.length}
                  itemSize={listItemSize}
                  itemData={{ rows: flattenedOptions, selectedValues, handleOptionClick, highlightedIndex }}
                  className={getClassName('optionsList')}
                >
                  {({
                    index,
                    style,
                    data,
                  }: {
                    index: number;
                    style: React.CSSProperties;
                    data: { rows: FlattenedRow[]; selectedValues: T[]; handleOptionClick: (o: T) => void; highlightedIndex: number };
                  }) => {
                    const row = data.rows[index];
                    if (row.type === 'group') {
                      return (
                        <div key={`group-${row.group}-${index}`} style={style} role='presentation' className={getClassName('groupHeader')}>
                          {renderGroupLabel ? renderGroupLabel(row.group, row.options) : row.group}
                        </div>
                      );
                    }
                    const option = row.option;
                    const isSelected = data.selectedValues.some((v: T) => equals(v, option));
                    const isHighlighted = index === data.highlightedIndex;
                    return (
                      <div
                        key={index}
                        style={style}
                        role='option'
                        aria-selected={isSelected}
                        className={`${getClassName('option')} ${isSelected ? getClassName('selectedOption') : ''} ${isHighlighted ? getClassName('highlightedOption') : ''}`}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => data.handleOptionClick(option)}
                      >
                        {renderOptionNode(option)}
                      </div>
                    );
                  }}
                </List>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>

      <HelperText
        helperText={
          flattenedOptions.filter(r => r.type === 'option').length === 0 && inputValue
            ? `No results found matching "${inputValue}"`
            : helperText
        }
        error={error || (isOpen && flattenedOptions.filter(r => r.type === 'option').length === 0)}
      />
    </div>
  );
}
