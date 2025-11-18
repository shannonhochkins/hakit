/* eslint-disable react/prop-types */
/**
 * AutocompleteField – High-level Architecture & Design Notes
 * ----------------------------------------------------------
 * Purpose:
 *   A generic, design-system aligned autocomplete component supporting:
 *   - Single & multi-selection
 *   - Virtualized rendering (react-window) for large option sets
 *   - Optional grouping with custom group labels
 *   - Custom option rendering with width metadata for responsive truncation
 *   - Shallow, configurable search with searchKeys & custom filter override
 *   - Adornments (start/end) & status indicators (error/success)
 *   - Accessibility-focused keyboard navigation & focus modality detection
 *   - Resilient equality heuristics for common {label, value} option shapes
 *
 * Performance Strategies:
 *   - Virtualization via VariableSizeList to avoid rendering every option.
 *   - Pre-rendered base option nodes (baseOptionContent) to minimize rerenders during scroll.
 *   - Memoized row size computation (rowSizes + totalHeight) bounding dropdown height.
 *   - Shallow search (avoids deep recursive traversal) – O(n * k) where k is number of inspected keys.
 *   - ResizeObserver used externally (meta injected to renderOption) so consumers can implement dynamic truncation without layout thrash here.
 *
 * Extensibility Points:
 *   - renderOption(option, { listWidth }) for custom row markup.
 *   - filterOption(query, option) to entirely override internal search.
 *   - groupBy(option) + renderGroupLabel(group, groupOptions) for categorized lists.
 *   - getOptionSize(option) for variable row heights (e.g., rich media or multi-line labels).
 *   - isOptionEqualToValue(a, b) for bespoke identity semantics beyond default {label,value}.
 *
 * Search Model:
 *   - If explicit searchKeys provided, only those keys + (label/value when present) are scanned.
 *   - If none provided & first object-like option exists, all enumerable shallow keys are used.
 *   - Primitive arrays within a scanned key are shallowly inspected (string containment only).
 *   - filterOption short-circuits internal logic entirely.
 *
 * Virtualization Model:
 *   - flattenedOptions mixes group headers + option rows; react-window drives rendering via itemSize.
 *   - OverscanCount kept low (2) balancing scroll performance vs off-screen pre-render cost.
 *
 * Accessibility:
 *   - Focus modality tracking distinguishes keyboard vs pointer to auto-open only on keyboard focus.
 *   - Arrow key navigation skips group headers; highlightedIndex separate from selection.
 *   - Appropriate ARIA roles: listbox + option, with aria-selected for chosen options.
 *
 * Error/Success Indicators:
 *   - Visual states update container classes & helper text; icon adornments suppressed when status icons visible.
 *
 * Future Enhancements (non-breaking ideas):
 *   - Optional async loading (show spinner row, handle incremental append).
 *   - Debounced search to mitigate rapid queries on large sets.
 *   - Cache lowercase string representations for repeat searches (especially when options stable).
 *   - Type-ahead auto-complete for first matching option.
 *   - Optional fuzzy matching (e.g., fuse.js) behind filterOption.
 *   - Multi-column layout or grid virtualization for complex rich media options.
 *
 * Generics and modes:
 *   - Single mode (default): value?: T; onChange?(T); renderValue?(T) => ReactNode
 *   - Multiple mode: multiple: true; value?: T[]; onChange?(T[]); renderValue?(T[]) => ReactNode
 *
 * Adornments:
 *   - startAdornment / endAdornment can be raw ReactNode or props object { content, variant, className }.
 *   - End adornment defaults to chevron; search icon always available unless error/success state.
 */
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { VariableSizeList as List } from 'react-window';
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

type FlattenedRow<T> = { type: 'group'; group: string; options: T[] } | { type: 'option'; option: T; group?: string };

