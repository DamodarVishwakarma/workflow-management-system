import React from 'react';
import Logo from '../common/Logo';

/**
 * Footer component for the landing page.
 */
function Footer() {
  return (
    <footer id="about">
      <div className="container">
        <Logo />
        <p>Designed for teams who value clarity.</p>
        <span>© 2026 FlowBoard</span>
      </div>
    </footer>
  );
}

export default Footer;
