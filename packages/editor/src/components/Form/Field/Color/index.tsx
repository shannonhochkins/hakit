import GradientPicker, { useColorPicker } from 'react-best-gradient-color-picker';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Color from 'color';
import styles from './ColorField.module.css';
// Autocomplete now serves as the primary input replacing InputField
import { AutocompleteField } from '../Autocomplete';
import { InputField, InputFieldProps } from '../Input';
import type { FieldOption, InternalComponentFields } from '@shared/typings/fields';
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
import { useGetPuck } from '@measured/puck';
import { useBreadcrumbs } from '@hooks/useBreadcrumbs';
import { ColorSwatches, generateColorSwatches } from '@helpers/color';
import isEqual from '@guanghechen/fast-deep-equal';

const COLOR_PICKER_WIDTH = 250;
const COLOR_PICKER_HEIGHT = 150;

// Lightweight object created once (no per-render reallocation)
const GRADIENT_PICKER_STYLES: Record<string, React.CSSProperties> = (() => {
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
  const base: Record<string, React.CSSProperties> = {};
  for (const p of properties) base[p] = { background: 'var(--clr-surface-a20)' };
  base.rbgcpInput = { background: 'var(--clr-surface-a10)' };
  return base;
})();

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
  /** When true, the theme CSS variables in the autocomplete options will not be included @default false */
  disableThemeAutocomplete?: boolean;
  debounce?: number;
  onChange: (color: string) => void;
  hideControls?: boolean;

  /** INTERNAL USE ONLY - Enabling this in the wrong environment will cause this field to throw an error */
  isWithinEditorContext?: boolean;
}

/*********************************
 * Theme extraction (converted to effect-based to avoid extra renders)
 *********************************/
