import GradientPicker from 'react-best-gradient-color-picker';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropdownPortal } from '../_shared/useDropdownPortal';
import styles from './ColorField.module.css';
import { InputField } from '../Input';
import { useDebouncer } from '@tanstack/react-pacer';
import { DEFAULT_FIELD_DEBOUNCE_MS } from '@helpers/editor/pageData/constants';

type InputFieldSize = 'small' | 'medium' | 'large';

interface ColorProps {
  value: string;
  id: string;
  name?: string;
  icon?: React.ReactNode;
  helperText?: string;
  label?: React.ReactNode;
  readOnly?: boolean;
  className?: string;
  disabled?: boolean;
  size?: InputFieldSize;
  debounce?: number;
  onChange: (color: string) => void;
}

export const ColorField = ({
  value,
  onChange,
  size = 'medium',
  className,
  label,
  disabled,
  id,
  icon,
  helperText,
  name,
  readOnly = false,
  debounce = DEFAULT_FIELD_DEBOUNCE_MS,
}: ColorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState<string>(value);

  const { renderPortal } = useDropdownPortal({
    anchorRef,
    isOpen,
    onRequestClose: () => setIsOpen(false),
    overlap: 0,
    matchWidth: false,
  });

  // use tanstack debounce to trigger on change after 150ms
  const debouncedOnChange = useDebouncer(onChange, {
    wait: debounce,
    leading: false,
    trailing: true,
  });

  const _onChange = useCallback(
    (next: string) => {
      setLocalValue(next);
      // Reset and schedule the latest value to ensure trailing delivery
      debouncedOnChange.cancel();
      debouncedOnChange.maybeExecute(next);
    },
    [debouncedOnChange]
  );

  useEffect(() => {
    return () => {
      // close the dropdown when the component unmounts
      setIsOpen(false);
    };
  }, []);

  return (
    <>
      <InputField
        id={id}
        name={name}
        icon={icon}
        value={localValue}
        label={label}
        helperText={helperText}
        disabled={disabled}
        size={size}
        readOnly={readOnly}
        className={`${className} ${styles.colorField}`}
        onClick={() => (disabled ? undefined : setIsOpen(!isOpen))}
        startAdornment={<div ref={anchorRef} className={styles.swatch} style={{ background: `${localValue}` }} />}
      />
      {renderPortal(
        <div className={styles.portalWrapper}>
          <div className={styles.popover}>
            <GradientPicker
              hideAdvancedSliders
              hideColorGuide
              hidePresets
              width={250}
              height={150}
              value={localValue ?? 'transparent'}
              onChange={_onChange}
            />
          </div>
        </div>
      )}
    </>
  );
};
