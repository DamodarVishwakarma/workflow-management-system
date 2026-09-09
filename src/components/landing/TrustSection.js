import Icon from '../common/Icon';

/**
 * Trust and social proof section highlighting key value propositions.
 */
function TrustSection() {
  return (
    <section className="trust">
      <div className="container">
        <p>Everything your team needs to deliver great work</p>
        <div>
          <span>
            <Icon name="check" size={16} /> Simple to set up
          </span>
          <span>
            <Icon name="check" size={16} /> Easy to adopt
          </span>
          <span>
            <Icon name="check" size={16} /> Built to scale
          </span>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
