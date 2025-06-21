import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@lib/page/shared/Header';
import { HeroSection } from '@lib/page/home/HeroSection';
import { FeaturesSection } from '@lib/page/home/Features';
import { DemoSection } from '@lib/page/home/DemoSection';
import { CTASection } from '@lib/page/home/CTASection';
import { Footer } from '@lib/page/shared/Footer';
import { BenefitsSection } from '@lib/page/home/BenefitsSection';


export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  
  
  return <>
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
 
}
