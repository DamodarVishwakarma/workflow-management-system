import React from 'react';

/**
 * Reusable FlowBoard brand logo component.
 * Links to the top of the landing page.
 */
function Logo() {
  return (
    <a className="brand" href="#top" aria-label="FlowBoard home">
      <span className="brand-mark">
        <i />
        <i />
        <i />
      </span>
      <span>FlowBoard</span>
    </a>
  );
}

export default Logo;
