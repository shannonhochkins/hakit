export const gridStyles = (isEditMode: boolean) => `  
  .react-grid-layout {
    position: relative;
    transition: height 200ms ease;
    height: 100%;
  }
  .react-resizable {
    position: relative;
  }
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top, width, height;
    img {
      pointer-events: none;
      user-select: none;
    }
    &.cssTransforms {
      transition-property: transform, width, height;
    }
    &.resizing {
      transition: none;
      z-index: 1;
      will-change: width, height;
    }
    
    &.react-draggable-dragging {
      transition: none;
      z-index: 3;
      will-change: transform;
      .edit-bar {
        display: none;
      }
    }
    
    &.dropping {
      visibility: hidden;
    }
    
    &.react-grid-placeholder {
      background: red;
      opacity: 0.2;
      border-radius: 0.5rem;
      transition-duration: 100ms;
      z-index: 2;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -o-user-select: none;
      user-select: none;
    }
    &.react-grid-item:not(.react-grid-placeholder) {
      background-color: rgba(0,0,0,0.2);
    }
    &.react-grid-placeholder.placeholder-resizing {
      transition: none;
    }
    > .react-resizable-handle {
      position: absolute;
      width: 1rem;
      height: 1rem;
      display: none;
      &:after {
        content: "";
        position: absolute;
        right: 3px;
        bottom: 3px;
        width: 5px;
        height: 5px;
        border-right: 2px solid rgba(0, 0, 0, 0.4);
        border-bottom: 2px solid rgba(0, 0, 0, 0.4);
      }
      .edit-mode & {
        display: block;
      }
    }
    &.static {
      .edit-container {
        cursor: not-allowed;
      }
      .react-resizable-handle {
        display: none;
      }
    }
    .widget-renderer {
      width: 100%;
      height: 100%;
      cursor: move;
      &:not(.accepts-widgets) {
        > * {
          pointer-events: none;
        }
      }
      > * {
        margin: 0;
        width: 100% !important;
        flex-shrink: 1;
        flex-grow: 1;
        height: 100% !important;
        box-sizing: border-box !important;
      }
    }
    > .react-resizable-handle.react-resizable-handle-se {
      bottom: 0.25rem;
      right: 0.25rem;
      cursor: se-resize;
      z-index: 2;
      background-image: none;
      &:after {
        border-color: var(--ha-200);
      }
    }
  }

  ${isEditMode ? `
    #root {
      padding-top: var(--ha-header-height);
    }
  ` : ''}
`;