import styled from '@emotion/styled';
import { CheckCircleIcon } from 'lucide-react';
import { PrimaryButton } from '@lib/page/shared/Button/Primary';
import { FeatureText } from '@lib/page/shared/FeatureText';

const BenefitsSectionContainer = styled.section`
  position: relative;
  padding: var(--space-24) 0;
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 33.33%;
  left: 0;
  width: 320px;
  height: 320px;
  background-color: var(--color-primary-500);
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

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const ImageSection = styled.div`
  @media (min-width: 1024px) {
    width: 50%;
  }
`;

const ImageContainer = styled.div`
  position: relative;
`;

const ImageGradientBorder = styled.div`
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(34, 211, 238, 0.5));
  border-radius: var(--radius-2xl);
  filter: blur(var(--blur-xl));
  opacity: 0.3;
`;

const ImageWrapper = styled.div`
  position: relative;
  background-color: var(--color-gray-900);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
`;

const BenefitImage = styled.img`
  width: 100%;
  height: auto;
`;

const ContentSection = styled.div`
  @media (min-width: 1024px) {
    width: 50%;
  }
`;

const MainHeading = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-6);
  
  @media (min-width: 768px) {
    font-size: var(--font-size-4xl);
  }
`;

const Description = styled.p`
  font-size: var(--font-size-xl);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
`;

const BenefitsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
`;

const CheckIcon = styled.div`
  color: var(--color-primary-400);
  margin-top: var(--space-1);
  flex-shrink: 0;
`;

const BenefitText = styled.span`
  color: var(--color-text-primary);
`;

const CTASection = styled.div`
  margin-top: var(--space-8);
`;

export const BenefitsSection = () => {
  const benefits = [
    'Create custom dashboards without any coding knowledge',
    'Visualize and control all your smart home devices in one place',
    'Build different layouts for different rooms or purposes',
    'Share your dashboard designs with the community',
    'Access your dashboards from any device',
    'Save time with pre-built templates and components'
  ];

  return (
    <BenefitsSectionContainer id="benefits">
      <BackgroundBlur />
      <Container>
        <ContentWrapper>
          <ImageSection>
            <ImageContainer>
              <ImageGradientBorder />
              <ImageWrapper>
                <BenefitImage 
                  src="https://images.unsplash.com/photo-1585064012619-8b2c7312fe38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Smart home dashboard on tablet" 
                />
              </ImageWrapper>
            </ImageContainer>
          </ImageSection>
          
          <ContentSection>
            <MainHeading>
              Why Choose{' '}
              <FeatureText primary="@HAKIT" secondary="/EDITOR" />
              ?
            </MainHeading>
            <Description>
              Transforms how you interact with Home Assistant, giving you
              the power to create exactly what you need.
            </Description>
            <BenefitsList>
              {benefits.map((benefit, index) => (
                <BenefitItem key={index}>
                  <CheckIcon>
                    <CheckCircleIcon size={20} />
                  </CheckIcon>
                  <BenefitText>{benefit}</BenefitText>
                </BenefitItem>
              ))}
            </BenefitsList>
            <CTASection>
              <PrimaryButton>
                Explore Benefits
              </PrimaryButton>
            </CTASection>
          </ContentSection>
        </ContentWrapper>
      </Container>
    </BenefitsSectionContainer>
  );
};