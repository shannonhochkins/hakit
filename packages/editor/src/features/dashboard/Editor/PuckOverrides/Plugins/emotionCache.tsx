import { useEffect } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider, PropsOf } from '@emotion/react';
import { Overrides, Plugin } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useStore } from '@hakit/core';
import { ThemeProvider } from '@hakit/components';

function IframeOverride({ children, document }: PropsOf<Overrides['iframe']>) {
  const emotionCache = useGlobalStore(state => state.emotionCache);
  useEffect(() => {
    if (!document || emotionCache) return;
    // @ts-expect-error - next version will have this
    const { setWindowContext } = useStore.getState();
    const { setEmotionCache, setEditorIframeDocument, editorIframeDocument } = useGlobalStore.getState();

    if (!editorIframeDocument) {
      setEditorIframeDocument(document);
    }

    const applyCache = () => {
      const head = document?.head;
      if (head) {
        setEmotionCache(
          createCache({
            key: 'hakit-addons',
            container: head,
          })
        );
      }
    };
    // If already loaded
    if (document.readyState === 'complete') {
      // get the window from the document
      const win = document.defaultView || window;
      setWindowContext(win);
      applyCache();
    }
  }, [emotionCache, document]);

  if (emotionCache) {
    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider>{children}</ThemeProvider>
      </CacheProvider>
    );
  }

  return <>{children}</>;
}

export const createEmotionCachePlugin = (): Plugin => {
  return {
    overrides: {
      iframe: IframeOverride,
    },
  };
};
