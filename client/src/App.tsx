import { httpBatchLink } from '@trpc/client';
import { useState, ReactNode, FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../../client/src/utils/trpc';
import { css, Global } from '@emotion/react';
import { ThemeProvider } from '@hakit/components';
import { ToastContainer } from 'react-toastify';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
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
      {/* TODO - plug in the dark theme toggle from the options */}
      <ToastContainer autoClose={3000} theme="dark" position="bottom-left" />
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
            min-height: 100%;
            margin: auto;
          }
          .react-grid-layout {
            height: 100%;
          }
          .react-grid-item {
            > *:not(.react-resizable-handle):not(.edit-container):not(.parent), > .edit-container >*:not(.edit-bar) {
              margin: 0;
              width: 100% !important;
              flex-shrink: 1;
              flex-grow: 1;
              height: 100% !important;
              box-sizing: border-box !important;
            }
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
          ${isEdit ? `
            #root {
              padding-top: var(--ha-header-height);
              display:flex;
              > div {
                height: auto;
              }
            }
            .react-grid-item > .react-resizable-handle {
              width: 1rem;
              height: 1rem;
              &.react-resizable-handle-se {
                bottom: 0.25rem;
                right: 0.25rem;
                z-index: 2;
                background-image: none;
                &:after {
                  border-color: var(--ha-200);
                }
              }
            }

            .react-grid-item.react-draggable-dragging {
              .edit-bar {
                display: none;
              }
            }
            .react-grid-item {
              &.react-grid-placeholder {
                border-radius: 0.5rem;
              }
              .react-grid-item:not(.react-grid-placeholder) {
                background-color: rgba(0,0,0,0.2);
              }
              > * {
                // pointer-events: none;
              }
            }
            
          ` : ``}
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
