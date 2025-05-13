import { Column, Row } from '@hakit/components';
import styled from '@emotion/styled';
import { Fragment, ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKeyPress } from 'react-use';
import { X } from 'lucide-react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';

const Fab = styled.button<{
  size?: number;
  hasChildren?: boolean;
}>`
  flex-shrink: 0;
  border-radius: 100%;
  aspect-ratio: 1/1;
  align-items: center;
  justify-content: center;
  display: flex;
  cursor: pointer;
`;

const ModalContainer = styled.div`
  --modal-width: 750px;
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  width: var(--modal-width);
  font-weight: 300;
  max-width: 95%;
  transform: translate3d(-50%, -50%, 0);
  color: var(--puck-color-grey-02);
  max-height: calc(100% - 4rem);
  overflow: hidden;
  border-radius: var(--puck-space-px);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  background-color: var(--puck-color-grey-07);
  z-index: calc(var(--ha-modal-z-index, 10) + 1);
  box-shadow: 0px 0px 10px hsla(220, calc(100% * 0.8), 3%, 0.6);
`;
const ModalInner = styled.div`
  display: flex;
  padding: 0rem 1rem 2rem;
  align-items: flex-start;
  flex-direction: column;
`;
const ModalOverflow = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: 5rem;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  flex-wrap: nowrap;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--puck-color-grey-12);
`;

const Title = styled.h4`
  margin: 0;
  font-size: 1.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  color: var(--puck-color-grey-01);
`;

const Description = styled.h4`
  margin: 0;
  font-weight: 400;
  font-size: 0.9rem;
  color: var(--puck-color-grey-023);
`;

const ModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.3);
  z-index: var(--ha-modal-z-index, 10);
  backdrop-filter: blur(0.25em) brightness(0.75);
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

const BASE_Z_INDEX = 500;

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
                  onClick={() => {
                    doClose();
                  }}
                  className={`modal-close-button`}
                >
                  <X size={24} />
                </Fab>
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
