import GradientPicker from 'react-best-gradient-color-picker';
import { useState, useEffect, useCallback } from 'react';
import styles from './ColorField.module.css';
import { InputField } from '../Input';
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

type InputFieldSize = 'small' | 'medium' | 'large';
export interface ColorFieldProps {
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
  hideControls?: boolean;
}

const COLOR_PICKER_WIDTH = 250;
const COLOR_PICKER_HEIGHT = 150;

export const ColorField = ({
  value = 'transparent',
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
  hideControls = false,
}: ColorFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { iframe } = usePuckIframeElements();

  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset({ mainAxis: 20, crossAxis: 0 }), autoPlacement()],
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate, // keep position synced on scroll/resize/content changes
  });

  // Interactions: click to toggle, dismiss on outside press / ESC, set ARIA role
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

  return (
    <>
      <InputField
        id={id}
        name={name}
        icon={icon}
        value={value}
        label={label}
        helperText={helperText}
        disabled={disabled}
        size={size}
        readOnly={readOnly}
        className={`${className ?? ''} ${styles.colorField}`}
        // Let Floating UI manage the open/close via getReferenceProps (no manual onClick)
        startAdornment={
          <div
            ref={refs.setReference}
            {...getReferenceProps()}
            className={styles.swatch}
            style={{ background: value }}
            aria-haspopup='dialog'
            aria-expanded={isOpen}
            aria-controls={isOpen ? `${id}-color-popover` : undefined}
          />
        }
      />

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
                <GradientPickerWrapper value={value} onChange={onChange} debounce={debounce} hideControls={hideControls} />
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
        background: 'var(--color-gray-800)',
      };
      return acc;
    },
    {} as Record<string, React.CSSProperties>
  ),
  rbgcpInput: {
    background: 'var(--color-gray-900)',
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
      hideControls={!hideControls}
      hidePresets
      width={COLOR_PICKER_WIDTH}
      height={COLOR_PICKER_HEIGHT}
      value={value}
      onChange={_onChange}
      style={gradientPickerStyles}
    />
  );
}
