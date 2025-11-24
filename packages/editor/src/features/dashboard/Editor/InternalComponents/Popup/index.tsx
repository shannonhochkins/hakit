import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { registerOverlayPortal, Slot } from '@measured/puck';
import { usePopupStore } from '@hooks/usePopupStore';
import { Fab } from '@components/Button';
import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKeyPress } from 'react-use';
import { X } from 'lucide-react';
import { css } from '@emotion/react';
import { UnitFieldValue } from '@typings/fields';

const BASE_Z_INDEX = 1050;

export type PopupProps = {
  /** Whether to hide the header */
  hideHeader: boolean;
  /** The title for the popup */
  title: string;
  /** The description for the popup */
  description: string;
  /** The content padding */
  contentPadding: UnitFieldValue;
  /** The base width of the popup */
  popupWidth?: UnitFieldValue;
  /** The z-index of the popup */
  zIndex: number;
  /** Location for sub components */
  content: Slot;
  /** hide the close button @default false */
  hideCloseButton?: boolean;
  /** when true, the popup fills the viewport and ignores width/height constraints */
  fullscreen?: boolean;
  /** internal id for the related component  */
  relatedComponentId: string;
};
export const popupComponentConfig: CustomComponentConfig<PopupProps> = {
  label: 'Popup',
  fields: {
    hideHeader: {
      type: 'switch',
      label: 'Hide Header',
      description: 'Whether to hide the header section of the popup',
      default: false,
    },
    title: {
      type: 'text',
      label: 'Title',
      default: 'Popup Title',
      description: 'Title of the popup',
      visible(props) {
        return !props.hideHeader;
      },
    },
    description: {
      type: 'textarea',
      label: 'Description',
      default: 'Popup Description',
      description: 'Description of the popup',
      visible(props) {
        return !props.hideHeader;
      },
    },
    contentPadding: {
      type: 'unit',
      label: 'Content Padding',
      description: 'Padding inside the popup around the content area',
      default: '1rem',
      step: 1,
      supportsAllCorners: true,
    },
    popupWidth: {
      type: 'unit',
      label: 'Popup Width',
      description: 'Base width of the popup, maximum width is 95% of viewport',
      default: '750px',
      step: 1,
    },
    hideCloseButton: {
      type: 'switch',
      label: 'Hide Close Button',
      description: 'Whether to hide the close button',
      default: false,
      visible(props) {
        return !props.hideHeader;
      },
    },
    fullscreen: {
      type: 'switch',
      label: 'Fullscreen',
      description: 'Whether the popup should fill the entire viewport',
      default: false,
    },
    relatedComponentId: {
      type: 'hidden',
      default: '',
    },
    zIndex: {
      type: 'number',
      label: 'Z-Index',
      description: 'Z-Index of the popup',
      default: BASE_Z_INDEX,
    },
    content: {
      type: 'slot',
      label: 'Content',
    },
  },
  permissions: {
    drag: false,
    duplicate: false,
  },
  styles(props) {
    const backdropZ = props.zIndex;
    const containerZ = props.zIndex + 1;
    return `
      .Popup {
        --popup-width: ${props.popupWidth};
        position: absolute !important;
        top: 50%;
        left: 50%;
        display: flex;
        width: var(--popup-width);
        max-width: 95%;
        transform: translate3d(-50%, -50%, 0);
        color: var(--clr-on-surface-a0);
        max-height: calc(100% - 4rem);
        height: auto;
        overflow: hidden;
        border-radius: var(--radius-lg);
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        background-color: var(--clr-surface-a10);
        z-index: ${containerZ};
        box-shadow: var(--shadow-2xl);
        border: 1px solid var(--clr-surface-a60);
        &[data-puck-component] {
          cursor: pointer;
        }
        /* Fullscreen variant */
        &--fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          max-width: 100vw;
          transform: none;
          max-height: 100vh;
          height: 100vh;
          border-radius: 0;
        }

        /* Popup Inner */
        &-inner {
          display: flex;
          padding: ${props.contentPadding};
          align-items: flex-start;
          flex-direction: column;
        }

        /* Popup Overflow */
        &-overflow {
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          width: 100%;
        }

        /* Popup Header */
        &-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          flex-wrap: nowrap;
          background-color: var(--clr-surface-a40);
          border-bottom: 1px solid var(--clr-surface-a60);
        }

        /* Popup Title */
        &-title {
          margin: 0;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 100%;
          color: var(--clr-on-surface-a0);
        }

        /* Popup Description */
        &-description {
          margin: 0;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-sm);
          color: var(--clr-text-a10);
        }
        /* Popup Column */
        &-column {
          justify-content: center;
          align-items: flex-start;
          flex-wrap: wrap;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-shrink: 1;
          max-width: 70%;
        }
        &-row {
          justify-content: center;
          align-items: flex-start;
          flex-wrap: nowrap;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        /* Popup Backdrop */
        &-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          background: color-mix(in srgb, var(--clr-surface-a0) 8%, transparent);
          z-index: ${backdropZ};
          backdrop-filter: blur(var(--blur-sm)) brightness(0.75);
        }
      }
      + [class*="_DraggableComponent_"] {
        z-index: ${containerZ + 1} !important;        
      }
    `;
  },
  render: Render,
};

