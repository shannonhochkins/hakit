import { Row } from '@components/Layout';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { Modal } from './Modal';
import { useState } from 'react';
import styles from './confirm.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Confirm', styles);

interface ConfirmProps {
  open: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function Confirm({ open, title, children, onConfirm, onCancel }: ConfirmProps) {
  const [loading, setLoading] = useState(false);
  return (
    <Modal title={title} open={open} onClose={onCancel} className={getClassName()}>
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
    </Modal>
  );
}
