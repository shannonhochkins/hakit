import { scan } from 'react-scan';

if (import.meta.env.DEV) {
  scan({
    enabled: true,
  });
}

import React from 'react';

import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import '@measured/puck/puck.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './theme.css';
import { RouterProvider } from '@tanstack/react-router';
import { ToastContainer } from 'react-toastify';

import { router } from './router';
import { queryClient } from './queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    <ToastContainer stacked />
  </React.StrictMode>
);