function Render(props: RenderProps<PopupProps>) {
  const state = usePopupStore(state => state.popups.find(p => p.id === props.id));
  const open = state?.isOpen || false;
  const { fullscreen = false, title, description, hideCloseButton, content: Content } = props;
  const _id = useId();
  const prefix = props.id ?? _id;
  const [isPressed] = useKeyPress(event => event.key === 'Escape');
  const autocloseRef = useRef<Timer | null>(null);
  // for pushing the last open popup in front of any previous popups
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) registerOverlayPortal(ref.current);
  }, [open]);

  const doClose = useCallback(() => {
    if (autocloseRef.current) {
      clearTimeout(autocloseRef.current);
    }
    if (open) usePopupStore.getState().closePopup(props.id);
  }, [props.id, open]);

  useEffect(() => {
    const removeCurrent = () => {
      if (autocloseRef.current) {
        clearTimeout(autocloseRef.current);
      }
    };
    removeCurrent();
  }, [open, doClose]);

  useEffect(() => {
    if (isPressed) {
      doClose();
    }
  }, [isPressed, doClose, open]);

  const win = props._editor?.window || window;

  const body = win.document.body as HTMLBodyElement | null;

  if (!body) return <></>;

  return createPortal(
    open ? (
      <div
        id={`${prefix}-popup-wrapper`}
        key={`${prefix}-popup-wrapper`}
        css={css`
          ${props.css}
        `}
      >
        <div className={`Popup-backdrop`} id={`${prefix}-backdrop`} onClick={doClose} />
        <div ref={props._dragRef} className={`Popup ${fullscreen ? 'Popup--fullscreen' : ''}`}>
          {!props.hideHeader && (
            <div key={`${prefix}-header`} className={`Popup-header`}>
              <div className={`Popup-column`}>
                {title && <h4 className={`Popup-title`}>{title}</h4>}
                {description && <h4 className={`Popup-description`}>{description}</h4>}
              </div>
              {!hideCloseButton && (
                <div className='Popup-row' ref={ref}>
                  <Fab
                    icon={<X size={24} />}
                    onClick={doClose}
                    className={`popup-close-button`}
                    aria-label='Close popup'
                    variant='secondary'
                    size='sm'
                  />
                </div>
              )}
            </div>
          )}
          <div key={`${prefix}-overflow`} className={`Popup-overflow`}>
            <div className={`Popup-inner`}>
              <Content />
            </div>
          </div>
        </div>
      </div>
    ) : null,
    body
  );
}
