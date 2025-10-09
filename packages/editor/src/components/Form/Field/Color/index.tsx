import GradientPicker from 'react-best-gradient-color-picker';
import { useState, useRef, useEffect } from 'react';
import { useDropdownPortal } from '../_shared/useDropdownPortal';
import styles from './ColorField.module.css';
import { InputField } from '../Input';
import { useDebouncer } from '@tanstack/react-pacer';

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
}: ColorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState(value);

  const { renderPortal } = useDropdownPortal({
    anchorRef,
    isOpen,
    onRequestClose: () => setIsOpen(false),
    overlap: 0,
    matchWidth: false,
  });

  // use tanstack debounce to trigger on change after 150ms
  const debouncedOnChange = useDebouncer(onChange, {
    wait: 150,
  });

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
        startAdornment={<div ref={anchorRef} className={styles.swatch} style={{ background: `${value}` }} />}
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
              value={value ?? 'transparent'}
              onChange={color => {
                setLocalValue(color);
                debouncedOnChange.cancel();
                debouncedOnChange.maybeExecute(color);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
