import { createFileRoute } from '@tanstack/react-router';
import styled from '@emotion/styled';
import { HelpCircleIcon, BookOpenIcon, MessageCircleIcon } from 'lucide-react';
import { SecondaryButton } from '@lib/components/Button/Secondary';

// Styled Components
const HelpContainer = styled.div`
  padding: var(--space-6);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-8) 0;
`;

const HelpGrid = styled.div`
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const HelpCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all var(--transition-normal);

  &:hover {
    border-color: var(--color-border-subtle);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const HelpIcon = styled.div`
  color: var(--color-primary-400);
  margin-bottom: var(--space-4);
`;

const HelpTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const HelpDescription = styled.p`
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4) 0;
`;

export const Route = createFileRoute('/_authenticated/me/help/')({
  component: RouteComponent,
});

function RouteComponent() {
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <HelpContainer>
      <PageTitle>Help & Support</PageTitle>

      <HelpGrid>
        <HelpCard>
          <HelpIcon>
            <BookOpenIcon size={48} />
          </HelpIcon>
          <HelpTitle>Documentation</HelpTitle>
          <HelpDescription>
            Browse comprehensive guides, tutorials, and API documentation to get the most out of HA KIT Editor.
          </HelpDescription>
          <SecondaryButton aria-label='' onClick={() => handleExternalLink('https://github.com/shannonhochkins/hakit')}>
            View Documentation
          </SecondaryButton>
        </HelpCard>

        <HelpCard>
          <HelpIcon>
            <MessageCircleIcon size={48} />
          </HelpIcon>
          <HelpTitle>Community Support</HelpTitle>
          <HelpDescription>
            Join our Discord community to get help from other users, share your creations, and stay updated.
          </HelpDescription>
          <SecondaryButton aria-label='' onClick={() => handleExternalLink('https://discord.gg/65UpetST')}>
            Join Discord
          </SecondaryButton>
        </HelpCard>

        <HelpCard>
          <HelpIcon>
            <HelpCircleIcon size={48} />
          </HelpIcon>
          <HelpTitle>Frequently Asked Questions</HelpTitle>
          <HelpDescription>Find answers to common questions about installation, configuration, and troubleshooting.</HelpDescription>
          <SecondaryButton aria-label='' onClick={() => handleExternalLink('https://github.com/shannonhochkins/hakit/discussions')}>
            View FAQs
          </SecondaryButton>
        </HelpCard>
      </HelpGrid>
    </HelpContainer>
  );
}
