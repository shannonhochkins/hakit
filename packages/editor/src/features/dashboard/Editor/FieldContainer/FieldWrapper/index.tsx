import styles from '../FieldContainer.module.css';

export const FieldWrapper = ({ className, ...rest }: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={`${styles.fieldWrapper} ${className || ''}`} {...rest} />
);
