import { PrimaryButton } from '@lib/components/Button/Primary';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { AlertTriangleIcon, ClockIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { useUnsavedChanges } from '@lib/hooks/useUnsavedChanges';
import { Modal, ModalActions } from '@lib/components/Modal';
import { Row } from '@hakit/components';

const RecoveryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-2) 0;
`;

const RecoveryMessage = styled.div`
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
`;

const TimeStamp = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  background: var(--color-surface-elevated);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  width: 100%;
`;

export function RecoveryPrompt({ children }: { children?: React.ReactNode }) {
  const { showRecoveryPrompt, hasCheckedOnLoad, acceptRecovery, rejectRecovery, localSaveTime } = useUnsavedChanges();
  if (!hasCheckedOnLoad) {
    return null;
  }
  if (!showRecoveryPrompt) {
    return children;
  }

  return (
    <Modal
      open={showRecoveryPrompt}
      title={
        <Row fullWidth gap='var(--space-2)'>
          <AlertTriangleIcon size={16} />
          <span>Recover Unsaved Changes</span>
        </Row>
      }
      onClose={rejectRecovery}
      description='Unsaved changes detected'
    >
      <RecoveryContent>
        <RecoveryMessage>
          We found unsaved changes from your previous editing session. Would you like to restore them and continue where you left off?
        </RecoveryMessage>

        {localSaveTime && (
          <TimeStamp>
            <ClockIcon size={16} />
            <span>Last auto-saved: {localSaveTime.toLocaleString()}</span>
          </TimeStamp>
        )}
      </RecoveryContent>

      <ModalActions style={{ padding: 'var(--space-4)' }}>
        <ActionsContainer>
          <SecondaryButton aria-label='' onClick={rejectRecovery}>
            Discard Changes
          </SecondaryButton>
          <PrimaryButton aria-label='' onClick={acceptRecovery} autoFocus>
            Restore Changes
          </PrimaryButton>
        </ActionsContainer>
      </ModalActions>
    </Modal>
  );
}
