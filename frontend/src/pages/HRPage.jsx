import { useEffect } from 'react';
import Navbar from '../components/hrside/Navbar';
import Hero from '../components/hrside/Hero';
import Forms from '../components/hrside/Forms';
import ViewCta from '../components/hrside/ViewCta';
import Footer from '../components/hrside/Footer';

// Based on Figma Hiring Frame layout (222:448)
function HRPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-[#fffef9] font-sans text-stone-800 antialiased">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Forms />
        <ViewCta />
      </main>
      <Footer />
    </div>
  );
}

export default HRPage;
