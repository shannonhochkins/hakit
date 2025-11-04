import styles from './HelperText.module.css';

export interface HelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  helperText?: React.ReactNode;
  error?: boolean;
}

export function HelperText({ helperText, error, ...props }: HelperTextProps) {
  if (!helperText) return null;
  return (
    <span className={`${styles.helperText} ${error ? styles.errorText : ''}`} {...props}>
      {helperText}
    </span>
  );
}
