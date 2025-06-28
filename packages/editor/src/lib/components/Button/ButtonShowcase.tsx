import React, { useState } from 'react';
import styled from '@emotion/styled';
import { PlusIcon, HeartIcon, SettingsIcon, SendIcon } from 'lucide-react';
import { PrimaryButton, SecondaryButton, Fab } from './index';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-8);
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  align-items: center;
`;

const Title = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
`;

const Subtitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
`;

export const ButtonShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Container>
      <Title>Button Components Showcase</Title>
      
      <Section>
        <Subtitle>Primary Buttons</Subtitle>
        <ButtonGroup>
          <PrimaryButton size="sm">Small</PrimaryButton>
          <PrimaryButton>Default</PrimaryButton>
          <PrimaryButton size="lg">Large</PrimaryButton>
          <PrimaryButton loading={loading} onClick={handleLoadingDemo}>
            {loading ? 'Loading...' : 'Test Loading'}
          </PrimaryButton>
          <PrimaryButton startIcon={<SendIcon size={16} />}>
            With Icon
          </PrimaryButton>
        </ButtonGroup>
      </Section>

      <Section>
        <Subtitle>Secondary Buttons</Subtitle>
        <ButtonGroup>
          <SecondaryButton size="sm">Small</SecondaryButton>
          <SecondaryButton>Default</SecondaryButton>
          <SecondaryButton size="lg">Large</SecondaryButton>
          <SecondaryButton disabled>Disabled</SecondaryButton>
          <SecondaryButton startIcon={<SettingsIcon size={16} />}>
            Settings
          </SecondaryButton>
        </ButtonGroup>
      </Section>

      <Section>
        <Subtitle>Floating Action Buttons (FAB)</Subtitle>
        <ButtonGroup>
          <Fab 
            icon={<PlusIcon />} 
            position="relative"
            aria-label="Add item"
          />
          <Fab 
            icon={<HeartIcon />} 
            position="relative"
            variant="secondary"
            size="sm"
            aria-label="Like"
          />
          <Fab 
            icon={<SettingsIcon />} 
            position="relative"
            size="lg"
            aria-label="Settings"
          />
          <Fab 
            icon={<PlusIcon />} 
            position="relative"
            pulse
            aria-label="Add with pulse"
          />
          <Fab 
            icon={<SendIcon />} 
            position="relative"
            loading={loading}
            onClick={handleLoadingDemo}
            aria-label="Send"
          />
        </ButtonGroup>
      </Section>

      {/* Fixed position FAB example */}
      <Fab 
        icon={<PlusIcon />} 
        position="bottom-right"
        pulse
        aria-label="Add new item"
        onClick={() => alert('FAB clicked!')}
      />
    </Container>
  );
};