function ExtractCurrentTheme({ onChange }: { onChange: (theme: InternalComponentFields['theme']) => void }) {
  const breadcrumbs = useBreadcrumbs(Infinity);
  const getPuck = useGetPuck();

  useEffect(() => {
    const { getItemBySelector, appState } = getPuck();
    // Iterate once per breadcrumbs change; call onChange at most once
    for (let i = breadcrumbs.length - 1; i >= 0; i--) {
      const crumb = breadcrumbs[i];
      const isRoot = crumb.id === 'root';
      const item = crumb.selector ? getItemBySelector(crumb.selector) : null;
      if (isRoot) {
        onChange((appState.data.root.props as InternalComponentFields).theme);
        break;
      } else if (item?.props.theme.override) {
        // if the current component has "override" set to true, use it's theme, else keep going
        // until we reach the root
        onChange(item.props.theme as InternalComponentFields['theme']);
        break;
      }
    }
  }, [breadcrumbs, getPuck, onChange]);

  return null;
}

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
  disableThemeAutocomplete = false,
  isWithinEditorContext = false,
}: ColorFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(value);
  const [isValid, setIsValid] = useState<boolean>(() => isValidColorValue(value));
  const [matchedSwatches, setMatchedSwatches] = useState<ColorSwatches | null>(null);
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
    () => (!disableThemeAutocomplete ? buildColorVariableGroups({ currentValue: baseVarForGrouping, matchedSwatches }) : []),
    [disableThemeAutocomplete, baseVarForGrouping, matchedSwatches]
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
      const val = String(o.value);
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

  const renderOptionNode = useCallback((opt: FieldOption) => {
    return (
      <div className={styles.optionRow}>
        <span className={styles.swatchSmall} style={{ background: opt?.meta?.swatch?.color ?? (opt.value as string) }} />
        <span>{opt.label}</span>
      </div>
    );
  }, []);

  const renderValueNode = useCallback(
    (opt: FieldOption) => {
      if (opt) return opt.label;
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

  const mainSwatchColor = useMemo(() => {
    if (isMixVar) {
      const { cssVar, swatch } = resolvedSelectedOption?.meta ?? {};
      return internalValue?.replace(`var(${cssVar})`, swatch?.color ?? '');
    } else if (isCssVar) {
      const { swatch } = resolvedSelectedOption?.meta ?? {};
      return swatch?.color;
    }
    return internalValue;
  }, [isMixVar, isCssVar, resolvedSelectedOption, internalValue]);

  console.log('mainSwatchColor', mainSwatchColor);

  return (
    <>
      {
        <AutocompleteField
          id={id}
          name={name}
          icon={icon}
          size={size}
          options={colorOptions}
          value={resolvedSelectedOption}
          onChange={o => handleAutocompleteChange(o)}
          label={label}
          placeholder={!disableThemeAutocomplete ? 'Select or type a color / gradient' : pickerResolvedValue}
          helperText={isValid ? helperText : `Value "${internalValue}" is not a valid color.`}
          noOptionsText={!disableThemeAutocomplete ? 'No colors available' : pickerResolvedValue}
          disabled={() => {
            if (!disableThemeAutocomplete) return false;
            return disabled ?? false;
          }}
          onInputClick={() => {
            // open the picker
            if (!disableThemeAutocomplete) return;
            setIsOpen(true);
          }}
          readOnly={readOnly}
          className={`${className ?? ''} ${styles.colorField}`}
          renderOption={renderOptionNode}
          renderValue={renderValueNode}
          includeEndIcon={false}
          error={!isValid}
          groupBy={opt => {
            const lbl = opt.label.toLowerCase();
            const match = ['primary', 'surface', 'info', 'warning', 'success', 'error'].find(k => lbl.startsWith(k));
            return match ? match.charAt(0).toUpperCase() + match.slice(1) : opt.meta?.group;
          }}
          renderGroupLabel={group => (
            <div style={{ paddingLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{group}</div>
          )}
          startAdornment={
            <div
              ref={refs.setReference}
              {...getReferenceProps()}
              className={styles.swatch}
              style={{ background: mainSwatchColor }}
              aria-haspopup='dialog'
              aria-expanded={isOpen}
              aria-controls={isOpen ? `${id}-color-popover` : undefined}
              onClick={handleSwatchClick}
            />
          }
          endAdornment={{
            className: 'input',
            content: (
              <AlphaInput id={id} name={name} size={size} value={alphaPct} disabled={isGradientValue} onChange={handleAlphaChange} />
            ),
            variant: 'default',
          }}
        />
      }
      {isWithinEditorContext && (
        <ExtractCurrentTheme
          onChange={theme => {
            if (theme) {
              const swatches = generateColorSwatches({
                primary: theme.colors.primary,
                surface: theme.colors.surface,
                info: theme.colors.semantics.info,
                success: theme.colors.semantics.success,
                warning: theme.colors.semantics.warning,
                danger: theme.colors.semantics.danger,
              });
              if (isEqual(swatches, matchedSwatches)) return;
              setMatchedSwatches(swatches);
              // setMatchedSwatches(swatches);
            }
          }}
        />
      )}
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

/*********************************
 * Gradient Picker wrapper (debounced)
 *********************************/
interface GradientPickerWrapperProps {
  value: string;
  onChange: (color: string) => void;
  debounce: number;
  hideControls?: boolean;
}

const GradientPickerWrapper = memo(({ value, onChange, debounce, hideControls }: GradientPickerWrapperProps) => {
  const debouncedOnChange = useDebouncer(onChange, { wait: debounce, leading: false, trailing: true });

  const onChangeStable = useCallback(
    (next: string) => {
      debouncedOnChange.cancel();
      debouncedOnChange.maybeExecute(next);
    },
    [debouncedOnChange]
  );

  useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange]);

  return (
    <GradientPicker
      hideAdvancedSliders
      hideColorGuide
      hideControls={hideControls}
      hidePresets
      width={COLOR_PICKER_WIDTH}
      height={COLOR_PICKER_HEIGHT}
      value={value}
      onChange={onChangeStable}
      style={GRADIENT_PICKER_STYLES}
    />
  );
});
GradientPickerWrapper.displayName = 'GradientPickerWrapper';

/*********************************
 * Alpha input (pure, memoized)
 *********************************/
interface AlphaInputProps {
  id: string;
  name?: string;
  size: InputFieldProps['size'];
  value: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}

const AlphaInput = memo(({ id, name, size, value, disabled, onChange }: AlphaInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseInt(e.target.value, 10);
      const clamped = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
      onChange(clamped);
    },
    [onChange]
  );

  return (
    <InputField
      id={`alpha-${id}`}
      name={`alpha-${name || id}`}
      type='number'
      min={0}
      max={100}
      size={size}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      aria-label='Alpha percentage'
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      style={{ background: 'transparent', border: 'none', padding: 0 }}
    />
  );
});
AlphaInput.displayName = 'AlphaInput';
