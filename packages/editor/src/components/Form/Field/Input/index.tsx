import React, { useRef, useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import styles from './InputField.module.css';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';

type InputFieldSize = 'small' | 'medium' | 'large';

type InputFieldAdornmentVariant = 'default' | 'icon' | 'custom';

type InputFieldAdornmentProps = {
  content: React.ReactNode;
  variant?: InputFieldAdornmentVariant;
  className?: string;
};

type InputFieldBaseProps = {
  id: string;
  label?: React.ReactNode;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  middleAdornment?: React.ReactNode | InputFieldAdornmentProps;
  startAdornment?: React.ReactNode | InputFieldAdornmentProps;
  endAdornment?: React.ReactNode | InputFieldAdornmentProps;
  className?: string;
  size?: InputFieldSize;
  icon?: React.ReactNode;
  name?: string;
  inputStyles?: React.CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size' | 'min' | 'max' | 'step' | 'accept'>;

export type InputNumberProps = {
  min?: number;
  max?: number;
  step?: number;
  type: 'number';
} & InputFieldBaseProps &
  Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

export type InputTextProps = {
  type?: 'text' | 'password';
} & InputFieldBaseProps &
  Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

export type InputFileProps = {
  type: 'file';
  accept?: string;
} & InputFieldBaseProps &
  Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

export type InputTextareaProps = {
  type: 'multiline';
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
} & InputFieldBaseProps &
  Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>;

export type InputFieldProps = InputNumberProps | InputFileProps | InputTextareaProps | InputTextProps;

export function InputField(props: InputFieldProps) {
  const {
    id,
    label,
    helperText,
    error = false,
    success = false,
    startAdornment,
    middleAdornment,
    endAdornment,
    className,
    size = 'medium',
    name,
    icon,
    readOnly,
    disabled,
    onChange,
    onClick,
    inputStyles,
    hidden,
    value,
  } = props;
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (props.type === 'multiline' && props.showCharCount) {
      setCharCount(e.target.value.length);
    }
    if (onChange) {
      // @ts-expect-error - onChange internally can't be narrowed here without type casting
      onChange(e);
    }
  };

  const containerClasses = [styles.container, styles[size], className || ''].filter(Boolean).join(' ');

  const inputWrapperClasses = [
    styles.inputWrapper,
    error ? styles.error : '',
    success ? styles.success : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [styles.input, props.type === 'multiline' ? styles.textarea : ''].filter(Boolean).join(' ');

  // Only show footer if there's content to display
  const shouldShowFooter = helperText || (props.type === 'multiline' && props.showCharCount && props.maxLength);
  return (
    <div className={containerClasses} onClick={onClick}>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <div className={inputWrapperClasses}>
        {startAdornment &&
          (() => {
            const adornment = startAdornment as React.ReactNode | InputFieldAdornmentProps;
            const isProps = typeof adornment === 'object' && adornment !== null && 'content' in adornment;
            const content = isProps ? adornment.content : adornment;
            const variant = isProps ? adornment.variant : undefined;
            const className = isProps ? adornment.className : undefined;

            // Determine the styling variant
            let adornmentClass = styles.startAdornment;
            if (variant) {
              adornmentClass += ` ${styles[variant]}`;
            } else if (
              React.isValidElement(content) &&
              content.type &&
              typeof content.type === 'function' &&
              'displayName' in content.type &&
              typeof content.type.displayName === 'string' &&
              content.type.displayName.includes('Icon')
            ) {
              adornmentClass += ` ${styles.icon}`;
            } else {
              adornmentClass += ` ${styles.default}`;
            }
            if (className) {
              adornmentClass += ` ${className}`;
            }

            return (
              <div
                className={`startAdornment ${adornmentClass}`}
                onClick={() => {
                  // trigger file picker when the input is a file input
                  if (!readOnly && !disabled) {
                    if (props.type === 'file') {
                      inputRef.current?.click();
                    } else {
                      inputRef.current?.focus();
                    }
                  }
                }}
              >
                {content}
              </div>
            );
          })()}
        {props.type === 'multiline' ? (
          <textarea
            id={id}
            name={name}
            readOnly={readOnly}
            className={inputClasses}
            rows={props.rows}
            maxLength={props.maxLength}
            onChange={handleChange}
            value={value}
            style={inputStyles}
            placeholder={props.placeholder}
            hidden={hidden}
          />
        ) : (
          <input
            id={id}
            name={name}
            disabled={disabled}
            value={value}
            readOnly={readOnly}
            className={inputClasses}
            type={props.type}
            maxLength={props.type === 'number' ? undefined : props.maxLength}
            min={props.type === 'number' ? props.min : undefined}
            max={props.type === 'number' ? props.max : undefined}
            step={props.type === 'number' ? props.step : undefined}
            onChange={handleChange}
            accept={props.type === 'file' ? props.accept : undefined}
            style={inputStyles}
            placeholder={props.placeholder}
            hidden={hidden}
            ref={el => {
              // only assign for non-textarea inputs
              inputRef.current = el;
            }}
          />
        )}
        {middleAdornment && <>{middleAdornment}</>}
        {endAdornment &&
          (() => {
            const adornment = endAdornment as React.ReactNode | InputFieldAdornmentProps;
            const isProps = typeof adornment === 'object' && adornment !== null && 'content' in adornment;
            const content = isProps ? adornment.content : adornment;
            const variant = isProps ? adornment.variant : undefined;
            const className = isProps ? adornment.className : undefined;

            // Determine the styling variant
            let adornmentClass = styles.endAdornment;
            if (variant) {
              adornmentClass += ` ${styles[variant]}`;
            } else if (
              React.isValidElement(content) &&
              content.type &&
              typeof content.type === 'function' &&
              'displayName' in content.type &&
              typeof content.type.displayName === 'string' &&
              content.type.displayName.includes('Icon')
            ) {
              adornmentClass += ` ${styles.icon}`;
            } else {
              adornmentClass += ` ${styles.default}`;
            }
            if (className) {
              adornmentClass += ` ${className}`;
            }

            return <div className={`endAdornment ${adornmentClass}`}>{content}</div>;
          })()}
        {error && !endAdornment && (
          <div className={styles.endAdornment}>
            <AlertCircleIcon size={18} className={styles.errorIcon} />
          </div>
        )}
        {success && !endAdornment && (
          <div className={styles.endAdornment}>
            <CheckCircleIcon size={18} className={styles.successIcon} />
          </div>
        )}
      </div>
      {shouldShowFooter && (
        <div className={styles.footer}>
          <HelperText helperText={helperText} error={error} />
          {props.type === 'multiline' && props.showCharCount && props.maxLength && (
            <span className={styles.charCount}>
              {charCount}/{props.maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
