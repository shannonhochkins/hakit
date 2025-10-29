import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './SliderField.module.css';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';
import { useDebouncer } from '@tanstack/react-pacer';
import { DEFAULT_FIELD_DEBOUNCE_MS } from '@helpers/editor/pageData/constants';
type SliderFieldSize = 'small' | 'medium' | 'large';

type SliderFieldProps = {
  id: string;
  name: string;
  label?: React.ReactNode;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  /** debounce delay in ms (defaults to shared constant) */
  debounce?: number;
  disabled?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  size?: SliderFieldSize;
  /** should the tooltip value be hidden @default false */
  hideTooltip?: boolean;
  /** function to format the value displayed in the tooltip */
  formatTooltipValue?: (value: number) => string;
};
export function SliderField({
  id,
  name,
  label,
  helperText,
  error = false,
  success = false,
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  disabled = false,
  readOnly = false,
  showValue = false,
  valuePrefix = '',
  valueSuffix = '',
  className,
  size = 'medium',
  formatTooltipValue,
  hideTooltip = false,
  icon,
  debounce = DEFAULT_FIELD_DEBOUNCE_MS,
}: SliderFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipRefWrapper = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const localValueRef = useRef(value);

  // Reset dragging state when component becomes disabled or readonly
  useEffect(() => {
    if (disabled || readOnly) {
      setIsDragging(false);
    }
  }, [disabled, readOnly]);

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localValueRef.current || hideTooltip) return;
    const _min = parseFloat(`${min ?? 0}`);
    const _max = parseFloat(`${max ?? 100}`);
    const _step = parseFloat(`${step ?? 1}`);
    const roundedValue = parseFloat(localValueRef.current.toFixed(_step < 1 ? Math.abs(Math.log10(_step)) : 0));
    const percentage = ((localValueRef.current - _min) / (_max - _min)) * 100;

    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${percentage}%`;
      const tooltipValue = typeof formatTooltipValue === 'function' ? formatTooltipValue(roundedValue) : roundedValue;
      tooltipRef.current.setAttribute('data-title', `${tooltipValue}`);
    }
  }, [localValue, min, max, step, formatTooltipValue, hideTooltip]);

  // Debounced change handler (similar pattern to ColorField)
  const debouncedOnChange = useDebouncer(onChange || (() => {}), {
    wait: debounce,
    leading: false,
    trailing: true,
  });

  // External prop change sync (no onChange trigger)
  useEffect(() => {
    if (value !== localValueRef.current) {
      debouncedOnChange.cancel();
      setLocalValue(value);
      localValueRef.current = value;
    }
  }, [value, debouncedOnChange]);

  useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange]);

  // Handle mouse/touch events only when dragging
  useEffect(() => {
    if (!isDragging) return;

    let rafId: number;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (disabled || readOnly || !sliderRef.current) return;

      // Use requestAnimationFrame for smooth updates
      if (rafId) return; // Skip if already scheduled

      rafId = requestAnimationFrame(() => {
        const rect = sliderRef.current?.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

        // Check if mouse is within the slider container bounds (larger clickable area)
        if (rect && clientX >= rect.left && clientX <= rect.right) {
          const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          const newValue = Math.round((min + (max - min) * percent) / step) * step;

          // Only update if value actually changed to prevent unnecessary re-renders
          if (newValue !== localValueRef.current) {
            setLocalValue(newValue);
            localValueRef.current = newValue;
            // debounce update
            debouncedOnChange.cancel();
            debouncedOnChange.maybeExecute(newValue);
          }
        }
        rafId = 0;
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isDragging, min, max, step, disabled, readOnly, debouncedOnChange]);
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || readOnly || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      // Use the full container width for the clickable area
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newValue = Math.round((min + (max - min) * percent) / step) * step;

      // Only update if value actually changed
      if (newValue !== localValueRef.current) {
        setLocalValue(newValue);
        localValueRef.current = newValue;
        debouncedOnChange.cancel();
        debouncedOnChange.maybeExecute(newValue);
      }
    },
    [disabled, readOnly, min, max, step, debouncedOnChange]
  );

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const percent = Math.max(0, Math.min(100, ((localValue - min) / (max - min)) * 100));

  useEffect(() => {
    if (tooltipRefWrapper.current) {
      tooltipRefWrapper.current.style.left = `${percent}%`;
    }
    if (trackRef.current) {
      trackRef.current.style.width = `${percent}%`;
    }
  }, [percent]);

  const containerClasses = [
    styles.container,
    styles[size],
    error ? styles.error : '',
    success ? styles.success : '',
    disabled ? styles.disabled : '',
    readOnly ? styles.readOnly : '',
    isDragging ? styles.dragging : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  const formatValue = (val: number) => `${valuePrefix}${val}${valueSuffix}`;

  return (
    <div className={containerClasses}>
      <div className={styles.labelContainer}>
        <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
        {showValue && <div className={styles.valueDisplay}>{formatValue(localValue)}</div>}
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.slider} ref={sliderRef} onClick={handleTrackClick}>
          <div className={styles.rail} />
          <div className={styles.track} ref={trackRef} />
          <div
            className={styles.thumb}
            style={{ left: `${percent}%` }}
            onMouseDown={handleThumbMouseDown}
            onClick={e => e.stopPropagation()}
          />
          {!hideTooltip && (
            <div
              ref={tooltipRefWrapper}
              className='tooltip-holder'
              style={{
                position: 'absolute',
                top: 0,
              }}
            >
              <div className={styles.tooltip} ref={tooltipRef} />
            </div>
          )}
        </div>
      </div>

      <input type='hidden' name={name} value={localValue} />

      <HelperText helperText={helperText} error={error} />
    </div>
  );
}
