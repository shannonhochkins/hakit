import { Lock } from 'lucide-react';
import styles from './FieldLabel.module.css';
import { ReactNode } from 'react';

export interface FieldLabelProps extends React.ComponentPropsWithRef<'div'> {
  label?: ReactNode;
  readOnly?: boolean;
  icon?: React.ReactNode;
  htmlFor?: string;
  endAdornment?: ReactNode;
  labelClassName?: string;
  iconClassName?: string;
}

export function FieldLabel({
  label,
  readOnly,
  icon,
  htmlFor,
  endAdornment,
  className,
  labelClassName,
  iconClassName,
  style,
  onClick,
}: FieldLabelProps) {
  if (!label) return null;
  return (
    <div className={`${styles.labelRow} ${className}`} style={style} onClick={onClick}>
      <div className={styles.simpleRow + ' ' + styles.firstRow}>
        {icon && <div className={`${styles.labelIcon} ${iconClassName}`}>{icon}</div>}
        {htmlFor ? (
          <label className={`${styles.labelText} ${labelClassName}`} htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className={`${styles.labelText} ${labelClassName}`}>{label}</span>
        )}
      </div>
      {(endAdornment || readOnly) && (
        <div className={styles.simpleRow}>
          {readOnly && (
            <div className={styles.disabledIcon} title='Read-only'>
              <Lock size='12' />
            </div>
          )}
          {endAdornment}
        </div>
      )}
    </div>
  );
}
/// TODO - Add size variants (input field has these already)
