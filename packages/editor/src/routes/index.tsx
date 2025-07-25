import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@features/home/Header';
import { HeroSection } from '@features/home/HeroSection';
import { FeaturesSection } from '@features/home/Features';
import { DemoSection } from '@features/home/DemoSection';
import { CTASection } from '@features/home/CTASection';
import { Footer } from '@features/home/Footer';
import { BenefitsSection } from '@features/home/BenefitsSection';

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
