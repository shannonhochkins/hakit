import { useEffect } from "react";
import createCache from "@emotion/cache";
import { CacheProvider, PropsOf } from "@emotion/react";
import { Overrides, Plugin } from "@measured/puck";
import { useGlobalStore } from "@lib/hooks/useGlobalStore";

function IframeOverride({ children, document } : PropsOf<Overrides['iframe']>) {
    const emotionCache = useGlobalStore(state => state.emotionCache);
    const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
    useEffect(() => {
      if (!document || emotionCache) return;
      const applyCache = () => {
        const head = document?.head;
        if (head) {
          setEmotionCache(createCache({
            key: 'hakit-editor',
            container: head,
          }));
        }
      };
      // If already loaded
      if (document.readyState === 'complete') {
        applyCache();
      }

  }, [setEmotionCache, emotionCache, document]);

  if (emotionCache) {
    return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
  }

  return <>{children}</>;
}

export const createEmotionCachePlugin = (): Plugin => {
  return {
    overrides: {
      iframe: IframeOverride
    }
  }
};
