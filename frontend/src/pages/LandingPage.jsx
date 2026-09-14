import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsBar from '../components/landing/StatsBar';
import AboutUs from '../components/landing/AboutUs';
import PainPoints from '../components/landing/PainPoints';
import Steps from '../components/landing/Steps';
import Workflow from '../components/landing/Workflow';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import Support from '../components/landing/Support';
import SupportFaq from '../components/landing/SupportFaq';
import SupportPolicy from '../components/landing/SupportPolicy';
import Footer from '../components/landing/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-stone-800 antialiased">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <AboutUs />
        <PainPoints />
        <Steps />
        <Workflow />
        <FeatureShowcase />
        <Support />
        <SupportFaq />
        <SupportPolicy />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
