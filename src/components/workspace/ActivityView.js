import { columns } from '../../data/initialTasks';
import { useAuth } from '../../context/AuthContext';
import { resolveAssignee } from '../../data/userProfiles';
import './WorkspaceViews.css';

function ActivityView({ tasks }) {
  const { users = [] } = useAuth();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const completion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const statusLabels = Object.fromEntries(columns.map((column) => [column.id, column.label]));

  return (
    <section className="workspace-view" aria-labelledby="activity-title">
      <header className="workspace-view-header">
        <div>
          <span className="workspace-view-eyebrow">Project insights</span>
          <h1 id="activity-title">Activity</h1>
          <p>Track recent work and see how the project is moving forward.</p>
        </div>
      </header>

      <div className="activity-progress-card">
        <div className="activity-progress-heading">
          <div>
            <span>Overall progress</span>
            <strong>{completion}% complete</strong>
          </div>
          <span>{completedTasks} of {totalTasks} tasks completed</span>
        </div>
        <progress
          className="activity-progress-track"
          aria-label="Project completion"
          max="100"
          value={completion}
        >
          {completion}%
        </progress>
        <div className="activity-status-summary">
          {columns.map((column) => {
            const count = tasks.filter((task) => task.status === column.id).length;
            return (
              <div key={column.id}>
                <i className={`activity-status-dot ${column.id}`} />
                <span>{column.label}</span>
                <strong>{count}</strong>
              </div>
            );
          })}
        </div>
      </div>

      <div className="activity-feed-card">
        <div className="activity-feed-heading">
          <h2>Recent task activity</h2>
          <span>{tasks.length} updates</span>
        </div>
        <div className="activity-feed">
          {tasks.map((task) => {
            const assignee = resolveAssignee(users, task.assignee);

            return (
              <article className="activity-feed-item" key={task.id}>
                <span
                  className={`ws-avatar activity-assignee-avatar ${assignee.avatarColor}`}
                  title={assignee.name}
                  aria-label={`Assigned to ${assignee.name}`}
                >
                  {assignee.initials}
                </span>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.id} · Assigned to {assignee.name}</p>
                </div>
                <span className={`activity-status-badge ${task.status}`}>
                  {statusLabels[task.status] || task.status}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ActivityView;
