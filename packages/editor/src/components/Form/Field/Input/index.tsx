import React, { useRef, useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import styles from './InputField.module.css';
import { HelperText } from '../_shared/HelperText';
import { FieldLabel } from '../_shared/FieldLabel';
import { Row } from '@components/Layout';

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
  helperText?: React.ReactNode;
  error?: boolean;
  success?: boolean;
  rowAdornment?: React.ReactNode | InputFieldAdornmentProps;
  middleAdornment?: React.ReactNode | InputFieldAdornmentProps;
  startAdornment?: React.ReactNode | InputFieldAdornmentProps;
  endAdornment?: React.ReactNode | InputFieldAdornmentProps;
  /** Visual-only prefix rendered inside the field before the value (not part of value) */
  valuePrefix?: React.ReactNode;
  /** Visual-only suffix rendered inside the field after the value (not part of value) */
  valueSuffix?: React.ReactNode;
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
    rowAdornment,
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
    valuePrefix,
    valueSuffix,
    ...rest
  } = props;
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

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
    valuePrefix ? styles.withPrefix : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [styles.input, props.type === 'multiline' ? styles.textarea : ''].filter(Boolean).join(' ');

  // Only show footer if there's content to display
  const shouldShowFooter = helperText || (props.type === 'multiline' && props.showCharCount && props.maxLength);
  return (
    <div className={containerClasses} onClick={onClick} {...rest}>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <Row alignItems='start' justifyContent='start' gap='var(--space-2)' wrap='nowrap'>
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
          {valuePrefix && (
            <div
              className={styles.valuePrefix}
              onClick={() => {
                if (!readOnly && !disabled) {
                  inputRef.current?.focus();
                }
              }}
            >
              {valuePrefix}
            </div>
          )}
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
              style={{
                ...inputStyles,
                paddingLeft: valuePrefix ? 0 : inputStyles?.paddingLeft,
              }}
              placeholder={props.placeholder}
              hidden={hidden}
              ref={el => {
                inputRef.current = el;
              }}
            />
          ) : (
            <input
              id={id}
              name={name}
              disabled={disabled}
              value={props.type === 'file' ? undefined : value}
              readOnly={readOnly}
              className={inputClasses}
              type={props.type}
              maxLength={props.type === 'number' ? undefined : props.maxLength}
              min={props.type === 'number' ? props.min : undefined}
              max={props.type === 'number' ? props.max : undefined}
              step={props.type === 'number' ? props.step : undefined}
              onChange={handleChange}
              accept={props.type === 'file' ? props.accept : undefined}
              style={{
                ...inputStyles,
                paddingLeft: valuePrefix ? 0 : inputStyles?.paddingLeft,
              }}
              placeholder={props.placeholder}
              hidden={hidden}
              ref={el => {
                // only assign for non-textarea inputs
                inputRef.current = el;
              }}
            />
          )}
          {valueSuffix && <div className={styles.valueSuffix}>{valueSuffix}</div>}
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
        {rowAdornment && <>{rowAdornment}</>}
      </Row>
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
