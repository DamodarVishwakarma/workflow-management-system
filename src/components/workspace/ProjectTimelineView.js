import { useAuth } from '../../context/AuthContext';
import { resolveAssignee } from '../../data/userProfiles';
import './ProjectViews.css';

function ProjectTimelineView({ tasks }) {
  const { users = [] } = useAuth();
  const datedTasks = [...tasks].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));

  return (
    <section className="project-timeline-view" aria-label="Project timeline">
      <div className="project-view-toolbar"><div><strong>Project timeline</strong><span>Tasks ordered by due date</span></div></div>
      {datedTasks.length ? <div className="timeline-list">
        {datedTasks.map((task) => {
          const assignee = resolveAssignee(users, task.assignee);
          return <article className="timeline-item" key={task.id}>
            <div className="timeline-date"><strong>{task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}</strong><span>{task.dueDate ? new Date(`${task.dueDate}T00:00:00`).getFullYear() : 'No date'}</span></div>
            <span className={`timeline-marker ${task.status}`} />
            <div className="timeline-card"><div><span className={`activity-status-badge ${task.status}`}>{task.status === 'progress' ? 'In progress' : task.status === 'done' ? 'Done' : 'To do'}</span><h3>{task.title}</h3><p>{task.description}</p></div><span className={`list-assignee ${assignee.avatarColor}`} title={assignee.name}>{assignee.initials}</span></div>
          </article>;
        })}
      </div> : <div className="project-view-empty"><h2>No timeline items</h2><p>Add tasks with due dates to build the timeline.</p></div>}
    </section>
  );
}

export default ProjectTimelineView;
