import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

/**
 * LandingPage Component
 * 
 * Assembles all individual sections into the complete marketing landing page.
 * Notice how breaking the page into small components makes the entire page
 * readable at a single glance!
 */
function LandingPage() {
  return (
    <div className="site" id="top">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <WorkflowSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
