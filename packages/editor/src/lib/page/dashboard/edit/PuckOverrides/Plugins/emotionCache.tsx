import { useEffect } from "react";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { Plugin } from "@measured/puck";
import { useGlobalStore } from "@lib/hooks/useGlobalStore";

export const createEmotionCachePlugin = (key: string): Plugin => {
  return {
    overrides: {
      iframe: ({ children, document }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const emotionCache = useGlobalStore(state => state.emotionCache);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const setEmotionCache = useGlobalStore(state => state.setEmotionCache);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          // Defer until next render
          setTimeout(() => {
            if (document) {
              setEmotionCache(
                createCache({
                  key,
                  container: document.head,
                })
              );
            }
          }, 0);
        }, [document, setEmotionCache]);

        if (emotionCache) {
          return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
        }

        return <>{children}</>;
      },
    },
  };
};
