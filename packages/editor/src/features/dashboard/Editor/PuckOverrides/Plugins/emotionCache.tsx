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

    // Race condition, because of the calls to the zustand store, we need to wait
    // until the next tick to apply the cache
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

  useEffect(() => {
    return () => {
      // without resetting the cache, we'll be holding onto the incorrect document head
      // So we reset whenever the component unmounts
      useGlobalStore.getState().setEmotionCache(null);
    };
  }, []);

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
