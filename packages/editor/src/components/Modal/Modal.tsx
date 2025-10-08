import { Column, Row } from '@components/Layout';
import { Fab } from '@components/Button';
import { ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKeyPress } from 'react-use';
import { X } from 'lucide-react';
import { useGlobalStore } from '@hooks/useGlobalStore';
import styles from './Modal.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Modal', styles);

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
  onClose?: () => void;
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
        <div
          key={`${prefix}-backdrop`}
          className={getClassName('backdrop')}
          id={`${prefix}-backdrop`}
          onClick={() => {
            if (open) {
              onClose?.();
            }
          }}
          style={{
            ...backdropProps?.style,
            zIndex: backdropZ,
          }}
          {...backdropProps}
        />
        <div
          {...rest}
          style={{
            ...style,
            zIndex: containerZ,
          }}
          key={`${prefix}-container`}
          className={getClassName(
            {
              Modal: true,
              fullscreen: fullscreen,
              'no-description': !description,
            },
            className
          )}
        >
          <div key={`${prefix}-header`} className={getClassName('header')}>
            <Column
              alignItems='flex-start'
              className={`modal-column`}
              style={{
                flexShrink: 1,
                maxWidth: '70%',
              }}
            >
              {title && <h4 className={getClassName('title')}>{title}</h4>}
              {description && <h4 className={getClassName('description')}>{description}</h4>}
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
          </div>
          <div key={`${prefix}-overflow`} className={getClassName('overflow')}>
            <div className={getClassName('inner')}>{children}</div>
          </div>
        </div>
      </div>
    ) : null,
    window.document.body
  );
}
