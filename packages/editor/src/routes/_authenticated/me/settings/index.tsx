import { createFileRoute } from '@tanstack/react-router';
import styled from '@emotion/styled';
import { SettingsIcon } from 'lucide-react';

// Styled Components
const SettingsContainer = styled.div`
  padding: var(--space-6);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--clr-on-surface-a0);
  margin: 0 0 var(--space-8) 0;
`;

const ComingSoon = styled.div`
  text-align: center;
  padding: var(--space-16) var(--space-4);
`;

const ComingSoonIcon = styled.div`
  color: var(--clr-text-a10);
  margin-bottom: var(--space-4);
`;

const ComingSoonTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--clr-on-surface-a0);
  margin: 0 0 var(--space-2) 0;
`;

const ComingSoonDescription = styled.p`
  color: var(--clr-text-a10);
  margin: 0;
`;

export const Route = createFileRoute('/_authenticated/me/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SettingsContainer>
      <PageTitle>Settings</PageTitle>

      <ComingSoon>
        <ComingSoonIcon>
          <SettingsIcon size={64} />
        </ComingSoonIcon>
        <ComingSoonTitle>Coming Soon</ComingSoonTitle>
        <ComingSoonDescription>User settings and preferences will be available here in a future update.</ComingSoonDescription>
      </ComingSoon>
    </SettingsContainer>
  );
}
