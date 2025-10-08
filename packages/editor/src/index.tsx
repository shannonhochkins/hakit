import { scan } from 'react-scan';

if (import.meta.env.DEV) {
  scan({
    enabled: true,
  });
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@measured/puck/puck.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ToastContainer } from 'react-toastify';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable the experimental feature flag for React 19 compatibility
      experimental_prefetchInRender: true,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    <ToastContainer stacked />
  </React.StrictMode>
);
