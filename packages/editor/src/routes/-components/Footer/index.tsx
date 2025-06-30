import styled from '@emotion/styled';
import { GithubIcon, YoutubeIcon } from 'lucide-react';
import { FeatureText } from '../../../lib/components/FeatureText';

// Discord Icon Component - matches Lucide icon style and size
const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.211.375-.446.865-.608 1.25a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.891 19.891 0 0 0 3.677 4.492a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.029.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.029.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.278c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' />
  </svg>
);

const FooterContainer = styled.footer`
  background-color: var(--color-gray-950);
  border-top: 1px solid var(--color-border);
`;

const Container = styled.div`
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: var(--space-4);
  padding-top: var(--space-12);
  padding-bottom: var(--space-12);
`;

const FooterGrid = styled.div`
  display: grid;
  gap: var(--space-8);

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const BrandSection = styled.div``;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
`;

const LogoWrapper = styled.div`
  position: relative;
  font-size: var(--font-size-2xl);
`;

const BrandDescription = styled.p`
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--space-4);
`;

const SocialLink = styled.a`
  color: var(--color-text-muted);
  transition: color var(--transition-normal);

  &:hover {
    color: var(--color-primary-400);
  }
`;

const FooterSection = styled.div``;

const SectionTitle = styled.h3`
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
`;

const LinksList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const LinkItem = styled.li``;

const FooterLink = styled.a`
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-normal);

  &:hover {
    color: var(--color-primary-400);
  }
`;

const FooterBottom = styled.div`
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-disabled);
  font-size: var(--font-size-sm);
`;

export const Footer = () => {
  return (
    <FooterContainer>
      <Container>
        <FooterGrid>
          <BrandSection>
            <LogoContainer>
              <LogoWrapper>
                <FeatureText primary='@HAKIT' secondary='/EDITOR' />
              </LogoWrapper>
            </LogoContainer>
            <BrandDescription>The ultimate drag & drop editor for creating custom Home Assistant dashboards with React.</BrandDescription>
            <SocialLinks>
              <SocialLink href='https://github.com/shannonhochkins/hakit' target='_blank' aria-label='GitHub'>
                <GithubIcon size={20} />
              </SocialLink>
              <SocialLink href='https://www.youtube.com/@ha-component-kit' target='_blank' aria-label='YouTube'>
                <YoutubeIcon size={20} />
              </SocialLink>
              <SocialLink href='https://discord.gg/65UpetST' target='_blank' aria-label='Discord'>
                <DiscordIcon size={20} />
              </SocialLink>
            </SocialLinks>
          </BrandSection>

          <FooterSection>
            <SectionTitle>Product</SectionTitle>
            <LinksList>
              <LinkItem>
                <FooterLink href='#features'>Features</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#pricing'>Pricing</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#templates'>Templates</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#integrations'>Integrations</FooterLink>
              </LinkItem>
            </LinksList>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Resources</SectionTitle>
            <LinksList>
              <LinkItem>
                <FooterLink href='#documentation'>Documentation</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#tutorials'>Tutorials</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#blog'>Blog</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#community'>Community</FooterLink>
              </LinkItem>
            </LinksList>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Company</SectionTitle>
            <LinksList>
              <LinkItem>
                <FooterLink href='#about'>About</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#careers'>Careers</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#contact'>Contact</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href='#privacy'>Privacy Policy</FooterLink>
              </LinkItem>
            </LinksList>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <p>© {new Date().getFullYear()} HA KIT. All rights reserved.</p>
        </FooterBottom>
      </Container>
    </FooterContainer>
  );
};
