import { Puck } from '@measured/puck';
import { Column } from '@hakit/components';
import styled from '@emotion/styled';
// import { useRef, useCallback } from 'react';
// import { useElementSizeChange } from '@lib/hooks/useElementSizeChange';
// import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';

const CanvasWrapper = styled(Column)`
  width: 100%;
  max-width: 100%;
  padding: var(--space-4);
  /* outline: 2px dashed var(--color-gray-500); */
  /* outline-offset: 2px; */
  border-radius: 4px;
`;

// const PreviewContainer = styled.div<{ $width?: number; $height?: number; $isResponsive: boolean }>`
//   width: ${props => (props.$isResponsive ? '100%' : `${props.$width}px`)};
//   height: ${props => (props.$isResponsive ? '100%' : `${props.$height}px`)};
//   transition: all var(--transition-normal);
//   border-radius: var(--radius-md);
//   overflow: hidden;
//   ${props =>
//     !props.$isResponsive &&
//     `
//     border: 1px solid var(--color-border);
//     box-shadow: var(--shadow-lg);
//   `}
// `;

export function Preview() {
  // const previewRef = useRef<HTMLDivElement>(null);
  // const { canvasPreview, setCanvasPreview } = useEditorUIStore();

  // const handleSizeChange = useCallback(
  //   (size: { width: number; height: number }) => {
  //     setCanvasPreview({ width: size.width, height: size.height });
  //   },
  //   [setCanvasPreview]
  // );

  // useElementSizeChange(previewRef, handleSizeChange);

  return (
    <CanvasWrapper fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
      {/* <PreviewContainer
        ref={previewRef}
        $width={canvasPreview.width}
        $height={canvasPreview.height}
        $isResponsive={canvasPreview.isResponsive}
      >
      </PreviewContainer> */}
      <Puck.Preview />
    </CanvasWrapper>
  );
}
