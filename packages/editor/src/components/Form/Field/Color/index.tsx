import GradientPicker, { useColorPicker } from 'react-best-gradient-color-picker';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Color from 'color';
import styles from './ColorField.module.css';
// Autocomplete now serves as the primary input replacing InputField
import { AutocompleteField } from '../Autocomplete';
import { InputField, InputFieldProps } from '../Input';
import type { FieldOption } from '@shared/typings/fields';
import {
  buildColorVariableGroups,
  isCssVariableValue,
  isGradient,
  parseColorMix,
  extractCssVarToken,
  extractAlphaPct,
} from './colorFieldHelpers';
import { useDebouncer } from '@tanstack/react-pacer';
import { DEFAULT_FIELD_DEBOUNCE_MS } from '@helpers/editor/pageData/constants';
import {
  useFloating,
  autoPlacement,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  autoUpdate,
  offset,
} from '@floating-ui/react';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';

// Validate color values including:
// - hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
// - rgb()/rgba()
// - hsl()/hsla()
// - linear-gradient(...)
// - transparent
// - color-mix(in srgb, ...)
// - var(--token)
// Returns true if any pattern matches.
export function isValidColorValue(val: string | undefined | null): boolean {
  if (!val) return false;
  const v = val.trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  // Very permissive checks per user request
  if (lower.startsWith('linear-gradient(')) return true;
  if (lower.startsWith('color-mix(')) return true;
  if (lower.startsWith('var(')) return /^var\(--[^)]+\)$/.test(lower); // still ensure proper var syntax
  if (lower === 'transparent') return true;
  // Named colors: attempt color() parse, else false
  try {
    Color(v).hex();
    return true;
  } catch {
    /* ignore */
  }
  return false;
}

export interface ColorFieldProps {
  value: string;
  id: string;
  name?: string;
  icon?: React.ReactNode;
  helperText?: string;
  label?: React.ReactNode;
  size?: InputFieldProps['size'];
  readOnly?: boolean;
  className?: string;
  disabled?: boolean;
  /** When true, include theme CSS variables in the autocomplete options; when false, hide options (freeform + picker only). */
  includeThemeVariables?: boolean;
  debounce?: number;
  onChange: (color: string) => void;
  hideControls?: boolean;
}

const COLOR_PICKER_WIDTH = 250;
const COLOR_PICKER_HEIGHT = 150;

