import { useCallback, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';
import { useUnsavedChanges } from '@hooks/useUnsavedChanges';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import styled from '@emotion/styled';
import { Modal, ModalActions } from '@components/Modal';
import { createUsePuck } from '@measured/puck';
const usePuck = createUsePuck();

const RevertContent = styled.div`
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
`;

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

      <Modal open={showConfirm} title='Revert All Changes?' onClose={() => setShowConfirm(false)}>
        <RevertContent>
          This will discard all unsaved changes and restore the page to its last saved state. This action cannot be undone.
        </RevertContent>

        <ModalActions style={{ padding: 'var(--space-4)' }}>
          <SecondaryButton aria-label='' onClick={() => setShowConfirm(false)}>
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
