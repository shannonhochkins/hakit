import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@lib/components/Header';
import { HeroSection } from '@client/src/routes/-components/HeroSection';
import { FeaturesSection } from '@client/src/routes/-components/Features';
import { DemoSection } from '@client/src/routes/-components/DemoSection';
import { CTASection } from '@client/src/routes/-components/CTASection';
import { Footer } from '@lib/components/Footer';
import { BenefitsSection } from '@client/src/routes/-components/BenefitsSection';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
