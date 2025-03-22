import { Row } from '@hakit/components';
import { Modal } from '.';
import styled from '@emotion/styled';
import { Button } from '@measured/puck';

interface ConfirmProps {
  open: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const StyledModal = styled(Modal)`
  --modal-width: 500px;
  z-index: var(--ha-modal-popup-z-index);
`;

export function Confirm({ open, title, children, onConfirm, onCancel }: ConfirmProps) {
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
        <Button size='large' onClick={onConfirm}>
          Confirm
        </Button>
      </Row>
    </StyledModal>
  );
}
