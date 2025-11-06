import styled from '@emotion/styled';
import { FeatureText } from '@components/FeatureText';
import { PlayIcon } from 'lucide-react';

const DemoSectionContainer = styled.section`
  position: relative;
  padding: var(--space-24) 0;
  background: linear-gradient(to bottom, var(--clr-surface-a0), var(--clr-surface-a10));
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent);
`;

const Container = styled.div`
  max-width: 1200px;
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
  color: var(--clr-text-a10);
  max-width: 768px;
  margin: 0 auto;
`;

const VideoContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
`;

const VideoBorderGradient = styled.div`
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, var(--clr-primary-a50), var(--clr-surface-a40));
  border-radius: var(--radius-2xl);
  filter: blur(var(--blur-sm));
  opacity: 0.5;
`;

const VideoWrapper = styled.div`
  position: relative;
  background-color: var(--clr-surface-a10);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--clr-surface-a60);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  aspect-ratio: 16 / 9;
`;

const VideoOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayButton = styled.button`
  background-color: rgba(59, 130, 246, 0.9);
  color: var(--clr-on-surface-a0);
  border: none;
  border-radius: var(--radius-full);
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    background-color: var(--clr-primary-a40);
    transform: scale(1.1);
  }
`;

const PlayIconWrapper = styled.div`
  transition: transform var(--transition-normal);

  ${PlayButton}:hover & {
    transform: scale(1.1);
  }
`;

const VideoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
`;

const StatsGrid = styled.div`
  margin-top: var(--space-16);
  display: grid;
  gap: var(--space-8);
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(31, 41, 55, 0.3);
  border: 1px solid var(--clr-surface-a60);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--clr-primary-a60);
  margin-bottom: var(--space-2);
`;

const StatLabel = styled.p`
  color: var(--clr-text-a10);
  margin: 0;
`;

export const DemoSection = () => {
  return (
    <DemoSectionContainer id='demo'>
      <BackgroundOverlay />
      <Container>
        <HeaderSection>
          <MainHeading>
            See <FeatureText primary='@HAKIT' secondary='/EDITOR' /> in Action
          </MainHeading>
          <SubHeading>Watch how easy it is to build beautiful, functional dashboards for your Home Assistant setup.</SubHeading>
        </HeaderSection>

        <VideoContainer>
          <VideoBorderGradient />
          <VideoWrapper>
            <VideoOverlay>
              <PlayButton>
                <PlayIconWrapper>
                  <PlayIcon size={36} />
                </PlayIconWrapper>
              </PlayButton>
            </VideoOverlay>
            <VideoImage
              src='https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80'
              alt='HA KIT Demo Video Thumbnail'
            />
          </VideoWrapper>
        </VideoContainer>

        <StatsGrid>
          <StatCard>
            <StatNumber>100+</StatNumber>
            <StatLabel>Custom Components</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>10,000+</StatNumber>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>5★</StatNumber>
            <StatLabel>Average Rating</StatLabel>
          </StatCard>
        </StatsGrid>
      </Container>
    </DemoSectionContainer>
  );
};
