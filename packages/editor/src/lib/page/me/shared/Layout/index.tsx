import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

const MainSection = styled.main`
  flex: 1;
  padding: var(--space-6);
`;

// React Component
export function Layout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <LayoutContainer>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <MainContent>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <MainSection>
          {children}
        </MainSection>
      </MainContent>
    </LayoutContainer>
  );
}