export const ColorField = ({
  value = 'transparent',
  size = 'medium',
  onChange,
  className,
  label,
  disabled,
  id,
  icon,
  helperText,
  name,
  readOnly = false,
  debounce = DEFAULT_FIELD_DEBOUNCE_MS,
  hideControls = false,
  includeThemeVariables = true,
}: ColorFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(value);
  const [isValid, setIsValid] = useState<boolean>(() => isValidColorValue(value));
  // alpha slider value (0-100) if working with solid colors or color-mix
  const [alphaPct, setAlphaPct] = useState<number>(() => {
    // Use original incoming value (not yet mutated by internal state) for initialization
    const initial = value;
    const alpha = extractAlphaPct(initial);
    return alpha !== undefined ? alpha : 100;
  });

  useEffect(() => setInternalValue(value), [value]);
  // Re-evaluate validity whenever external value changes
  useEffect(() => {
    setIsValid(isValidColorValue(value));
  }, [value]);
  const { iframe } = usePuckIframeElements();

  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset({ mainAxis: 20, crossAxis: 0 }), autoPlacement()],
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate, // keep position synced on scroll/resize/content changes
  });

  // Single parse for color-mix (avoid duplicate parse operations)
  const parsedMix = useMemo(() => parseColorMix(internalValue), [internalValue]);
  const baseVarForGrouping = parsedMix ? `var(${parsedMix.token})` : internalValue;
  const colorOptions: FieldOption[] = useMemo(
    () => (includeThemeVariables ? buildColorVariableGroups(baseVarForGrouping) : []),
    [includeThemeVariables, baseVarForGrouping]
  );
  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
    referencePress: false,
    ancestorScroll: true, // close on scroll
  });
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // When open, attach a listener inside the iframe document to close the popover
  useEffect(() => {
    if (!isOpen) return;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;

    const handleInsideIframe = () => setIsOpen(false);
    // pointerdown catches mouse + touch
    doc.addEventListener('pointerdown', handleInsideIframe, { passive: true });

    return () => {
      doc.removeEventListener('pointerdown', handleInsideIframe);
    };
  }, [isOpen, iframe]);

  useEffect(() => {
    return () => setIsOpen(false);
  }, []);

  // Determine if internalValue is a color-mix referencing a variable and extract base token for grouping (full parse with alpha groups)
  const mixMatch = parsedMix;
  const isMixVar = !!parsedMix;
  const mixAlpha = parsedMix?.alphaPct;

  // Hook interface for conversions & gradient manipulation
  const { valueToHex } = useColorPicker(internalValue, v => {
    // Suppress picker-driven state updates for var()/color-mix values to prevent recursive render loops
    if (isCssVar || isMixVar) return;
    setInternalValue(v);
    onChange(v);
  });

  const isGradientValue = useMemo(() => isGradient(internalValue), [internalValue]);
  const isCssVar = useMemo(() => isCssVariableValue(internalValue), [internalValue]);

  // Keep alphaPct in sync with internalValue when it changes externally (picker / freeform / variable)
  useEffect(() => {
    if (isGradientValue || isCssVar || isMixVar) return; // ignore sync for var/mix/gradient
    // Attempt to parse rgba(...)
    const maybe = extractAlphaPct(internalValue);
    if (maybe !== undefined) {
      if (maybe !== alphaPct) setAlphaPct(maybe);
      return;
    }
    if (alphaPct !== 100) setAlphaPct(100);
  }, [internalValue, isGradientValue, isCssVar, isMixVar, alphaPct]);

  // variable selection handled inline in Autocomplete onChange

  const handleAlphaChange = useCallback(
    (next: number) => {
      setAlphaPct(next);
      // If current value is solid rgba/hex/hsl modify alpha in rgba form (simple approach)
      if (!isGradientValue && !isCssVar && !mixMatch) {
        // Minimal parsing: convert any hex/hsl to rgba via colorPicker conversions (hexString -> valueToHex())
        const hex = valueToHex();
        // hex may include '#rrggbb' or '#rrggbbaa' if showHexAlpha used; ensure we have r,g,b
        const hexNorm = hex.replace('#', '');
        const r = parseInt(hexNorm.substring(0, 2), 16);
        const g = parseInt(hexNorm.substring(2, 4), 16);
        const b = parseInt(hexNorm.substring(4, 6), 16);
        const a = next / 100;
        const rgba = `rgba(${r},${g},${b},${a})`;

        setInternalValue(rgba);
        onChange(rgba);
      } else if (isCssVar || mixMatch) {
        // Represent alpha adjustment using color-mix, preserving the underlying var token.
        // Example: alphaPct=60 -> color-mix(in srgb, var(--token) 60%, transparent 40%)
        const transparentPortion = 100 - next;
        const token = extractCssVarToken(internalValue) || mixMatch?.token;
        if (token) {
          // Guard against redundant mix reconstruction (prevents update depth loops)
          if (isMixVar && typeof mixAlpha === 'number' && mixAlpha === next) return;
          if (next === 100) {
            // revert to pure var()
            const pure = `var(${token})`;

            setInternalValue(pure);
            onChange(pure);
          } else {
            const mix = `color-mix(in srgb, var(${token}) ${next}%, transparent ${transparentPortion}%)`;

            setInternalValue(mix);
            onChange(mix);
          }
        }
      }
    },
    [isGradientValue, isCssVar, mixMatch, valueToHex, isMixVar, mixAlpha, internalValue, onChange]
  );

  // Keep alphaPct synced with color-mix values
  useEffect(() => {
    if (mixMatch && mixMatch.alphaPct !== alphaPct) setAlphaPct(mixMatch.alphaPct);
  }, [mixMatch, alphaPct]);

  // Option resolver for Autocomplete value
  const resolvedSelectedOption = useMemo(() => {
    if (mixMatch) return colorOptions.find(o => o.meta?.cssVar === mixMatch.token);
    return colorOptions.find(o => o.value === internalValue);
  }, [mixMatch, colorOptions, internalValue]);

  const handleAutocompleteChange = useCallback(
    (o: FieldOption | undefined) => {
      if (!o) return;
      const val = o.value as string;
      if (/^var\(--[^)]+\)$/.test(val) && alphaPct < 100) {
        const token = val.slice(4, -1);
        const mix = `color-mix(in srgb, var(${token}) ${alphaPct}%, transparent ${100 - alphaPct}%)`;
        setInternalValue(mix);
        onChange(mix);
        setIsValid(isValidColorValue(mix));
      } else {
        setInternalValue(val);
        onChange(val);
        setIsValid(isValidColorValue(val));
      }
    },
    [alphaPct, onChange]
  );

  const renderOptionNode = useCallback((opt: unknown) => {
    const fo = opt as FieldOption;
    return (
      <div className={styles.optionRow}>
        <span className={styles.swatchSmall} style={{ background: fo.value as string }} />
        <span>{fo.label}</span>
      </div>
    );
  }, []);

  const renderValueNode = useCallback(
    (opt: unknown) => {
      const fo = opt as FieldOption | undefined;
      if (fo) return fo.label;
      if (mixMatch) {
        const found = colorOptions.find(o => o.meta?.cssVar === mixMatch.token);
        if (found) return found.label;
      }
      return internalValue;
    },
    [mixMatch, colorOptions, internalValue]
  );

  const handleSwatchClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(o => !o);
  }, []);

  const pickerResolvedValue = useMemo(() => {
    if (!isCssVar) return internalValue;
    try {
      const token = extractCssVarToken(internalValue);
      if (token) {
        const root = document.documentElement;
        const computed = getComputedStyle(root).getPropertyValue(token).trim();
        if (computed) return computed;
      }
    } catch {
      /* ignore */
    }
    return internalValue;
  }, [isCssVar, internalValue]);

  return (
    <>
      {
        <AutocompleteField
          id={id}
          name={name}
          icon={icon}
          size={size}
          options={colorOptions}
          value={resolvedSelectedOption as FieldOption | undefined}
          onChange={o => handleAutocompleteChange(o as FieldOption | undefined)}
          label={label}
          placeholder={includeThemeVariables ? 'Select or type a color / gradient' : pickerResolvedValue}
          helperText={isValid ? helperText : `Value "${internalValue}" is not a valid color.`}
          noOptionsText={includeThemeVariables ? 'No colors available' : pickerResolvedValue}
          disabled={() => {
            if (includeThemeVariables) return false;
            return disabled ?? false;
          }}
          onInputClick={() => {
            // open the picker
            if (includeThemeVariables) return;
            setIsOpen(true);
          }}
          readOnly={readOnly}
          className={`${className ?? ''} ${styles.colorField}`}
          renderOption={renderOptionNode}
          renderValue={renderValueNode}
          includeEndIcon={false}
          error={!isValid}
          groupBy={opt => {
            const o = opt as FieldOption;
            const lbl = o.label.toLowerCase();
            const match = ['primary', 'surface', 'info', 'warning', 'success', 'error'].find(k => lbl.startsWith(k));
            return match ? match.charAt(0).toUpperCase() + match.slice(1) : o.meta?.group;
          }}
          renderGroupLabel={group => (
            <div style={{ paddingLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{group}</div>
          )}
          startAdornment={
            <div
              ref={refs.setReference}
              {...getReferenceProps()}
              className={styles.swatch}
              style={{ background: internalValue }}
              aria-haspopup='dialog'
              aria-expanded={isOpen}
              aria-controls={isOpen ? `${id}-color-popover` : undefined}
              onClick={handleSwatchClick}
            />
          }
          endAdornment={{
            className: 'input',
            content: (
              <InputField
                id={`alpha-${id}`}
                name={`alpha-${name || id}`}
                type='number'
                min={0}
                max={100}
                size={size}
                value={alphaPct}
                disabled={isGradientValue}
                onChange={e => handleAlphaChange(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                aria-label='Alpha percentage'
                onMouseDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
              />
            ),
            variant: 'default',
          }}
        />
      }

      {isOpen && (
        <FloatingPortal /* optional: id="gg-floating-root" or root={someElement} */>
          <FloatingFocusManager context={context} modal={false}>
            <div
              id={`${id}-color-popover`}
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({
                // Helpful defaults; tweak as desired
                className: styles.portalWrapper, // e.g., give it z-index, drop-shadow, etc.
              })}
            >
              <div className={styles.popover}>
                {/* Gradient / Color picker (always available) */}
                <GradientPickerWrapper
                  value={pickerResolvedValue}
                  onChange={v => {
                    setInternalValue(v);
                    onChange(v);
                    setIsValid(isValidColorValue(v));
                  }}
                  debounce={debounce}
                  hideControls={hideControls}
                />
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

interface GradientPickerWrapperProps {
  value: string;
  onChange: (color: string) => void;
  debounce: number;
  hideControls?: boolean;
}

const properties = [
  'body',
  'rbgcpControlBtn',
  'rbgcpControlIcon',
  'rbgcpControlIconBtn',
  'rbgcpControlBtnWrapper',
  'rbgcpColorModelDropdown',
  'rbgcpEyedropperCover',
  'rbgcpControlInput',
  'rbgcpInputLabel',
] as const;

const gradientPickerStyles = {
  ...properties.reduce(
    (acc, prop) => {
      acc[prop] = {
        background: 'var(--clr-surface-a20)',
      };
      return acc;
    },
    {} as Record<string, React.CSSProperties>
  ),
  rbgcpInput: {
    background: 'var(--clr-surface-a10)',
  },
};

function GradientPickerWrapper({ value, onChange, debounce, hideControls }: GradientPickerWrapperProps) {
  const debouncedOnChange = useDebouncer(onChange, {
    wait: debounce,
    leading: false,
    trailing: true,
  });

  const _onChange = useCallback(
    (next: string) => {
      debouncedOnChange.cancel();
      debouncedOnChange.maybeExecute(next);
    },
    [debouncedOnChange]
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <GradientPicker
      hideAdvancedSliders
      hideColorGuide
      hideControls={hideControls}
      hidePresets
      width={COLOR_PICKER_WIDTH}
      height={COLOR_PICKER_HEIGHT}
      value={value}
      onChange={_onChange}
      style={gradientPickerStyles}
    />
  );
}
