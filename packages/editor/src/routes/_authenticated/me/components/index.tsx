import { createFileRoute } from '@tanstack/react-router';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/page/shared/Button/Primary';
import { SecondaryButton } from '@lib/page/shared/Button/Secondary';
import { PackageIcon, PlusIcon, DownloadIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

// Styled Components
const ComponentsContainer = styled.div`
  padding: var(--space-6);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-16) var(--space-4);
`;

const EmptyStateIcon = styled.div`
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
`;

const EmptyStateTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const EmptyStateDescription = styled.p`
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6) 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
`;

export const Route = createFileRoute('/_authenticated/me/components/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();


  const handleBrowseAddons = () => {
    navigate({ to: '/addons' });
  };

  const handleCreateComponent = () => {
    // This would open a component creation modal or navigate to a creation page
    console.log('Create custom component clicked');
  };

  return (
    <ComponentsContainer>
      <PageHeader>
        <PageTitle>My Components</PageTitle>
        <PrimaryButton 
          startIcon={<PlusIcon size={16} />}
          onClick={handleCreateComponent}
        >
          Create Component
        </PrimaryButton>
      </PageHeader>

      <EmptyState>
        <EmptyStateIcon>
          <PackageIcon size={64} />
        </EmptyStateIcon>
        <EmptyStateTitle>No custom components yet</EmptyStateTitle>
        <EmptyStateDescription>
          Extend your dashboards with custom components. Create your own or browse the community addon library 
          to find components that enhance your Home Assistant experience.
        </EmptyStateDescription>
        <ActionButtons>
          <PrimaryButton 
            startIcon={<DownloadIcon size={16} />}
            onClick={handleBrowseAddons}
          >
            Browse Addons
          </PrimaryButton>
          <SecondaryButton 
            startIcon={<PlusIcon size={16} />}
            onClick={handleCreateComponent}
          >
            Create Custom Component
          </SecondaryButton>
        </ActionButtons>
      </EmptyState>
    </ComponentsContainer>
  );
}