type CommonAutocompleteProps<T> = {
  id: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  placeholder?: string;
  options: ReadonlyArray<T>;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  readOnly?: boolean;
  startAdornment?: React.ReactNode | AutocompleteFieldAdornmentProps;
  endAdornment?: React.ReactNode | AutocompleteFieldAdornmentProps;
  className?: string;
  size?: AutocompleteFieldSize;
  listItemSize?: number;
  name?: string;
  noOptionsText?: string;
  includeEndIcon?: boolean;
  /** Explicit keys on the option object to search across (else all enumerable keys of first object option are used). Only valid when T is object-like. */
  searchKeys?: T extends object ? readonly Extract<keyof T, string>[] : never;
  /** Custom filter function. If provided overrides default search + searchKeys. */
  filterOption?: (query: string, option: T) => boolean;
  /** Provide a function returning size (height in px) for an option row (excluding group headers). */
  getOptionSize?: (option: T) => number | undefined;
  // group header rows use listItemSize

  // Renderers
  /**
   * Render an option row. The second argument provides metadata such as the current dropdown/list width
   * (in pixels) so that consumers can apply dynamic truncation / ellipsis styling if needed.
   * It is optional to preserve backward compatibility with existing (option: T) => ReactNode signatures.
   */
  renderOption?: (option: T, meta?: { listWidth: number }) => React.ReactNode;
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
  disabled?: boolean | ((options: ReadonlyArray<T>, value: T | undefined) => boolean);
};

export type MultipleAutocompleteProps<T> = CommonAutocompleteProps<T> & {
  multiple: true;
  value?: T[];
  onChange?: (value: T[]) => void;
  onInputClick?: (e: React.MouseEvent) => void;
  renderValue?: (values: T[]) => React.ReactNode;
  disabled?: boolean | ((options: ReadonlyArray<T>, value: T[] | undefined) => boolean);
};

/**
 * isIconElement – heuristic icon detection for adornments
 * We look for a displayName containing 'Icon' (common with lucide / custom icon components) to
 * apply icon-specific styling when explicit variant not provided. This remains a heuristic to avoid
 * tight coupling with any specific icon library implementation.
 */
const isIconElement = (node: React.ReactNode): boolean => {
  if (!React.isValidElement(node)) return false;
  const type = node.type as { displayName?: string } | undefined;
  const displayName = type?.displayName;
  return typeof displayName === 'string' && displayName.includes('Icon');
};

/**
 * isProps – type guard for structured adornment prop object { content, variant?, className? }.
 * Allows dual API: raw ReactNode or structured configuration.
 */
const isProps = (val: unknown): val is AutocompleteFieldAdornmentProps =>
  typeof val === 'object' && val !== null && 'content' in (val as Record<string, unknown>);

/**
 * isOption – structural heuristic for the common { label, value } pattern.
 * This enables:
 *   - Default rendering (option.label)
 *   - Identity comparison (option.value)
 * Without a stricter type contract; keeps component flexible for mixed shapes.
 */
const isOption = (o: unknown): o is { label: string; value: unknown } =>
  !!o && typeof o === 'object' && 'label' in (o as Record<string, unknown>) && 'value' in (o as Record<string, unknown>);
// Rationale: We avoid additional property asserts to keep runtime overhead negligible & remain permissive.

// ---------------- Adornment Components ----------------
interface StartAdornmentProps {
  adornment: React.ReactNode | AutocompleteFieldAdornmentProps | undefined;
  getClassName: (key: string) => string;
}

/**
 * StartAdornment – renders optional leading visual element inside input wrapper.
 * Accepts either a raw ReactNode or a structured props object. Applies styling heuristics:
 *   variant > iconDetection > default styling.
 */
const StartAdornment = React.memo(function StartAdornment({ adornment, getClassName }: StartAdornmentProps) {
  if (!adornment) return null;
  // Handle both raw ReactNode and structured { content, variant, className } prop forms.
  const content = isProps(adornment) ? adornment.content : adornment;
  const variant = isProps(adornment) ? adornment.variant : undefined;
  const extra = isProps(adornment) ? adornment.className : undefined;
  let cls = getClassName('startAdornment');
  // Determine styling intent: explicit variant beats icon heuristic; fallback to 'default'.
  if (variant) cls += ` ${getClassName(variant)}`;
  else if (isIconElement(content)) cls += ` ${getClassName('icon')}`;
  else cls += ` ${getClassName('default')}`;
  if (extra) cls += ` ${extra}`;
  return <div className={cls}>{content}</div>;
});

