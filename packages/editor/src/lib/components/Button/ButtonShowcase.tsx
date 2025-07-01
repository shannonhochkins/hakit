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
          <PrimaryButton size='sm' aria-label='Small primary button'>
            Small
          </PrimaryButton>
          <PrimaryButton aria-label='Default primary button'>Default</PrimaryButton>
          <PrimaryButton size='lg' aria-label='Large primary button'>
            Large
          </PrimaryButton>
          <PrimaryButton loading={loading} onClick={handleLoadingDemo} aria-label='Test loading button'>
            {loading ? 'Loading...' : 'Test Loading'}
          </PrimaryButton>
          <PrimaryButton startIcon={<SendIcon size={16} />} aria-label='Primary button with icon'>
            With Icon
          </PrimaryButton>
        </ButtonGroup>
      </Section>

      <Section>
        <Subtitle>Primary Button Variants</Subtitle>
        <ButtonGroup>
          <PrimaryButton variant='primary' aria-label='Primary variant button'>
            Primary
          </PrimaryButton>
          <PrimaryButton variant='success' aria-label='Success variant button'>
            Success
          </PrimaryButton>
          <PrimaryButton variant='error' aria-label='Error variant button'>
            Error
          </PrimaryButton>
          <PrimaryButton variant='success' startIcon={<SendIcon size={16} />} aria-label='Success button with icon'>
            Success with Icon
          </PrimaryButton>
          <PrimaryButton variant='error' startIcon={<SendIcon size={16} />} aria-label='Error button with icon'>
            Error with Icon
          </PrimaryButton>
        </ButtonGroup>
      </Section>

      <Section>
        <Subtitle>Secondary Buttons</Subtitle>
        <ButtonGroup>
          <SecondaryButton size='sm' aria-label='Small secondary button'>
            Small
          </SecondaryButton>
          <SecondaryButton aria-label='Default secondary button'>Default</SecondaryButton>
          <SecondaryButton size='lg' aria-label='Large secondary button'>
            Large
          </SecondaryButton>
          <SecondaryButton disabled aria-label='Disabled secondary button'>
            Disabled
          </SecondaryButton>
          <SecondaryButton startIcon={<SettingsIcon size={16} />} aria-label='Secondary button with settings icon'>
            Settings
          </SecondaryButton>
        </ButtonGroup>
      </Section>

      <Section>
        <Subtitle>Floating Action Buttons (FAB)</Subtitle>
        <ButtonGroup>
          <Fab icon={<PlusIcon />} position='relative' aria-label='Add item' />
          <Fab icon={<HeartIcon />} position='relative' variant='secondary' size='sm' aria-label='Like' />
          <Fab icon={<SettingsIcon />} position='relative' size='lg' aria-label='Settings' />
          <Fab icon={<PlusIcon />} position='relative' pulse aria-label='Add with pulse' />
          <Fab icon={<SendIcon />} position='relative' loading={loading} onClick={handleLoadingDemo} aria-label='Send' />
        </ButtonGroup>
      </Section>

      {/* Fixed position FAB example */}
      <Fab icon={<PlusIcon />} position='bottom-right' pulse aria-label='Add new item' onClick={() => alert('FAB clicked!')} />
    </Container>
  );
};
