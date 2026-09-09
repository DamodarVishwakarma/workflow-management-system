import React from 'react';
import Icon from '../common/Icon';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

/**
 * Preview Task Card component used inside the Hero demo board.
 */
function PreviewTaskCard({ tag, title, person, color, id, done }) {
  return (
    <article className={`task-card${done ? ' done' : ''}`}>
      <div className="task-top">
        <span className={`tag ${color}`}>{tag}</span>
        <button aria-label={`Options for ${title}`}>•••</button>
      </div>
      <h4>{title}</h4>
      <div className="task-foot">
        <small>FLW-{id}</small>
        <span className={`avatar ${color}`}>{person}</span>
      </div>
    </article>
  );
}

/**
 * Preview Column wrapper used inside the Hero demo board.
 */
function PreviewColumn({ title, color, children }) {
  return (
    <div className="board-column">
      <div className="column-title">
        <span>
          <i className={color} />
          {title}
        </span>
        <b>{React.Children.count(children)}</b>
      </div>
      {children}
    </div>
  );
}

/**
 * Hero section of the landing page.
 * Displays heading, call-to-actions, and an interactive workflow board preview.
 */
function HeroSection() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? '#app' : '#signup';

  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="announcement">
          <span>New</span> Your team's work, beautifully organized{' '}
          <Icon name="arrow" size={14} />
        </div>

        <h1 id="hero-title">
          Move work forward.
          <br />
          <em>Together.</em>
        </h1>

        <p>
          Plan projects, organize tasks, and keep your whole team aligned—from the
          first idea to the final delivery.
        </p>

        <div className="hero-actions">
          <a className="button" href={ctaHref}>
            Start organizing free <Icon name="arrow" size={18} />
          </a>
          <a className="watch" href="#preview">
            <span>▶</span> See how it works
          </a>
        </div>

        <div className="proof">
          <span className="people">
            <i>AM</i>
            <i>KS</i>
            <i>JR</i>
          </span>
          <span>Built for focused, high-performing teams</span>
        </div>
      </div>

      {/* Interactive UI Mockup Preview Stage */}
      <div className="product-stage" id="preview" aria-label="FlowBoard product preview">
        <div className="orb one" />
        <div className="orb two" />

        <div className="app-window">
          {/* Mini Mock Sidebar */}
          <aside>
            <span className="mini-mark">
              <Logo />
            </span>
            <button className="active">⌂</button>
            <button>▦</button>
            <button>⌁</button>
            <span className="spacer" />
            <span className="avatar purple">AM</span>
          </aside>

          {/* Mini Mock Board */}
          <div className="board">
            <div className="board-head">
              <div>
                <small>Product development</small>
                <h3>Website redesign</h3>
              </div>
              <div>
                <span className="people">
                  <i>AM</i>
                  <i>KS</i>
                  <i>JR</i>
                </span>
                <button>Share</button>
              </div>
            </div>

            <div className="progress">
              <span>
                <b>8</b> tasks completed
              </span>
              <div>
                <i />
              </div>
              <strong>64%</strong>
            </div>

            <div className="columns">
              <PreviewColumn title="TO DO" color="gray">
                <PreviewTaskCard
                  tag="Design"
                  title="Create new landing page"
                  person="AM"
                  color="purple"
                  id="24"
                />
                <PreviewTaskCard
                  tag="Research"
                  title="Review user feedback"
                  person="KS"
                  color="blue"
                  id="19"
                />
              </PreviewColumn>

              <PreviewColumn title="IN PROGRESS" color="blue">
                <PreviewTaskCard
                  tag="Development"
                  title="Build responsive navigation"
                  person="JR"
                  color="green"
                  id="31"
                />
                <PreviewTaskCard
                  tag="Content"
                  title="Write onboarding copy"
                  person="AM"
                  color="orange"
                  id="27"
                />
              </PreviewColumn>

              <PreviewColumn title="DONE" color="green">
                <PreviewTaskCard
                  tag="Planning"
                  title="Define project scope"
                  person="KS"
                  color="blue"
                  id="08"
                  done
                />
                <PreviewTaskCard
                  tag="Design"
                  title="Create visual direction"
                  person="AM"
                  color="purple"
                  id="12"
                  done
                />
              </PreviewColumn>
            </div>
          </div>
        </div>

        {/* Floating Toast Notification */}
        <div className="toast">
          <span>
            <Icon name="check" size={15} />
          </span>
          <div>
            <strong>Task completed</strong>
            <small>Create visual direction</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
