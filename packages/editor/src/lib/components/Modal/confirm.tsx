import { Row } from '@hakit/components';
import { Modal } from './Modal';
import styled from '@emotion/styled';
import { Button } from '@measured/puck';
import { useState } from 'react';
import { Spinner } from '@lib/components/Spinner';

interface ConfirmProps {
  open: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const StyledModal = styled(Modal)`
  --modal-width: 500px;
  z-index: var(--ha-modal-popup-z-index);
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
        style={{
          marginTop: 24,
        }}
      >
        <Button size='large' onClick={() => {
          const result = onConfirm();
          // if the returned value of onConfirm is a promise, wait for it to resolve
          if (result instanceof Promise) {
            setLoading(true);
            result.then(() => {
              setLoading(false);
            }).catch(() => {
              setLoading(false);
            })
          }
        }}>
          {loading ? <Spinner size="1rem" /> : 'Confirm'}
        </Button>
      </Row>
    </StyledModal>
  );
}
