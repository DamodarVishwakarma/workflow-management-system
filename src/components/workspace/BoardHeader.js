import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icon';
import './BoardHeader.css';

/**
 * BoardHeader Component
 * 
 * Displays breadcrumbs, project heading, team avatar stack, and action buttons.
 * 
 * Props:
 * - onOpenCreateModal: Function to open the "Create a task" modal dialog.
 * - onOpenInviteModal: Function to open the "Invite" modal dialog.
 * - canCreateTask: Boolean permission indicating if current user can create tasks.
 * - canInvite: Boolean permission indicating if current user can invite team members.
 */
function BoardHeader({
  onOpenCreateModal,
  onOpenInviteModal,
  canCreateTask = true,
  canInvite = true,
  tasks = [],
  project,
  projectView,
  onProjectViewChange,
}) {
  const { users = [] } = useAuth();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const actionsRef = useRef(null);

  const visibleMembers = users.slice(0, 3);
  const extraMembers = Math.max(users.length - visibleMembers.length, 0);

  useEffect(() => {
    if (!actionsOpen) return undefined;

    const closeActions = (event) => {
      if (event.key === 'Escape') setActionsOpen(false);
      if (event.type === 'mousedown' && !actionsRef.current?.contains(event.target)) {
        setActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeActions);
    document.addEventListener('keydown', closeActions);
    return () => {
      document.removeEventListener('mousedown', closeActions);
      document.removeEventListener('keydown', closeActions);
    };
  }, [actionsOpen]);

  const copyBoardLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  const exportTasks = () => {
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const headings = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Type', 'Assignee'];
    const rows = tasks.map((task) => [
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.type,
      task.assignee,
    ]);
    const csv = [headings, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = downloadUrl;
    const projectSlug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    link.download = `${projectSlug || 'project'}-tasks.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    setActionsOpen(false);
  };

  return (
    <>
      {/* Breadcrumb path */}
      <div className="breadcrumbs">
        <a href="#app">Projects</a>
        <span>/</span>
        <b>{project.name}</b>
      </div>

      {/* Project title and header action buttons */}
      <div className="project-heading">
        <div>
          <div className="title-row">
            <h1>{project.name}</h1>
            <button aria-label="Favorite project">☆</button>
          </div>
          <p>{project.description}</p>
        </div>

        <div className="heading-actions">
          <span className="member-stack">
            {visibleMembers.map((member) => (
              <i
                key={member.id}
                className={`member-avatar ${member.avatarColor || 'purple'}`}
              >
                {member.initials || member.name?.slice(0, 2).toUpperCase()}
              </i>
            ))}
            {extraMembers > 0 && <i className="member-overflow">+{extraMembers}</i>}
          </span>
          {canInvite && (
            <button className="secondary" onClick={onOpenInviteModal}>
              ＋ Invite
            </button>
          )}
          {canCreateTask && (
            <button className="primary" onClick={onOpenCreateModal}>
              ＋ Create task
            </button>
          )}
        </div>
      </div>

      {/* Project View Tabs */}
      <div className="view-tabs">
        <button
          type="button"
          className={projectView === 'board' ? 'active' : ''}
          onClick={() => onProjectViewChange('board')}
        >Board</button>
        <button
          type="button"
          className={projectView === 'list' ? 'active' : ''}
          onClick={() => onProjectViewChange('list')}
        >List</button>
        <button
          type="button"
          className={projectView === 'timeline' ? 'active' : ''}
          onClick={() => onProjectViewChange('timeline')}
        >Timeline</button>
        <button
          type="button"
          className={projectView === 'files' ? 'active' : ''}
          onClick={() => onProjectViewChange('files')}
        >Files</button>
        <div className="board-actions" ref={actionsRef}>
          <button
            type="button"
            className="more board-actions-trigger"
            aria-label="More board actions"
            aria-expanded={actionsOpen}
            onClick={() => setActionsOpen((isOpen) => !isOpen)}
          >
            <Icon name="moreHorizontal" size={22} />
          </button>
          {actionsOpen && (
            <div className="board-actions-menu" role="menu">
              <button type="button" role="menuitem" onClick={copyBoardLink}>
                <Icon name="link" size={16} />
                <span>{linkCopied ? 'Link copied' : 'Copy board link'}</span>
              </button>
              <button type="button" role="menuitem" onClick={exportTasks}>
                <Icon name="download" size={16} />
                <span>Export tasks as CSV</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  window.print();
                }}
              >
                <Icon name="printer" size={16} />
                <span>Print board</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BoardHeader;
