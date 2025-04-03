import React, { ReactNode, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { Check, AlertOctagon, Loader2 } from 'lucide-react';
import { StyledIconButton } from '../..';
import { Tooltip } from '@lib/components/Tooltip';

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
}

const Container = styled.div`
  display: inline-block;
  position: relative;
  outline: none;
`;

const ProgressOverlay = styled.div`
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 100%;
  text-align: center;
  pointer-events: none; /* don't block clicks over the overlay */

  svg {
    width: 1.25em;
    height: 1.25em;
    color: #fff;
  }

  /* Spinner animation for Loader2 icon */
  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export function ProgressButton({ disabled = false, onClick, children, title, ...rest }: ProgressButtonProps) {
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
    <Container {...rest}>
      <Tooltip title={title} placement='left'>
        <StyledIconButton disabled={disabled || progress} onClick={handleClick}>
          <span className={result ? 'hidden' : ''}>{children}</span>
        </StyledIconButton>
      </Tooltip>

      {overlay && (
        <ProgressOverlay>
          {result === 'success' && <Check />}
          {result === 'error' && <AlertOctagon />}
          {progress && <Loader2 className='spinner' />}
        </ProgressOverlay>
      )}
    </Container>
  );
}
