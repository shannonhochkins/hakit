import { useMemo } from 'react';
import { useGlobalStore } from './useGlobalStore';

export function usePuckIframeElements(): {
  document: Document | null;
  iframe: HTMLIFrameElement | null;
  window: Window | null;
} {
  const editorIframeDocument = useGlobalStore(state => state.editorIframeDocument);

  // Get the iframe element from the document if it exists
  const editorIframe = editorIframeDocument?.defaultView?.frameElement as HTMLIFrameElement | null;

  // Get the window object from the document
  const editorWindow = editorIframeDocument?.defaultView || null;

  return useMemo(
    () => ({
      document: editorIframeDocument || document,
      iframe: editorIframe,
      window: editorWindow || window,
    }),
    [editorIframeDocument, editorIframe, editorWindow]
  );
}
