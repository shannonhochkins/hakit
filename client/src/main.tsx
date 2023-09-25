import React from 'react';
import ReactDOM from 'react-dom/client';
import { TrpcWrapper } from './App';
import { TestService } from './components/TestService';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TrpcWrapper>
      <TestService />
    </TrpcWrapper>
  </React.StrictMode>
);
