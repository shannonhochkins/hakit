import { Column, Row } from '@hakit/components';
import { Fab } from '@components/Button';
import styled from '@emotion/styled';
import { ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKeyPress } from 'react-use';
import { X } from 'lucide-react';
import { useGlobalStore } from '@hooks/useGlobalStore';

const ModalContainer = styled.div<{ $fullscreen?: boolean }>`
  --modal-width: 750px;
  position: ${p => (p.$fullscreen ? 'fixed' : 'absolute')};
  top: ${p => (p.$fullscreen ? '0' : '50%')};
  left: ${p => (p.$fullscreen ? '0' : '50%')};
  display: flex;
  width: ${p => (p.$fullscreen ? '100vw' : 'var(--modal-width)')};
  font-weight: var(--font-weight-normal);
  max-width: ${p => (p.$fullscreen ? '100vw' : '95%')};
  transform: ${p => (p.$fullscreen ? 'none' : 'translate3d(-50%, -50%, 0)')};
  color: var(--color-text-primary);
  max-height: ${p => (p.$fullscreen ? '100vh' : 'calc(100% - 4rem)')};
  height: ${p => (p.$fullscreen ? '100vh' : 'auto')};
  overflow: hidden;
  border-radius: ${p => (p.$fullscreen ? '0' : 'var(--radius-lg)')};
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background-color: var(--color-surface-elevated);
  z-index: calc(var(--z-modal, 1050) + 1);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border);
`;

ModalContainer.displayName = 'ModalContainer';

const ModalInner = styled.div`
  display: flex;
  padding: var(--space-4);
  align-items: flex-start;
  flex-direction: column;
`;

ModalInner.displayName = 'ModalInner';

const ModalOverflow = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: calc(var(--space-16) + var(--space-4)); /* Account for header height */
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;

ModalOverflow.displayName = 'ModalOverflow';

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  flex-wrap: nowrap;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
`;

ModalHeader.displayName = 'ModalHeader';

const Title = styled.h4`
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  color: var(--color-text-primary);
`;

Title.displayName = 'ModalTitle';

const Description = styled.h4`
  margin: 0;
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

Description.displayName = 'ModalDescription';

const ModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: var(--color-surface-overlay);
  z-index: var(--z-modal-backdrop, 1040);
  backdrop-filter: blur(var(--blur-sm)) brightness(0.75);
`;

ModalBackdrop.displayName = 'ModalBackdrop';

/** animation variant controls for the modal container */
export type CustomModalAnimation = (
  duration: number,
  id: string
) => {
  /** animation variant controls for main modal element */
  modal?: Animation;
  /** animation variant controls for the modal header element */
  header?: Animation;
  /** animation variant controls for the modal content element */
  content?: Animation;
};

type Extendable = React.ComponentPropsWithoutRef<'div'>;
export interface ModalProps extends Omit<Extendable, 'title'> {
  /** triggers the modal opening */
  open: boolean;
  /** the react layout to include inside the Modal */
  children: React.ReactNode;
  /** The title of the dialog */
  title?: ReactNode;
  /** the description of the modal */
  description?: ReactNode;
  /** triggered when the users pressed the close button, this is also triggered when the escape key is pressed */
  onClose: () => void;
  /** any prop to pass to the backdrop element */
  backdropProps?: React.ComponentPropsWithoutRef<'div'>;
  /** react elements to render next to the close button */
  headerActions?: () => ReactNode;
  /** Automatically close the modal after the provided number of seconds */
  autocloseSeconds?: number;
  /** hide the close button @default false */
  hideCloseButton?: boolean;
  /** when true, the modal fills the viewport and ignores width/height constraints */
  fullscreen?: boolean;
}

const BASE_Z_INDEX = 1050; // Using design system z-modal value

export function Modal({
  open,
  id,
  title,
  description,
  children,
  onClose,
  backdropProps,
  style,
  className,
  headerActions,
  autocloseSeconds = undefined,
  hideCloseButton = false,
  fullscreen = false,
  ...rest
}: ModalProps) {
  const _id = useId();
  const prefix = id ?? _id;
  const [isPressed] = useKeyPress(event => event.key === 'Escape');
  const autocloseRef = useRef<Timer | null>(null);
  // for pushing the last open modal in front of any previous modals
  const stackIdRef = useRef<number | null>(null);
  const pushModal = useGlobalStore(s => s.pushModal);
  const popModal = useGlobalStore(s => s.popModal);
  const modalStack = useGlobalStore(s => s.modalStack);

  const doClose = useCallback(() => {
    if (autocloseRef.current) {
      clearTimeout(autocloseRef.current);
    }
    if (onClose && open) {
      onClose();
    }
  }, [open, onClose]);

  useEffect(() => {
    const removeCurrent = () => {
      if (autocloseRef.current) {
        clearTimeout(autocloseRef.current);
      }
    };
    removeCurrent();
    if (autocloseSeconds && open) {
      autocloseRef.current = setTimeout(doClose, autocloseSeconds * 1000);
      return removeCurrent;
    }
  }, [open, autocloseSeconds, doClose]);

  useEffect(() => {
    if (isPressed) {
      doClose();
    }
  }, [isPressed, doClose, open]);

  useEffect(() => {
    if (open && stackIdRef.current === null) {
      stackIdRef.current = pushModal();
    }

    return () => {
      if (stackIdRef.current !== null) {
        popModal(stackIdRef.current);
        stackIdRef.current = null;
      }
    };
  }, [open, pushModal, popModal]);

  const index = modalStack.findIndex(id => id === stackIdRef.current);
  const baseZ = BASE_Z_INDEX + index * 2;

  const backdropZ = baseZ;
  const containerZ = baseZ + 1;

  return createPortal(
    open ? (
      <div key={`${prefix}-modal-wrapper`}>
        <ModalBackdrop
          key={`${prefix}-backdrop`}
          className='modal-backdrop'
          id={`${prefix}-backdrop`}
          onClick={() => {
            if (open) {
              onClose();
            }
          }}
          style={{
            ...backdropProps?.style,
            zIndex: backdropZ,
          }}
          {...backdropProps}
        />
        <ModalContainer
          {...rest}
          style={{
            ...style,
            zIndex: containerZ,
          }}
          $fullscreen={fullscreen}
          key={`${prefix}-container`}
          className={`modal-container ${className ?? ''}`}
        >
          <ModalHeader key={`${prefix}-header`} className={`modal-header`}>
            <Column
              alignItems='flex-start'
              className={`modal-column`}
              style={{
                flexShrink: 1,
                maxWidth: '70%',
              }}
            >
              {title && <Title className={`modal-title`}>{title}</Title>}
              {description && <Description className={`modal-description`}>{description}</Description>}
            </Column>
            <Row
              gap='0.5rem'
              wrap='nowrap'
              style={{
                flexShrink: 0,
              }}
            >
              {headerActions && headerActions()}
              {!hideCloseButton && (
                <Fab
                  icon={<X size={24} />}
                  onClick={() => {
                    doClose();
                  }}
                  className={`modal-close-button`}
                  aria-label='Close modal'
                  variant='secondary'
                  size='sm'
                />
              )}
            </Row>
          </ModalHeader>
          <ModalOverflow key={`${prefix}-overflow`} className={`modal-overflow`}>
            <ModalInner className={'modal-inner'}>{children}</ModalInner>
          </ModalOverflow>
        </ModalContainer>
      </div>
    ) : null,
    window.document.body
  );
}
