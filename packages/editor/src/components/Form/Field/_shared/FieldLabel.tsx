import { Lock } from 'lucide-react';
import styles from './FieldLabel.module.css';
import { ReactNode } from 'react';

export function FieldLabel({
  label,
  readOnly,
  icon,
  htmlFor,
  endAdornment,
  className,
  style,
}: {
  label?: ReactNode;
  readOnly?: boolean;
  icon?: React.ReactNode;
  htmlFor?: string;
  endAdornment?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!label) return null;
  return (
    <div className={`${styles.labelRow} ${className}`} style={style}>
      <div className={styles.simpleRow}>
        {icon && <div className={styles.labelIcon}>{icon}</div>}
        {htmlFor ? (
          <label className={styles.labelText} htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className={styles.labelText}>{label}</span>
        )}
      </div>
      <div className={styles.simpleRow}>
        {readOnly && (
          <div className={styles.disabledIcon} title='Read-only'>
            <Lock size='12' />
          </div>
        )}
        {endAdornment}
      </div>
    </div>
  );
}
/// TODO - Add size variants (input field has these already)
