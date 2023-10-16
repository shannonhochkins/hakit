import { httpBatchLink } from '@trpc/client';
import { useState, ReactNode, FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../../client/src/utils/trpc.js';
import { css, Global } from '@emotion/react';
import { ThemeProvider } from '@hakit/components';
import { ToastContainer } from 'react-toastify';
import { gridStyles } from './components/Renderer/styles.js';
import 'react-toastify/dist/ReactToastify.css';

import { useHakitStore } from '@client/store';
const isDevelopment = process.env.NODE_ENV === 'development';

const getBaseUri = (): string => isDevelopment ? `http://localhost:${String(2022)}/` : document.baseURI;

export const TrpcWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const mode = useHakitStore(({ mode }) => mode);
  const config = useHakitStore(({ config }) => config);
  const isEdit = mode === 'edit';
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
      <ThemeProvider {...config.theme ?? {}} />
      <ToastContainer autoClose={3000} theme={config.theme.darkMode ? 'dark' : 'light'} position="bottom-left" />
      <Global
        styles={css`
          :root {
            --ha-background-opaque: rgba(0,0,0,.1);
            --ha-header-height: 3rem;
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
            padding: 0;
            margin: auto;
          }
          
          .form-group {
            .MuiTypography-root {
              color: var(--ha-S400-contrast);
            }
            .MuiPaper-root {
              background-color: rgba(0,0,0,0.1);
              background-image: none;
            }
          }
          ${gridStyles(isEdit)}
        `}
      />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </>
  );
};
