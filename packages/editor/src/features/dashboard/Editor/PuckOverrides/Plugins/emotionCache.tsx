import { useEffect } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider, PropsOf } from '@emotion/react';
import { Overrides, Plugin } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useStore } from '@hakit/core';

function IframeOverrideComponent({ children, document }: PropsOf<Overrides['iframe']>) {
  const emotionCache = useGlobalStore(state => state.emotionCache);
  useEffect(() => {
    if (!document) return;
    // @ts-expect-error - next version will have this
    const { setWindowContext } = useStore.getState();
    const { setEmotionCache, setEditorIframeDocument, editorIframeDocument, emotionCache } = useGlobalStore.getState();

    if (!editorIframeDocument) {
      setEditorIframeDocument(document);
    }

    const applyCache = () => {
      const head = document?.head;
      if (head && !emotionCache) {
        const cache = createCache({
          key: 'hakit-addons',
          container: head,
        });
        setEmotionCache(cache);
      }
    };

    // get the window from the document
    const win = document.defaultView || window;
    setWindowContext(win);

    // Always try to apply cache, regardless of ready state
    setTimeout(() => {
      applyCache();
    }, 0);

    // Also listen for readystatechange in case we're too early
    const handleReadyStateChange = () => {
      if (document.readyState === 'complete') {
        applyCache();
      }
    };

    document.addEventListener('readystatechange', handleReadyStateChange);

    return () => {
      document.removeEventListener('readystatechange', handleReadyStateChange);
    };
  }, [document]);

  if (emotionCache) {
    return (
      <CacheProvider value={emotionCache} key={emotionCache.key}>
        {children}
      </CacheProvider>
    );
  }

  return <></>;
}

export const createEmotionCachePlugin = (): Plugin => {
  return {
    overrides: {
      iframe: IframeOverrideComponent,
    },
  };
};
