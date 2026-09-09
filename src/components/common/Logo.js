import { Link } from '../../router';

/**
 * Reusable FlowBoard brand logo component.
 * Links to the top of the landing page.
 */
function Logo() {
  return (
    <Link className="brand" to="/" aria-label="FlowBoard home">
      <span className="brand-mark">
        <i />
        <i />
        <i />
      </span>
      <span>FlowBoard</span>
    </Link>
  );
}

export default Logo;
