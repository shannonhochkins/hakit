import styles from '../FieldContainer.module.css';

export const Fieldset = ({ className, ...rest }: React.ComponentPropsWithoutRef<'fieldset'>) => (
  <fieldset className={`${styles.fieldset} ${className || ''}`} {...rest} />
);
