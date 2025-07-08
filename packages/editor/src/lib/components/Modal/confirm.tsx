import { Row } from '@hakit/components';
import { PrimaryButton, SecondaryButton } from '@lib/components/Button';
import { Modal } from './Modal';
import styled from '@emotion/styled';
import { useState } from 'react';

interface ConfirmProps {
  open: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const StyledModal = styled(Modal)`
  --modal-width: 500px;
  z-index: var(--z-modal);
`;

export function Confirm({ open, title, children, onConfirm, onCancel }: ConfirmProps) {
  const [loading, setLoading] = useState(false);
  return (
    <StyledModal title={title} open={open} onClose={onCancel}>
      {children}
      <Row
        fullWidth
        alignItems='flex-end'
        justifyContent='flex-end'
        gap='var(--space-3)'
        style={{
          marginTop: 24,
        }}
      >
        <SecondaryButton aria-label='' size='md' onClick={onCancel} disabled={loading}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          aria-label=''
          size='md'
          onClick={() => {
            const result = onConfirm();
            // if the returned value of onConfirm is a promise, wait for it to resolve
            if (result instanceof Promise) {
              setLoading(true);
              result
                .then(() => {
                  setLoading(false);
                })
                .catch(() => {
                  setLoading(false);
                });
            }
          }}
          loading={loading}
        >
          Confirm
        </PrimaryButton>
      </Row>
    </StyledModal>
  );
}
