import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@features/home/Header';
import { HeroSection } from '@features/home/HeroSection';
import { FeaturesSection } from '@features/home/Features';
import { DemoSection } from '@features/home/DemoSection';
import { CTASection } from '@features/home/CTASection';
import { Footer } from '@features/home/Footer';
import { BenefitsSection } from '@features/home/BenefitsSection';
import { NotFound } from '@features/404';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
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
