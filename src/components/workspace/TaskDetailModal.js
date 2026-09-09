import { useEffect, useRef, useState } from 'react';
import { useCreateCommentMutation, useDeleteCommentMutation, useGetCommentsQuery } from '../../services/flowboardApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { renderRichText } from '../../utils/richText';
import Icon from '../common/Icon';
import RichTextEditor from './RichTextEditor';
import './TaskDetailModal.css';

function formatTimestamp(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRelativeTime(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatDateDisplay(value) {
  if (!value) return 'None';
  const date = new Date(`${value}T00:00:00`);
  if (isNaN(date.getTime())) {
    const rawDate = new Date(value);
    if (isNaN(rawDate.getTime())) return 'None';
    return rawDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * TaskDetailModal Component (Authentic Jira Cloud issue view)
 */
function TaskDetailModal({
  task,
  users = [],
  currentUser,
  canEdit,
  canDelete,
  isOwner,
  isAdmin,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');
  const [fieldError, setFieldError] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditingDescription(false);
  }, [task.id, task.title, task.description]);

  const { data: comments = [], isLoading: commentsLoading, error: commentsError } = useGetCommentsQuery(task.id);
  const [createComment, { isLoading: isPostingComment }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const runFieldUpdate = async (updates) => {
    setFieldError('');
    try {
      await onUpdateTask(updates);
    } catch (error) {
      setFieldError(error.message || getApiErrorMessage(error));
    }
  };

  const commitTitle = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setTitle(task.title);
      return;
    }
    runFieldUpdate({ title: trimmed });
  };

  const commitDescription = async () => {
    setIsEditingDescription(false);
    if (description === task.description) return;
    await runFieldUpdate({ description });
  };

  const cancelDescription = () => {
    setDescription(task.description || '');
    setIsEditingDescription(false);
  };

  const handleAddComment = async () => {
    const body = commentDraft.trim();
    if (!body) return;
    setCommentError('');
    try {
      await createComment({ taskId: task.id, body }).unwrap();
      setCommentDraft('');
      setIsCommentActive(false);
    } catch (error) {
      setCommentError(getApiErrorMessage(error));
    }
  };

  const handleDeleteComment = (comment) => {
    if (!window.confirm('Delete this comment?')) return;
    deleteComment({ id: comment.id, taskId: task.id }).unwrap().catch((error) => {
      setCommentError(getApiErrorMessage(error));
    });
  };

  const dateInputRef = useRef(null);

  const assignedUser = users.find((u) => u.id === task.assigneeId || u.name === task.assignee) || {
    name: 'Unassigned',
    initials: '?',
    avatarColor: 'gray',
  };

  const statusLabel = task.status === 'done' ? 'DONE' : task.status === 'progress' ? 'IN PROGRESS' : 'TO DO';
  const statusClass = task.status === 'done' ? 'jira-lozenge-done' : task.status === 'progress' ? 'jira-lozenge-progress' : 'jira-lozenge-todo';

  return (
    <div className="modal-layer" role="presentation" onMouseDown={handleBackdropClick}>
      <section className="jira-modal" role="dialog" aria-modal="true" aria-labelledby="jira-task-title">
        {/* Jira Modal Top Header */}
        <header className="jira-header">
          <div className="jira-breadcrumbs">
            <span className="jira-crumb-project">Projects</span>
            <span className="jira-crumb-sep">/</span>
            <span className="jira-crumb-project">FLW</span>
            <span className="jira-crumb-sep">/</span>
            <span className="jira-crumb-key">{task.id}</span>
          </div>

          <div className="jira-header-actions">
            {canDelete && (
              <button
                type="button"
                className="jira-btn-delete"
                onClick={() => onDeleteTask()}
                title="Delete issue"
              >
                <Icon name="trash" size={14} />
                <span>Delete</span>
              </button>
            )}
            <button
              type="button"
              className="jira-btn-close"
              onClick={onClose}
              aria-label="Close"
              title="Close (Esc)"
            >
              ×
            </button>
          </div>
        </header>

        {/* Jira Modal Body */}
        <div className="jira-body">
          {/* Main Left Content */}
          <div className="jira-main">
            {/* Issue Summary / Title */}
            <input
              id="jira-task-title"
              className="jira-title-input"
              type="text"
              value={title}
              maxLength={80}
              disabled={!canEdit}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={commitTitle}
              placeholder="Add summary..."
              aria-label="Issue summary"
            />

            {/* Description Section */}
            <section className="jira-section">
              <div className="jira-section-header">
                <h3 className="jira-section-title">Description</h3>
                {canEdit && !isEditingDescription && (
                  <button
                    type="button"
                    className="jira-btn-edit"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    <Icon name="edit" size={13} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingDescription ? (
                <div className="jira-editor-container">
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    minRows={5}
                    autoFocus
                    placeholder="Add a description..."
                  />
                  <div className="jira-editor-actions">
                    <button type="button" className="jira-btn-primary" onClick={commitDescription}>
                      Save
                    </button>
                    <button type="button" className="jira-btn-subtle" onClick={cancelDescription}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`jira-desc-view${canEdit ? ' clickable' : ''}`}
                  role={canEdit ? 'button' : undefined}
                  tabIndex={canEdit ? 0 : undefined}
                  onClick={() => canEdit && setIsEditingDescription(true)}
                  onKeyDown={(e) => {
                    if (canEdit && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setIsEditingDescription(true);
                    }
                  }}
                  title={canEdit ? 'Click to edit description' : undefined}
                >
                  {task.description ? (
                    <div
                      className="jira-rich-text"
                      dangerouslySetInnerHTML={{
                        __html: renderRichText(task.description, users),
                      }}
                    />
                  ) : (
                    <p className="jira-placeholder-text">
                      {canEdit ? 'Add a description...' : 'No description provided.'}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Activity Section with Jira Tabs */}
            <section className="jira-section jira-activity-section">
              <h3 className="jira-section-title">Activity</h3>

              <div className="jira-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'comments'}
                  className={`jira-tab${activeTab === 'comments' ? ' active' : ''}`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments {comments.length > 0 && `(${comments.length})`}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'history'}
                  className={`jira-tab${activeTab === 'history' ? ' active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
              </div>

              {activeTab === 'comments' && (
                <div className="jira-comments-tab">
                  {commentsLoading && <p className="jira-hint">Loading comments...</p>}
                  {commentsError && <p className="jira-error">{getApiErrorMessage(commentsError)}</p>}

                  {/* Comment List */}
                  <div className="jira-comment-list">
                    {comments.map((comment) => (
                      <article className="jira-comment-item" key={comment.id}>
                        <div className={`jira-avatar ${comment.authorAvatarColor || 'purple'}`}>
                          {comment.authorInitials}
                        </div>
                        <div className="jira-comment-content-wrap">
                          <div className="jira-comment-meta">
                            <strong className="jira-comment-author">{comment.authorName}</strong>
                            <span className="jira-comment-time">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <div
                            className="jira-comment-body"
                            dangerouslySetInnerHTML={{ __html: renderRichText(comment.body, users) }}
                          />
                          <div className="jira-comment-actions">
                            {(comment.authorId === currentUser?.id || isOwner || isAdmin) && (
                              <button
                                type="button"
                                className="jira-comment-link-action"
                                onClick={() => handleDeleteComment(comment)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}

                    {!commentsLoading && comments.length === 0 && (
                      <p className="jira-empty-hint">There are no comments yet on this issue.</p>
                    )}
                  </div>

                  {/* Jira Comment Composer */}
                  <div className="jira-comment-composer">
                    <div className={`jira-avatar ${currentUser?.avatarColor || 'purple'}`}>
                      {currentUser?.initials || 'U'}
                    </div>

                    {!isCommentActive && !commentDraft.trim() ? (
                      <div
                        className="jira-comment-trigger"
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsCommentActive(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsCommentActive(true);
                          }
                        }}
                      >
                        <span>Add a comment...</span>
                      </div>
                    ) : (
                      <div className="jira-comment-expanded">
                        <RichTextEditor
                          value={commentDraft}
                          onChange={setCommentDraft}
                          minRows={3}
                          autoFocus
                          mentionUsers={users}
                          placeholder="Add a comment... use @ to mention teammates"
                        />
                        <div className="jira-composer-actions">
                          <button
                            type="button"
                            className="jira-btn-primary"
                            disabled={!commentDraft.trim() || isPostingComment}
                            onClick={handleAddComment}
                          >
                            {isPostingComment ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="jira-btn-subtle"
                            onClick={() => {
                              setCommentDraft('');
                              setIsCommentActive(false);
                              setCommentError('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {commentError && <p className="jira-error">{commentError}</p>}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="jira-history-tab">
                  <div className="jira-history-item">
                    <span className="jira-history-dot" />
                    <div>
                      <strong>Issue created</strong>
                      <span>{formatTimestamp(task.createdAt)}</span>
                    </div>
                  </div>
                  {task.updatedAt && (
                    <div className="jira-history-item">
                      <span className="jira-history-dot" />
                      <div>
                        <strong>Last updated</strong>
                        <span>{formatTimestamp(task.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar ("Details" & "Dates" - 100% Exact Alignment) */}
          <aside className="jira-sidebar">
            {/* Prominent Jira Status Dropdown Button */}
            <div className="jira-status-box">
              <div className={`jira-status-btn ${statusClass}`}>
                <span className="jira-status-label">{statusLabel}</span>
                <span className="jira-status-chevron">
                  <Icon name="chevronDown" size={12} />
                </span>
                <select
                  className="jira-hidden-select"
                  value={task.status}
                  disabled={!canEdit}
                  onChange={(e) => runFieldUpdate({ status: e.target.value })}
                  aria-label="Change status"
                >
                  <option value="todo">TO DO</option>
                  <option value="progress">IN PROGRESS</option>
                  <option value="done">DONE</option>
                </select>
              </div>
            </div>

            {/* Details Panel */}
            <div className="jira-panel">
              <h4 className="jira-panel-title">Details</h4>

              <div className="jira-field-list">
                {/* Assignee Field */}
                <div className="jira-field-row">
                  <span className="jira-field-label">Assignee</span>
                  <div className="jira-field-val">
                    <div className="jira-val-pill">
                      <span className="jira-val-icon">
                        <div className={`jira-avatar-sm ${assignedUser.avatarColor || 'purple'}`}>
                          {assignedUser.initials}
                        </div>
                      </span>
                      <span className="jira-val-text">{assignedUser.name}</span>
                      <span className="jira-val-chevron">
                        <Icon name="chevronDown" size={12} />
                      </span>
                      <select
                        className="jira-hidden-select"
                        value={task.assigneeId || ''}
                        disabled={!canEdit}
                        onChange={(e) => runFieldUpdate({ assigneeId: e.target.value })}
                        aria-label="Change assignee"
                      >
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Priority Field */}
                <div className="jira-field-row">
                  <span className="jira-field-label">Priority</span>
                  <div className="jira-field-val">
                    <div className="jira-val-pill">
                      <span className="jira-val-icon">
                        {task.priority === 'High' ? (
                          <span className="jira-priority-badge high"><Icon name="priorityHigh" size={14} /></span>
                        ) : task.priority === 'Low' ? (
                          <span className="jira-priority-badge low"><Icon name="priorityLow" size={14} /></span>
                        ) : (
                          <span className="jira-priority-badge medium"><Icon name="priorityMedium" size={14} /></span>
                        )}
                      </span>
                      <span className="jira-val-text">{task.priority}</span>
                      <span className="jira-val-chevron">
                        <Icon name="chevronDown" size={12} />
                      </span>
                      <select
                        className="jira-hidden-select"
                        value={task.priority}
                        disabled={!canEdit}
                        onChange={(e) => runFieldUpdate({ priority: e.target.value })}
                        aria-label="Change priority"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Type Field */}
                <div className="jira-field-row">
                  <span className="jira-field-label">Type</span>
                  <div className="jira-field-val">
                    <div className="jira-val-pill">
                      <span className="jira-val-icon">
                        <span className="jira-type-badge">
                          <Icon name="taskType" size={15} />
                        </span>
                      </span>
                      <span className="jira-val-text">{task.type}</span>
                      <span className="jira-val-chevron">
                        <Icon name="chevronDown" size={12} />
                      </span>
                      <select
                        className="jira-hidden-select"
                        value={task.type}
                        disabled={!canEdit}
                        onChange={(e) => runFieldUpdate({ type: e.target.value })}
                        aria-label="Change type"
                      >
                        <option>Task</option>
                        <option>Design</option>
                        <option>Development</option>
                        <option>Research</option>
                        <option>Content</option>
                        <option>Planning</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Due Date Field */}
                <div className="jira-field-row">
                  <span className="jira-field-label">Due date</span>
                  <div className="jira-field-val">
                    <div
                      className="jira-val-pill"
                      onClick={() => {
                        if (canEdit && dateInputRef.current) {
                          try {
                            dateInputRef.current.showPicker();
                          } catch {
                            dateInputRef.current.focus();
                          }
                        }
                      }}
                    >
                      <span className="jira-val-icon">
                        <span className="jira-calendar-badge">
                          <Icon name="calendar" size={14} />
                        </span>
                      </span>
                      <span className="jira-val-text">{formatDateDisplay(task.dueDate)}</span>
                      <span className="jira-val-chevron">
                        <Icon name="chevronDown" size={12} />
                      </span>
                      <input
                        ref={dateInputRef}
                        type="date"
                        className="jira-hidden-date-input"
                        value={task.dueDate ? String(task.dueDate).slice(0, 10) : ''}
                        disabled={!canEdit}
                        onChange={(e) => runFieldUpdate({ dueDate: e.target.value })}
                        aria-label="Change due date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jira Dates Panel */}
            <div className="jira-panel jira-dates-panel">
              <h4 className="jira-panel-title">Dates</h4>
              <div className="jira-field-list">
                <div className="jira-field-row">
                  <span className="jira-field-label">Created</span>
                  <div className="jira-field-val">
                    <div className="jira-val-static">
                      <span className="jira-val-icon">
                        <span className="jira-meta-badge">
                          <Icon name="clock" size={14} />
                        </span>
                      </span>
                      <span className="jira-val-text jira-meta-text">{formatTimestamp(task.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="jira-field-row">
                  <span className="jira-field-label">Updated</span>
                  <div className="jira-field-val">
                    <div className="jira-val-static">
                      <span className="jira-val-icon">
                        <span className="jira-meta-badge">
                          <Icon name="history" size={14} />
                        </span>
                      </span>
                      <span className="jira-val-text jira-meta-text">{formatRelativeTime(task.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {fieldError && <p className="jira-error jira-footer-error">{fieldError}</p>}
      </section>
    </div>
  );
}

export default TaskDetailModal;
