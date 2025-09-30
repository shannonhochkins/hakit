import styles from './HelperText.module.css';

export function HelperText({ helperText, error }: { helperText?: string; error?: boolean }) {
  if (!helperText) return null;
  return <span className={`${styles.helperText} ${error ? styles.errorText : ''}`}>{helperText}</span>;
}
