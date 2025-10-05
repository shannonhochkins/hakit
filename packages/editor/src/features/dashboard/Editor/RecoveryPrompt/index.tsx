import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { AlertTriangleIcon, ClockIcon } from 'lucide-react';
import { useUnsavedChanges } from '@hooks/useUnsavedChanges';
import { Modal, ModalActions } from '@components/Modal';
import { Row } from '@components/Layout';
import styles from './RecoveryPrompt.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('RecoveryPrompt', styles);

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
      <div className={getClassName('RecoveryPrompt-Content')}>
        <div className={getClassName('RecoveryPrompt-Message')}>
          We found unsaved changes from your previous editing session. Would you like to restore them and continue where you left off?
        </div>

        {localSaveTime && (
          <div className={getClassName('RecoveryPrompt-TimeStamp')}>
            <ClockIcon size={16} />
            <span>Last auto-saved: {localSaveTime.toLocaleString()}</span>
          </div>
        )}
      </div>

      <ModalActions style={{ padding: 'var(--space-4)' }}>
        <div className={getClassName('RecoveryPrompt-Actions')}>
          <SecondaryButton aria-label='' onClick={rejectRecovery}>
            Discard Changes
          </SecondaryButton>
          <PrimaryButton aria-label='' onClick={acceptRecovery} autoFocus>
            Restore Changes
          </PrimaryButton>
        </div>
      </ModalActions>
    </Modal>
  );
}
