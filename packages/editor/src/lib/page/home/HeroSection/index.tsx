import { MousePointerClickIcon, LayoutGridIcon, PuzzleIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/page/shared/Button/Primary';
import { SecondaryButton } from '@lib/page/shared/Button/Secondary';
import { FeatureText } from '@lib/page/shared/FeatureText';

const HeroSectionContainer = styled.section`
  position: relative;
  overflow: hidden;
  padding-top: var(--space-20);
  padding-bottom: var(--space-32);
`;

const BackgroundAura = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 80%;
  aspect-ratio: 1 / 1;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  filter: blur(var(--blur-3xl));
  z-index: -10;
`;

const Container = styled.div`
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const LeftContent = styled.div`
  text-align: center;
  
  @media (min-width: 1024px) {
    width: 50%;
    text-align: left;
  }
`;

const Title = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-6);
  
  @media (min-width: 768px) {
    font-size: var(--font-size-5xl);
  }
  
  @media (min-width: 1024px) {
    font-size: var(--font-size-6xl);
  }
`;

const Description = styled.p`
  font-size: var(--font-size-xl);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
  
  @media (min-width: 1024px) {
    margin-left: 0;
    margin-right: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  justify-content: center;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
  
  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`;

const FeatureList = styled.div`
  margin-top: var(--space-8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  
  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const FeatureIcon = styled.div`
  color: var(--color-primary-400);
`;

const RightContent = styled.div`
  position: relative;
  
  @media (min-width: 1024px) {
    width: 50%;
  }
`;

const ImageContainer = styled.div`
  position: relative;
`;

const ImageGradientBorder = styled.div`
  position: absolute;
  inset: -2px;
  background: var(--gradient-primary);
  border-radius: var(--radius-2xl);
  filter: blur(var(--blur-sm));
  opacity: 0.5;
`;

const ImageWrapper = styled.div`
  position: relative;
  background-color: var(--color-surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
`;

const DashboardImage = styled.img`
  width: 100%;
  height: auto;
`;

const BottomRightGlow = styled.div`
  position: absolute;
  bottom: -1.5rem;
  right: -1.5rem;
  width: var(--space-24);
  height: var(--space-24);
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  filter: blur(var(--blur-2xl));
  z-index: -10;
`;

const TopLeftGlow = styled.div`
  position: absolute;
  top: -1.5rem;
  left: -1.5rem;
  width: var(--space-32);
  height: var(--space-32);
  background-color: rgba(34, 211, 238, 0.2);
  border-radius: 50%;
  filter: blur(var(--blur-3xl));
  z-index: -10;
`;

export const HeroSection = () => {
  return (
    <HeroSectionContainer>
      <BackgroundAura />
      <Container>
        <ContentWrapper>
          <LeftContent>
            <Title>
              Build{' '}
              <FeatureText primary="beautiful dashboards" />{' '}
              for Home Assistant
            </Title>
            <Description>
              Powerful drag-and-drop editor that lets you create
              fully customized React dashboards for your smart home - no coding
              required.
            </Description>
            <ButtonGroup>
              <PrimaryButton>
                Get Started Free
              </PrimaryButton>
              <SecondaryButton>
                Watch Demo
              </SecondaryButton>
            </ButtonGroup>
            <FeatureList>
              <FeatureItem>
                <FeatureIcon>
                  <MousePointerClickIcon size={16} />
                </FeatureIcon>
                <span>Drag & Drop</span>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>
                  <LayoutGridIcon size={16} />
                </FeatureIcon>
                <span>Custom Layouts</span>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>
                  <PuzzleIcon size={16} />
                </FeatureIcon>
                <span>React Components</span>
              </FeatureItem>
            </FeatureList>
          </LeftContent>
          <RightContent>
            <ImageContainer>
              <ImageGradientBorder />
              <ImageWrapper>
                <DashboardImage 
                  src="https://images.unsplash.com/photo-1629904853716-f0bc54eea481?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="HA KIT Dashboard Editor" 
                />
              </ImageWrapper>
            </ImageContainer>
            <BottomRightGlow />
            <TopLeftGlow />
          </RightContent>
        </ContentWrapper>
      </Container>
    </HeroSectionContainer>
  );
};