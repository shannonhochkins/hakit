
export function usePuckFrame(): HTMLIFrameElement | null {
  return document.querySelector('iframe#preview-frame');
}
