import React, { ReactNode, useCallback, useState } from 'react';
import { Check, AlertOctagon, Loader2 } from 'lucide-react';
import { PrimaryButton, PrimaryButtonProps } from '@components/Button';
import styles from './ProgressButton.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

interface ProgressButtonProps extends React.ComponentPropsWithRef<'div'> {
  /** Disables the button, preventing clicks. */
  disabled?: boolean;
  /**
   * onClick must return a Promise. If the promise resolves,
   * the button shows success briefly; if it rejects, shows error.
   */
  onClick?: () => Promise<unknown>;
  /** Button label or children. */
  children?: ReactNode;
  variant: PrimaryButtonProps['variant'];
}
const getClassName = getClassNameFactory('ProgressButton', styles);

export function ProgressButton({ disabled = false, onClick, children, title, variant, ...rest }: ProgressButtonProps) {
  const [progress, setProgress] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | undefined>(undefined);

  const handleClick = useCallback(async () => {
    if (!onClick) {
      return;
    }
    // Show spinner
    setProgress(true);

    try {
      // Wait for the promise returned by onClick to resolve
      await onClick();
      // If resolved, show success
      setResult('success');
    } catch (e) {
      console.error(e);
      // If rejected, show error
      setResult('error');
    } finally {
      // Done loading
      setProgress(false);
      // Reset result after 2 seconds
      setTimeout(() => setResult(undefined), 2000);
    }
  }, [onClick]);

  const overlay = Boolean(result) || progress;

  return (
    <div className={getClassName({ contentHidden: overlay }, getClassName('ProgressButton'))} {...rest}>
      <PrimaryButton
        aria-label={title || ''}
        disabled={disabled || progress}
        onClick={handleClick}
        tooltipProps={{
          placement: 'bottom',
        }}
        variant={result === 'success' ? 'success' : result === 'error' ? 'danger' : variant}
      >
        <div className={getClassName('ProgressButton-Content')}>{children}</div>
      </PrimaryButton>

      {overlay && (
        <div className={getClassName('ProgressButton-Overlay')}>
          {result === 'success' && <Check />}
          {result === 'error' && <AlertOctagon />}
          {progress && <Loader2 className={getClassName('ProgressButton-spinner')} />}
        </div>
      )}
    </div>
  );
}
