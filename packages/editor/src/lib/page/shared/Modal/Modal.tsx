import { Column, Row } from '@lib/page/shared/Layout';
import { Fab } from '@lib/page/shared/Button';
import styled from '@emotion/styled';
import { Fragment, ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKeyPress } from 'react-use';
import { X } from 'lucide-react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';

const ModalContainer = styled.div`
  --modal-width: 750px;
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  width: var(--modal-width);
  font-weight: var(--font-weight-normal);
  max-width: 95%;
  transform: translate3d(-50%, -50%, 0);
  color: var(--color-text-primary);
  max-height: calc(100% - 4rem);
  overflow: hidden;
  border-radius: var(--radius-lg);
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background-color: var(--color-surface-elevated);
  z-index: calc(var(--z-modal, 1050) + 1);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border);
`;
const ModalInner = styled.div`
  display: flex;
  padding: 0rem var(--space-4) var(--space-8);
  align-items: flex-start;
  flex-direction: column;
`;

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

const Description = styled.h4`
  margin: 0;
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

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
    <>
      {open && (
        <Fragment key={`${prefix}-fragment`}>
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
            key={`${prefix}-container`}
            className={`modal-container ${className ?? ''}`}
          >
            <ModalHeader className={`modal-header`}>
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
                <Fab
                  icon={<X size={24} />}
                  onClick={() => {
                    doClose();
                  }}
                  className={`modal-close-button`}
                  aria-label="Close modal"
                  variant="secondary"
                  size="sm"
                />
              </Row>
            </ModalHeader>
            <ModalOverflow className={`modal-overflow`}>
              <ModalInner className={'modal-inner'}>{children}</ModalInner>
            </ModalOverflow>
          </ModalContainer>
        </Fragment>
      )}
    </>,
    window.document.body
  );
}
