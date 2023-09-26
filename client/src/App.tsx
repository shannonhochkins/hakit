import { httpBatchLink } from '@trpc/client';
import { useState, ReactNode, FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../../client/src/utils/trpc';
import { css, Global } from '@emotion/react';
import { ThemeProvider } from '@hakit/components';
// @ts-expect-error - no need to validate this, two files with similar names
import { config } from '../../config.ts';

const getBaseUri = (): string => config.isProductionEnvironment === true ? document.baseURI : '/';

export const TrpcWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUri()}api`,
        })
      ],
    }),
  );
  return (
    <>
      <Global
        styles={css`
          .ace_scrollbar-h {
            display: none;
          }
          html, body, #root {
            width: 100%;
            margin: 0;
            padding: 0;
            font-family: "Helvetica";
            background-color: var(--ha-S50);
          }
          html, body {
            height: 100%;
          }
          #root {
            display: flex;
            padding: 50px 20px;
            min-height: 100%;
            margin: auto;
          }
        `}
      />
      <ThemeProvider />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </>
  );
};
