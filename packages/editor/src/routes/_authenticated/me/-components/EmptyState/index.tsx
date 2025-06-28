import React from 'react';
import styled from '@emotion/styled';

// Styled Components
const Container = styled.div`
  text-align: center;
  padding: var(--space-16) var(--space-4);
`;

const IconContainer = styled.div`
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
  display: flex;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const Description = styled.p`
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6) 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
`;

const Actions = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
`;

// React Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actions,
  className 
}: EmptyStateProps) {
  return (
    <Container className={className}>
      {icon && <IconContainer>{icon}</IconContainer>}
      <Title>{title}</Title>
      <Description>{description}</Description>
      {actions && <Actions>{actions}</Actions>}
    </Container>
  );
}
