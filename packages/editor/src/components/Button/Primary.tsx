import { BaseButton, BaseButtonProps } from './BaseButton';
import styles from './Primary.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getPrimaryClassName = getClassNameFactory('PrimaryButton', styles);

// Props interface for better type safety
export interface PrimaryButtonProps extends BaseButtonProps {
  /** Color variant of the button */
  variant?: 'primary' | 'success' | 'error';
}
// Export component with variant support
export const PrimaryButton = ({ variant = 'primary', className, ...props }: PrimaryButtonProps) => {
  const computed = getPrimaryClassName(
    {
      PrimaryButton: true,
      success: variant === 'success',
      error: variant === 'error',
    },
    className
  );
  return <BaseButton className={computed} {...props} />;
};