interface EndAdornmentProps {
  adornment: React.ReactNode | AutocompleteFieldAdornmentProps | undefined;
  getClassName: (key: string) => string;
  isOpen: boolean;
  isDisabled: boolean;
  readOnly: boolean;
  hasEndInputAdornment: boolean;
  onToggle: () => void;
  lastInteractionRef: React.MutableRefObject<'keyboard' | 'pointer' | null>;
}

/**
 * EndAdornment – trailing element controlling dropdown toggle (unless custom override provided).
 * Always clickable unless disabled/readOnly. Maintains modality tracking (pointer vs keyboard).
 */
const EndAdornment = React.memo(function EndAdornment({
  adornment,
  getClassName,
  isOpen,
  isDisabled,
  readOnly,
  hasEndInputAdornment,
  onToggle,
  lastInteractionRef,
}: EndAdornmentProps) {
  const defaultAdornment: AutocompleteFieldAdornmentProps = {
    content: <ChevronDownIcon size={18} className={`${getClassName('chevron')} ${isOpen ? getClassName('chevronUp') : ''}`} />,
    variant: 'default',
    className: undefined,
  };
  // Choose user-provided adornment or internal chevron; same processing pipeline as start adornment.
  const source = adornment ?? defaultAdornment;
  const content = isProps(source) ? source.content : source;
  const variant = isProps(source) ? source.variant : undefined;
  const extraClass = isProps(source) ? source.className : undefined;
  let cls = hasEndInputAdornment ? getClassName('endAdornment-input') : getClassName('endAdornment');
  // Styling priority: variant > icon heuristic > default.
  if (variant) cls += ` ${getClassName(variant)}`;
  else if (isIconElement(content)) cls += ` ${getClassName('icon')}`;
  else cls += ` ${getClassName('default')}`;
  if (extraClass) cls += ` ${extraClass}`;
  return (
    <div
      className={cls}
      onClick={() => !isDisabled && !readOnly && onToggle()}
      onMouseDown={() => {
        lastInteractionRef.current = 'pointer';
      }}
    >
      {content}
    </div>
  );
});

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
  searchKeys,
  filterOption,
  getOptionSize,
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

  /**
   * renderOptionNode – default + custom renderer wrapper. Supplies backward-compatible signature without meta.
   * Throws when encountering non-string, non-{label,value} option without user provided renderOption.
   */
  const renderOptionNode = useCallback(
    (option: T) => {
      if (renderOption) return renderOption(option);
      if (typeof (option as unknown) === 'string') return option as unknown as string;
      if (isOption(option)) return option.label;
      throw new Error('Autocomplete: non-string options require renderOption to be provided.');
    },
    [renderOption]
  );

  /**
   * equals – identity comparison strategy.
   *   - If both values match the {label,value} pattern, compare by .value (stable identity source).
   *   - Else defer to user-supplied isOptionEqualToValue OR strict equality.
   * Ensures predictable toggling in multi-select chips & highlighted matching.
   */
  const equals = useCallback(
    (a: T, b: T) => {
      // Equality strategy: if both are {label,value} treat 'value' as identity; else defer to user comparator or strict equality.
      if (isOption(a) && isOption(b)) return a.value === b.value;
      return isOptionEqualToValue ? isOptionEqualToValue(a, b) : a === b;
    },
    [isOptionEqualToValue]
  );

  const [selectedValues, setSelectedValues] = useState<T[]>(
    multiple ? (Array.isArray(value) ? value : []) : value !== undefined ? [value as T] : []
  );

  const noOptions = options.length === 0;
  const isDisabled = typeof disabled === 'function' ? disabled(options, value as (T & T[]) | undefined) : disabled || noOptions;
  const effectivePlaceholder = noOptions ? noOptionsText : placeholder;

  useEffect(() => {
    if (multiple) setSelectedValues(Array.isArray(value) ? value : []);
    else setSelectedValues(value !== undefined ? [value as T] : []);
  }, [value, multiple]);

  // Derive search keys automatically (first non-null object) if none provided
  /**
   * derivedSearchKeys – auto-generation of key list for search when explicit searchKeys absent.
   * Implementation details:
   *   1. Detect at least one object-like option (non-null plain object).
   *   2. If user supplied searchKeys -> map to string[] (narrow type extraction).
   *   3. Else extract keys from first object-like option (shallow enumeration).
   * Edge Cases:
   *   - Mixed primitive & object options: will still derive from first object.
   *   - Arrays / nested objects ignored (shallow only) for predictable performance.
   */
  const derivedSearchKeys = useMemo(() => {
    // If options are primitive (string/number/boolean), no derived keys.
    const hasObject = options.some(o => typeof o === 'object' && o !== null && !Array.isArray(o));
    if (!hasObject) return [] as string[];
    if (Array.isArray(searchKeys) && searchKeys.length) return searchKeys.map(k => k as string);
    const firstObj = options.find(o => typeof o === 'object' && o !== null && !Array.isArray(o));
    if (firstObj) return Object.keys(firstObj as Record<string, unknown>);
    return [] as string[];
  }, [searchKeys, options]);
  // Above: auto derives keys only when user did not pass explicit searchKeys and data is object-like (shallow heuristic).

  // ---------- Filtering Logic (Shallow Search) ----------
  // Notes:
  //   - O(n * k) where n = options.length, k = derivedSearchKeys.length (or 2 for label/value scan).
  //   - Avoids deep traversal / JSON.stringify to keep latency low even for large sets.
  //   - filterOption provides an escape hatch for custom or fuzzy matching.
  //   - Arrays are only shallowly scanned for string primitives.
  //   - Non-object primitives fallback to simple string containment.
  useEffect(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) {
      setFilteredOptions(options as T[]);
      return;
    }
    const next: T[] = [];
    // Iterate original options (not pre-filtered) each time query changes; complexity O(n * k) where k is inspected keys.
    for (const option of options) {
      // Begin option scan – early exit paths favored (user filter, primitive match, label/value match).
      let match = false;
      if (filterOption) {
        // User-defined filter overrides internal logic entirely.
        match = filterOption(q, option as T);
      } else if (typeof option === 'string') {
        match = option.toLowerCase().includes(q);
      } else if (isOption(option)) {
        match = option.label.toLowerCase().includes(q) || String(option.value).toLowerCase().includes(q);
        // Attempt derived key scan only if initial label/value match failed & keys available.
        if (!match && derivedSearchKeys.length) {
          // Fallback: scan only derived keys (or explicit searchKeys) for string/primitive containment.
          for (const key of derivedSearchKeys) {
            if (key === 'label' || key === 'value') continue; // already covered
            const val = option[key as keyof typeof option];
            if (val == null) continue;
            if (typeof val === 'string') {
              if (val.toLowerCase().includes(q)) {
                match = true;
                break;
              }
            } else if (typeof val === 'number' || typeof val === 'boolean') {
              if (String(val).toLowerCase().includes(q)) {
                match = true;
                break;
              }
            } else if (Array.isArray(val)) {
              for (const item of val) {
                if (typeof item === 'string' && item.toLowerCase().includes(q)) {
                  match = true;
                  break;
                }
              }
              if (match) break;
            }
          }
        }
      } else if (derivedSearchKeys.length && typeof option === 'object' && option !== null && !Array.isArray(option)) {
        // Generic object-like option: scan derived keys (or explicit searchKeys) for primitive string/number/boolean containment.
        for (const key of derivedSearchKeys) {
          const val = option[key as keyof typeof option];
          if (val == null) continue;
          if (typeof val === 'string') {
            if (val.toLowerCase().includes(q)) {
              match = true;
              break;
            }
          } else if (typeof val === 'number' || typeof val === 'boolean') {
            if (String(val).toLowerCase().includes(q)) {
              match = true;
              break;
            }
          } else if (Array.isArray(val)) {
            for (const item of val) {
              if (typeof item === 'string' && item.toLowerCase().includes(q)) {
                match = true;
                break;
              }
            }
            if (match) break;
          }
        }
      } else {
        // last resort minimal stringify (avoid full object cost)
        if (typeof option !== 'object') match = String(option).toLowerCase().includes(q);
      }
      if (match) next.push(option);
    }
    setFilteredOptions(next);
  }, [inputValue, options, filterOption, derivedSearchKeys]);
  // Above effect: intentionally avoids deep traversal; only shallow keys and arrays of primitives are considered.

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

  /**
   * flattenedOptions – normalized sequence consumed by react-window.
   * When grouping enabled:
   *   [ groupHeader, option, option, groupHeader, option, ... ]
   * Without grouping:
   *   [ option, option, ... ]
   * Guarantees stable ordering across renders while query / selection states change.
   */
  const flattenedOptions: FlattenedRow<T>[] = React.useMemo(() => {
    if (!groupBy) return filteredOptions.map(o => ({ type: 'option', option: o }));
    // When grouping is enabled: build a stable row list of group headers + their options for virtualization.
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
    const rows: FlattenedRow<T>[] = [];
    for (const [g, opts] of groupMap.entries()) {
      rows.push({ type: 'group', group: g, options: opts });
      for (const o of opts) rows.push({ type: 'option', option: o, group: g });
    }
    for (const o of ungrouped) rows.push({ type: 'option', option: o });
    return rows;
  }, [filteredOptions, groupBy]);

  // Pre-render base option content (excluding dynamic selection/highlight classes) to reduce work per scroll repaint.
  /**
   * baseOptionContent – pre-render option body nodes once per flattenedOptions change.
   * Prevents re-invoking potentially heavy renderOption implementations on every virtual row redraw.
   */
  const baseOptionContent = useMemo(() => {
    return flattenedOptions.map(row => (row.type === 'option' ? renderOptionNode(row.option) : null));
  }, [flattenedOptions, renderOptionNode]);
  // Pre-rendered option content: avoids recomputing heavy custom renderers during react-window cell redraws.

  // Memoize individual row sizes and overall capped dropdown height to avoid recomputing on every render.
  // Previously height was computed inline and itemSize performed branching each call. Here we precompute once per dependency change.
  /**
   * rowSizes / totalHeight – memoized virtualization metrics.
   * rowSizes: individual pixel heights for each row (group headers use listItemSize unless customized).
   * totalHeight: capped cumulative height (<= 240px) controlling list viewport; prevents overly tall dropdowns.
   * Tuning:
   *   - Adjust cap (240) for different design density.
   *   - Provide getOptionSize for variable content heights.
   */
  const { rowSizes, totalHeight } = useMemo(() => {
    const sizes: number[] = [];
    let accumulated = 0;
    for (let i = 0; i < flattenedOptions.length; i++) {
      const row = flattenedOptions[i];
      let size: number;
      if (row.type === 'group') size = listItemSize;
      else if (getOptionSize) {
        const custom = getOptionSize(row.option);
        size = typeof custom === 'number' && custom > 0 ? custom : listItemSize;
      } else size = listItemSize;
      sizes.push(size);
      if (accumulated < 240) {
        accumulated += size;
      }
    }
    return { rowSizes: sizes, totalHeight: Math.min(accumulated, 240) };
  }, [flattenedOptions, listItemSize, getOptionSize]);
  // Above: compute each row's pixel height once per dependency change; cap scroll viewport to 240px for usability.

  useEffect(() => {
    if (!isOpen || isDisabled || readOnly) return;
    // Keyboard navigation handler – manages highlight traversal & selection.
    const onDocKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(i => {
          // starting from -1: move to first option
          if (i === -1) {
            const first = flattenedOptions.findIndex(r => r.type === 'option');
            return first === -1 ? -1 : first;
          }
          let next = Math.min(i + 1, flattenedOptions.length - 1);
          while (next < flattenedOptions.length && flattenedOptions[next].type === 'group') {
            next = Math.min(next + 1, flattenedOptions.length - 1);
          }
          return next;
        });
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(i => {
          if (i === -1) {
            // from -1 going up: choose last option
            for (let idx = flattenedOptions.length - 1; idx >= 0; idx--) {
              if (flattenedOptions[idx].type === 'option') return idx;
            }
            return -1;
          }
          let prev = Math.max(i - 1, 0);
          while (prev >= 0 && flattenedOptions[prev].type === 'group') {
            prev = Math.max(prev - 1, 0);
          }
          return prev;
        });
      } else if (key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < flattenedOptions.length) {
          e.preventDefault();
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
  }, [isOpen, isDisabled, readOnly, highlightedIndex, flattenedOptions, handleOptionClick]);
  // Above effect: global key listener only while dropdown open & interactive; navigates skipping group headers.

  // Only reset when closing; opening leaves it at -1 until user navigates.
  useEffect(() => {
    if (!isOpen) setHighlightedIndex(-1);
  }, [isOpen]);

  const handleRemoveValue = (valueToRemove: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(val => !equals(val, valueToRemove));
    setSelectedValues(newValues);
    if (multiple) {
      (onChange as MultipleAutocompleteProps<T>['onChange'])?.(newValues);
    }
  };

  // Input change: updates query & conditionally opens dropdown (lazy open on typing).
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen && !isDisabled && !readOnly) setIsOpen(true);
  };
  // Input focus: only auto-open for keyboard modality (accessibility) & not immediately post-close.
  const onInputFocus: React.FocusEventHandler<HTMLInputElement> = e => {
    if (isDisabled || readOnly || isOpen) return;
    if (justClosedRef.current) return;

    // open only for keyboard modality (tab/focus-visible)
    const target = e.currentTarget as HTMLElement;
    const focusVisible = target.matches?.(':focus-visible');
    const isKeyboard = lastInteraction.current === 'keyboard' || focusVisible;

    if (isKeyboard) setIsOpen(true);
  };
  // Rationale: only auto-open on focus when modality is keyboard (accessibility) & not immediately after closing.

  // Down-arrow from closed state: open & allow navigation start.
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
        <StartAdornment adornment={startAdornment} getClassName={getClassName} />

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
          <EndAdornment
            adornment={endAdornment}
            getClassName={getClassName}
            isOpen={isOpen}
            isDisabled={isDisabled}
            readOnly={readOnly}
            hasEndInputAdornment={!!hasEndInputAdornment}
            onToggle={() => setIsOpen(o => !o)}
            lastInteractionRef={lastInteraction}
          />
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
                {/* Virtualized options list – react-window VariableSizeList */}
                <List
                  height={totalHeight}
                  width={'100%'}
                  itemCount={flattenedOptions.length}
                  itemSize={index => rowSizes[index]}
                  itemData={{ rows: flattenedOptions, selectedValues, handleOptionClick, highlightedIndex }}
                  overscanCount={2}
                  className={getClassName('optionsList')}
                >
                  {({
                    index,
                    style,
                    data,
                  }: {
                    index: number;
                    style: React.CSSProperties;
                    data: { rows: FlattenedRow<T>[]; selectedValues: T[]; handleOptionClick: (o: T) => void; highlightedIndex: number };
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
                    const isHighlighted = index === highlightedIndex; // local state for visual highlight (keyboard only)
                    return (
                      <div
                        key={index}
                        style={style}
                        role='option'
                        aria-selected={isSelected}
                        className={`${getClassName('option')} ${isSelected ? getClassName('selectedOption') : ''} ${isHighlighted ? getClassName('highlightedOption') : ''}`}
                        onClick={() => data.handleOptionClick(option)}
                        // Intentionally no onMouseEnter here to prevent pointer hover re-renders.
                      >
                        {baseOptionContent[index] /* Pre-rendered content (stable reference) */}
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
