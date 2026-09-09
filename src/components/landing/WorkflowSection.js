
/**
 * 3-step workflow section showing how teams use FlowBoard.
 */
function WorkflowSection() {
  return (
    <section className="workflow" id="workflow">
      <div className="container workflow-inner">
        <div>
          <span className="eyebrow">A BETTER WAY TO WORK</span>
          <h2>
            From idea to done,
            <br />
            without the chaos.
          </h2>
        </div>

        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Capture the work</h3>
              <p>Add tasks, priorities, owners, and the context your team needs.</p>
            </div>
          </li>

          <li>
            <span>02</span>
            <div>
              <h3>Move together</h3>
              <p>Track work through a simple, shared workflow.</p>
            </div>
          </li>

          <li>
            <span>03</span>
            <div>
              <h3>Deliver with confidence</h3>
              <p>See progress clearly and keep every commitment on track.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}

export default WorkflowSection;
