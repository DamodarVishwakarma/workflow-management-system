import Icon from '../common/Icon';
import { useAuth } from '../../context/AuthContext';

/**
 * Call to Action (CTA) section at the bottom of the landing page.
 * Encourages users to open the workspace app or sign up.
 */
function CtaSection() {
  const { isAuthenticated } = useAuth();
  const targetHref = isAuthenticated ? '#app' : '#signup';

  return (
    <section className="cta container" id="workspace">
      <div>
        <span className="eyebrow">READY WHEN YOU ARE</span>
        <h2>Bring calm to your team's work.</h2>
        <p>Create your first workspace and turn plans into progress.</p>
      </div>

      <a className="button light" href={targetHref}>
        {isAuthenticated ? 'Open your workspace' : 'Create your workspace'}{' '}
        <Icon name="arrow" size={18} />
      </a>
    </section>
  );
}

export default CtaSection;
