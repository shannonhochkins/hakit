import styled from '@emotion/styled';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';

const CTASectionContainer = styled.section`
  position: relative;
  padding: var(--space-24) 0;
`;

const BackgroundGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--clr-surface-a0), var(--clr-surface-a10));
  z-index: -10;
`;

const BackgroundRadial = styled.div`
  position: absolute;
  top: 10%;
  left: 10%;
  right: 10%;
  bottom: 10%;
  background: radial-gradient(ellipse 80% 80% at center, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%);
  z-index: -10;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
`;

const CTACard = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--clr-surface-a10), var(--clr-surface-a20));
  border-radius: var(--radius-2xl);
  overflow: hidden;
  border: 1px solid var(--clr-surface-a60);
  box-shadow: var(--shadow-2xl);
  position: relative;
`;

const TopBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
`;

const TopRightGlow = styled.div`
  position: absolute;
  top: -96px;
  right: -96px;
  width: 192px;
  height: 192px;
  background-color: rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-full);
  filter: blur(var(--blur-3xl));
`;

const BottomLeftGlow = styled.div`
  position: absolute;
  bottom: -96px;
  left: -96px;
  width: 192px;
  height: 192px;
  background-color: rgba(34, 211, 238, 0.2);
  border-radius: var(--radius-full);
  filter: blur(var(--blur-3xl));
`;

const CTAContent = styled.div`
  padding: var(--space-6) var(--space-6) var(--space-12) var(--space-6);
  text-align: center;

  @media (min-width: 768px) {
    padding: var(--space-12);
  }
`;

const CTAHeading = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-4);

  @media (min-width: 768px) {
    font-size: var(--font-size-4xl);
  }
`;

const CTADescription = styled.p`
  font-size: var(--font-size-xl);
  color: var(--clr-text-a10);
  margin-bottom: var(--space-12);
  max-width: 672px;
  margin-left: auto;
  margin-right: auto;
`;

const PricingGrid = styled.div`
  display: grid;
  gap: var(--space-8);
  margin-bottom: var(--space-12);

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PricingCard = styled.div`
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid var(--clr-surface-a30);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: border-color var(--transition-normal);
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    border-color: rgba(96, 165, 250, 0.3);
  }
`;

const FeaturedCard = styled(PricingCard)`
  background: linear-gradient(to bottom, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.5));
  border-color: rgba(59, 130, 246, 0.3);
  position: relative;
  box-shadow: var(--shadow-xl);
  box-shadow:
    0 20px 25px -5px rgba(59, 130, 246, 0.1),
    0 10px 10px -5px rgba(59, 130, 246, 0.04);
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
`;

const PopularBadgeInner = styled.span`
  background: var(--gradient-primary);
  color: var(--clr-on-surface-a0);
  font-size: var(--font-size-sm);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
`;

const PlanName = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
`;

const PlanPrice = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2);
`;

const PricePeriod = styled.span`
  font-size: var(--font-size-lg);
  color: var(--clr-text-a10);
`;

const PlanDescription = styled.p`
  color: var(--clr-text-a10);
  margin-bottom: var(--space-4);
`;

const FeaturesList = styled.ul`
  font-size: var(--font-size-sm);
  color: var(--clr-text-a10);
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex-grow: 1;
`;

const FeatureItem = styled.li``;

const PlanButton = styled(SecondaryButton)`
  width: 100%;
  margin-top: auto;
`;

const FeaturedPlanButton = styled(PrimaryButton)`
  width: 100%;
  box-shadow: var(--shadow-lg);
  margin-top: auto;

  &:hover {
    box-shadow: var(--shadow-primary-hover);
  }
`;

const FooterLink = styled.div`
  display: flex;
  justify-content: center;
`;

const FooterLinkAnchor = styled.a`
  color: var(--clr-primary-a60);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-normal);

  &:hover {
    color: var(--clr-primary-a70);
  }
`;

export const CTASection = () => {
  return (
    <CTASectionContainer id='pricing'>
      <BackgroundGradient />
      <BackgroundRadial />
      <Container>
        <CTACard>
          <TopBorder />
          <TopRightGlow />
          <BottomLeftGlow />
          <CTAContent>
            <CTAHeading>Ready to Build Your Perfect Dashboard?</CTAHeading>
            <CTADescription>Get started today and transform how you control your smart home. Try it free for 14 days.</CTADescription>

            <PricingGrid>
              <PricingCard>
                <PlanName>Free</PlanName>
                <PlanPrice>$0</PlanPrice>
                <PlanDescription>Basic features for simple dashboards</PlanDescription>
                <FeaturesList>
                  <FeatureItem>5 Dashboard Components</FeatureItem>
                  <FeatureItem>1 Custom Dashboard</FeatureItem>
                  <FeatureItem>Basic Templates</FeatureItem>
                  <FeatureItem>Community Support</FeatureItem>
                </FeaturesList>
                <PlanButton aria-label=''>Start Free</PlanButton>
              </PricingCard>

              <FeaturedCard>
                <PopularBadge>
                  <PopularBadgeInner>Most Popular</PopularBadgeInner>
                </PopularBadge>
                <PlanName>Pro</PlanName>
                <PlanPrice>
                  $9<PricePeriod>/mo</PricePeriod>
                </PlanPrice>
                <PlanDescription>Everything you need for advanced dashboards</PlanDescription>
                <FeaturesList>
                  <FeatureItem>Unlimited Components</FeatureItem>
                  <FeatureItem>5 Custom Dashboards</FeatureItem>
                  <FeatureItem>Pro Templates</FeatureItem>
                  <FeatureItem>Priority Support</FeatureItem>
                  <FeatureItem>Custom Styling</FeatureItem>
                </FeaturesList>
                <FeaturedPlanButton aria-label=''>Start Pro Trial</FeaturedPlanButton>
              </FeaturedCard>

              <PricingCard>
                <PlanName>Enterprise</PlanName>
                <PlanPrice>
                  $29<PricePeriod>/mo</PricePeriod>
                </PlanPrice>
                <PlanDescription>For power users and businesses</PlanDescription>
                <FeaturesList>
                  <FeatureItem>Unlimited Everything</FeatureItem>
                  <FeatureItem>White Labeling</FeatureItem>
                  <FeatureItem>Advanced Integrations</FeatureItem>
                  <FeatureItem>Dedicated Support</FeatureItem>
                  <FeatureItem>API Access</FeatureItem>
                </FeaturesList>
                <PlanButton aria-label=''>Contact Sales</PlanButton>
              </PricingCard>
            </PricingGrid>

            <FooterLink>
              <FooterLinkAnchor href='#pricing-details'>View full pricing details</FooterLinkAnchor>
            </FooterLink>
          </CTAContent>
        </CTACard>
      </Container>
    </CTASectionContainer>
  );
};
