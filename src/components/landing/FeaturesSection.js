import React from 'react';
import Icon from '../common/Icon';

/**
 * Features section highlighting the 3 core benefits of FlowBoard.
 */
function FeaturesSection() {
  return (
    <section className="features container" id="features">
      <div className="section-heading">
        <span className="eyebrow">WORK SMARTER</span>
        <h2>
          Clarity for every project.
          <br />
          Momentum for every team.
        </h2>
        <p>Less time managing tools. More time doing work that matters.</p>
      </div>

      <div className="feature-grid">
        <article>
          <span className="feature-icon purple">
            <Icon name="layers" />
          </span>
          <h3>See work clearly</h3>
          <p>
            Turn complex projects into clear, visual boards everyone understands at
            a glance.
          </p>
          <a href="#workflow">
            Explore boards <Icon name="arrow" size={16} />
          </a>
        </article>

        <article>
          <span className="feature-icon blue">
            <Icon name="users" />
          </span>
          <h3>Stay in sync</h3>
          <p>
            Keep priorities, ownership, and progress visible so nothing gets lost in
            the shuffle.
          </p>
          <a href="#workflow">
            Explore teamwork <Icon name="arrow" size={16} />
          </a>
        </article>

        <article>
          <span className="feature-icon green">
            <Icon name="chart" />
          </span>
          <h3>Make progress visible</h3>
          <p>
            Know what is moving, what is blocked, and where your team should focus
            next.
          </p>
          <a href="#workflow">
            Explore insights <Icon name="arrow" size={16} />
          </a>
        </article>
      </div>
    </section>
  );
}

export default FeaturesSection;
