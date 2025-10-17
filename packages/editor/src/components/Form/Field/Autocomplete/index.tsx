/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import React, { useEffect, useState, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ChevronDownIcon, XIcon, SearchIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import styles from './AutocompleteField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const getClassName = getClassNameFactory('Autocomplete', styles);
import { useDropdownPortal, closeAllDropdowns } from '../_shared/useDropdownPortal';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';
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
  disabled?: boolean;
  readOnly?: boolean;
  startAdornment?: React.ReactNode | AutocompleteFieldAdornmentProps;
  endAdornment?: React.ReactNode | AutocompleteFieldAdornmentProps;
  className?: string;
  size?: AutocompleteFieldSize;
  listItemSize?: number;
  name?: string;
  // Renderers
  renderOption?: (option: T) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
};

export type SingleAutocompleteProps<T> = CommonAutocompleteProps<T> & {
  multiple?: false;
  value?: T;
  onChange?: (value: T) => void;
  renderValue?: (value: T) => React.ReactNode;
};

export type MultipleAutocompleteProps<T> = CommonAutocompleteProps<T> & {
  multiple: true;
  value?: T[];
  onChange?: (value: T[]) => void;
  renderValue?: (values: T[]) => React.ReactNode;
};

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
}: AutocompleteFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const renderOptionNode = React.useCallback(
    (option: T) => {
      if (renderOption) return renderOption(option);
      if (typeof (option as unknown) === 'string') return option as unknown as string;
      throw new Error('Autocomplete: non-string options require renderOption to be provided.');
    },
    [renderOption]
  );
  const equals = React.useCallback((a: T, b: T) => (isOptionEqualToValue ? isOptionEqualToValue(a, b) : a === b), [isOptionEqualToValue]);

  const [selectedValues, setSelectedValues] = useState<T[]>(
    multiple ? (Array.isArray(value) ? value : []) : value !== undefined ? [value as T] : []
  );
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options as T[]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const noOptions = options.length === 0;
  const noFilteredOptions = filteredOptions.length === 0;
  const isDisabled = disabled || noOptions;
  const effectivePlaceholder = noOptions ? 'No options available' : placeholder;

  // Navigation functions (must be declared before use)
  const handleNavigateDown = () => {
    if (filteredOptions.length > 0) {
      setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
    }
  };

  const handleNavigateUp = () => {
    setHighlightedIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSelectCurrent = () => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
      handleOptionClick(filteredOptions[highlightedIndex]);
    }
  };

  useEffect(() => {
    if (noFilteredOptions) {
      setIsOpen(false);
    }
  }, [noFilteredOptions]);

  const { renderPortal } = useDropdownPortal({
    anchorRef: containerRef,
    isOpen,
    onRequestClose: () => setIsOpen(false),
    onRequestOpen: () => setIsOpen(true),
    onNavigateDown: handleNavigateDown,
    onNavigateUp: handleNavigateUp,
    onSelectCurrent: handleSelectCurrent,
  });
  useEffect(() => {
    if (multiple) {
      setSelectedValues(Array.isArray(value) ? value : []);
    } else {
      setSelectedValues(value !== undefined ? [value as T] : []);
    }
  }, [value, multiple]);
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options as T[]);
    } else {
      const lower = inputValue.toLowerCase();
      const filtered = options.filter(option => {
        if (typeof option === 'string') return option.toLowerCase().includes(lower);
        // if the option isn't a simple string, stringify it
        return JSON.stringify(option).toLowerCase().includes(lower);
      });
      setFilteredOptions(filtered);
    }
  }, [inputValue, options, renderOption]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };
  const handleOptionClick = (option: T) => {
    if (multiple) {
      const exists = selectedValues.some(v => equals(v, option));
      const newValues = exists ? selectedValues.filter(val => !equals(val, option)) : [...selectedValues, option];
      setSelectedValues(newValues);
      (onChange as MultipleAutocompleteProps<T>['onChange'])?.(newValues);
    } else {
      setSelectedValues([option]);
      setInputValue('');
      setIsOpen(false);
      (onChange as SingleAutocompleteProps<T>['onChange'])?.(option);
    }
  };
  const handleRemoveValue = (valueToRemove: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(val => !equals(val, valueToRemove));
    setSelectedValues(newValues);
    if (multiple) {
      (onChange as MultipleAutocompleteProps<T>['onChange'])?.(newValues);
    } else {
      // In single mode, clearing via chip removal isn't typical, but no-op here
    }
  };

  const handleFocus = () => {
    if (!isDisabled && !readOnly) {
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
  // Key handling moved to portal hook
  const containerClasses = getClassName(
    {
      Autocomplete: true,
      small: size === 'small',
      large: size === 'large',
      error: error || noFilteredOptions,
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
      <div className={inputWrapperClasses} ref={containerRef}>
        {startAdornment &&
          (() => {
            const adornment = startAdornment;
            const isProps = typeof adornment === 'object' && adornment !== null && 'content' in adornment;
            const content = isProps ? adornment.content : adornment;
            const variant = isProps ? adornment.variant : undefined;
            const className = isProps ? adornment.className : undefined;

            let adornmentClass = getClassName('startAdornment');
            if (variant) {
              adornmentClass += ` ${getClassName(variant)}`;
            } else if (
              React.isValidElement(content) &&
              content.type &&
              typeof content.type === 'function' &&
              'displayName' in content.type &&
              typeof content.type.displayName === 'string' &&
              content.type.displayName.includes('Icon')
            ) {
              adornmentClass += ` ${getClassName('icon')}`;
            } else {
              adornmentClass += ` ${getClassName('default')}`;
            }
            if (className) {
              adornmentClass += ` ${className}`;
            }

            return <div className={adornmentClass}>{content}</div>;
          })()}
        <div className={getClassName('valueContainer')} onClick={() => inputRef.current?.focus()}>
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
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={isDisabled}
            readOnly={readOnly}
            autoComplete='off'
            aria-autocomplete='list'
            aria-expanded={isOpen}
          />
        </div>
        <div className={getClassName('rightControls')}>
          {!hasStatusIcon && (
            <SearchIcon size={18} className={getClassName('searchIcon')} onClick={() => !isDisabled && !readOnly && setIsOpen(o => !o)} />
          )}
          {(() => {
            const adornment = endAdornment ?? {
              content: <ChevronDownIcon size={18} className={`${getClassName('chevron')} ${isOpen ? getClassName('chevronUp') : ''}`} />,
              variant: 'default',
              className: undefined,
            };
            const isProps = typeof adornment === 'object' && adornment !== null && 'content' in adornment;
            const content = isProps ? adornment.content : adornment;
            const variant = isProps ? adornment.variant : undefined;
            const extraClass = isProps ? adornment.className : undefined;

            let adornmentClass = getClassName('endAdornment');
            if (variant) {
              adornmentClass += ` ${getClassName(variant)}`;
            } else if (
              React.isValidElement(content) &&
              content.type &&
              typeof content.type === 'function' &&
              'displayName' in content.type &&
              typeof (content.type as any).displayName === 'string' &&
              (content.type as any).displayName.includes('Icon')
            ) {
              adornmentClass += ` ${getClassName('icon')}`;
            } else {
              adornmentClass += ` ${getClassName('default')}`;
            }
            if (extraClass) adornmentClass += ` ${extraClass}`;
            return (
              <div className={adornmentClass} onClick={() => !isDisabled && !readOnly && setIsOpen(o => !o)}>
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
        {renderPortal(
          <div
            className={getClassName('dropdown')}
            style={{
              display: noFilteredOptions ? 'none' : 'block',
            }}
          >
            <List
              height={Math.min(filteredOptions.length * listItemSize, 200)}
              width={'100%'}
              itemCount={filteredOptions.length}
              itemSize={listItemSize}
              itemData={{ options: filteredOptions, selectedValues, handleOptionClick, highlightedIndex }}
              className={getClassName('optionsList')}
            >
              {({
                index,
                style,
                data,
              }: {
                index: number;
                style: React.CSSProperties;
                data: { options: T[]; selectedValues: T[]; handleOptionClick: (o: T) => void; highlightedIndex: number };
              }) => {
                const option = data.options[index];
                const isSelected = data.selectedValues.some((v: T) => equals(v, option));
                const isHighlighted = index === data.highlightedIndex;
                return (
                  <div
                    key={index}
                    style={style}
                    className={`${getClassName('option')} ${isSelected ? getClassName('selectedOption') : ''} ${isHighlighted ? getClassName('highlightedOption') : ''}`}
                    onClick={() => data.handleOptionClick(option)}
                  >
                    {renderOptionNode(option)}
                  </div>
                );
              }}
            </List>
          </div>
        )}
      </div>
      <HelperText
        helperText={noFilteredOptions ? `No results found matching "${inputValue}"` : helperText}
        error={error || noFilteredOptions}
      />
    </div>
  );
}
