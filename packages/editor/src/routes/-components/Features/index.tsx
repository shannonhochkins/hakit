import styled from '@emotion/styled';
import { Fab } from '@lib/components/Button';
import { FeatureText } from '@lib/components/FeatureText';
import { MousePointerIcon, LayoutIcon, CodeIcon, PaletteIcon, GaugeIcon, CloudIcon } from 'lucide-react';

const FeaturesContainer = styled.section`
  position: relative;
  padding: var(--space-24) 0;
`;

const BackgroundBlur1 = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  width: 384px;
  height: 384px;
  background-color: var(--color-primary-500);
  opacity: 0.1;
  border-radius: var(--radius-full);
  filter: blur(var(--blur-3xl));
  z-index: -10;
`;

const BackgroundBlur2 = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 256px;
  height: 256px;
  background-color: var(--color-secondary-500);
  opacity: 0.1;
  border-radius: var(--radius-full);
  filter: blur(var(--blur-3xl));
  z-index: -10;
`;

const Container = styled.div`
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: var(--space-16);
`;

const MainHeading = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-4);

  @media (min-width: 768px) {
    font-size: var(--font-size-4xl);
  }
`;

const SubHeading = styled.p`
  font-size: var(--font-size-xl);
  color: var(--color-text-muted);
  max-width: 768px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  gap: var(--space-8);

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all var(--transition-normal);

  &:hover {
    background: var(--color-surface);
    border-color: var(--color-border-subtle);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const FeatureTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
`;

const FeatureDescription = styled.p`
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
`;

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <MousePointerIcon size={24} />,
    title: 'Intuitive Drag & Drop',
    description: 'Easily place and arrange components with our intuitive editor interface - no coding required.',
  },
  {
    icon: <LayoutIcon size={24} />,
    title: 'Flexible Layouts',
    description: 'Create responsive grid layouts that adapt perfectly to any screen size or device.',
  },
  {
    icon: <CodeIcon size={24} />,
    title: 'React Components',
    description: 'Access a library of pre-built React components designed specifically for Home Assistant.',
  },
  {
    icon: <PaletteIcon size={24} />,
    title: 'Custom Styling',
    description: 'Personalize every aspect of your dashboard with advanced styling options.',
  },
  {
    icon: <GaugeIcon size={24} />,
    title: 'Real-time Updates',
    description: 'See live data from your Home Assistant instance with automatic refreshing.',
  },
  {
    icon: <CloudIcon size={24} />,
    title: 'Cloud Sync',
    description: 'Save and access your dashboard designs from anywhere with secure cloud storage.',
  },
];

export const FeaturesSection = () => {
  return (
    <FeaturesContainer id='features'>
      <BackgroundBlur1 />
      <BackgroundBlur2 />
      <Container>
        <HeaderSection>
          <MainHeading>
            Powerful Features for <FeatureText primary='Smart Home' /> Enthusiasts
          </MainHeading>
          <SubHeading>
            Gives you everything you need to create the perfect dashboard for controlling your Home Assistant devices.
          </SubHeading>
        </HeaderSection>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <Fab icon={feature.icon} aria-label={feature.title} variant='secondary' />
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Container>
    </FeaturesContainer>
  );
};
