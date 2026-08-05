import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
import ServicesSection from '../components/ServicesSection';
import ProfessionalsSection from '../components/ProfessionalsSection';
import HowItWorks from '../components/HowItWorks';
import CommunitySection from '../components/CommunitySection';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-white text-hc-ink selection:bg-hc-brand/20">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <ServicesSection />
        <ProfessionalsSection />
        <HowItWorks />
        <CommunitySection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
