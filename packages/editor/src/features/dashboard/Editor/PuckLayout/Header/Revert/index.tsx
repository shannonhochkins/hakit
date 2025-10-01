import { useCallback, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';
import { useUnsavedChanges } from '@hooks/useUnsavedChanges';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { Modal, ModalActions } from '@components/Modal';
import { createUsePuck } from '@measured/puck';
import styles from './Revert.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const usePuck = createUsePuck();
const getClassName = getClassNameFactory('Revert', styles);

export function Revert() {
  const { hasUnsavedChanges, revertChanges } = useUnsavedChanges();
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = usePuck(state => state.dispatch);
  const setHistories = usePuck(state => state.history.setHistories);

  const handleRevert = useCallback(() => {
    revertChanges(dispatch);
    setHistories([]);
    setShowConfirm(false);
  }, [revertChanges, setHistories, dispatch]);

  const onClose = useCallback(() => {
    setShowConfirm(false);
  }, []);

  if (!hasUnsavedChanges) {
    return null;
  }

  return (
    <>
      <IconButton
        variant='transparent'
        icon={<RotateCcw size={16} />}
        onClick={() => setShowConfirm(true)}
        tooltipProps={{
          placement: 'bottom',
          title: 'Revert all changes',
        }}
        aria-label='Revert changes'
      />

      <Modal open={showConfirm} title='Revert All Changes?' onClose={onClose}>
        <div className={getClassName('RevertContent')}>
          This will discard all unsaved changes and restore the page to its last saved state. This action cannot be undone.
        </div>

        <ModalActions style={{ padding: 'var(--space-4)' }}>
          <SecondaryButton aria-label='' onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton aria-label='' onClick={handleRevert} autoFocus>
            Revert Changes
          </PrimaryButton>
        </ModalActions>
      </Modal>
    </>
  );
}
