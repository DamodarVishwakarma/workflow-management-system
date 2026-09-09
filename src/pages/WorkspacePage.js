import { useMemo, useState } from 'react';
import './WorkspacePage.css';
import { columns } from '../data/initialTasks';
import { getMyTasksCount, getRecentActivity } from '../data/workspaceSummary';
import { useAuth } from '../context/AuthContext';
import {
  useCreateProjectMutation,
  useCreateTaskMutation,
  useDeleteProjectMutation,
  useDeleteFileMutation,
  useDeleteTaskMutation,
  useGetFilesQuery,
  useGetProjectsQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useUploadFileMutation,
} from '../services/flowboardApi';
import { getApiErrorMessage } from '../utils/apiError';
import Sidebar from '../components/workspace/Sidebar';
import Topbar from '../components/workspace/Topbar';
import BoardHeader from '../components/workspace/BoardHeader';
import BoardFilters from '../components/workspace/BoardFilters';
import BoardColumn from '../components/workspace/BoardColumn';
import TaskModal from '../components/workspace/TaskModal';
import TaskDetailModal from '../components/workspace/TaskDetailModal';
import InviteModal from '../components/workspace/InviteModal';
import MyTasksView from '../components/workspace/MyTasksView';
import ActivityView from '../components/workspace/ActivityView';
import ProjectModal from '../components/workspace/ProjectModal';
import ProjectListView from '../components/workspace/ProjectListView';
import ProjectTimelineView from '../components/workspace/ProjectTimelineView';
import ProjectFilesView from '../components/workspace/ProjectFilesView';

/**
 * 🎓 WorkspacePage Component (Connected with Auth, Roles & Invitations)
 * 
 * Demonstrates:
 * 1. Role-Based Access Control (RBAC): Checking permissions (`canCreateTask`, `canMoveTask`, `canInvite`, `isViewer`).
 * 2. Inviting team members via InviteModal.
 * 3. Personalizing UI based on active user (`currentUser.initials`).
 * 4. State management for tasks with localStorage sync.
 */
function WorkspacePage() {
  // 1. Consume Authentication & Authorization details from AuthContext
  const {
    currentUser,
    users,
    canCreateTask,
    canMoveTask,
    canInvite,
    isViewer,
    isOwner,
    isAdmin,
  } = useAuth();

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
  const [activeProjectId, setActiveProjectId] = useState(() => localStorage.getItem('flowboard-active-project'));
  const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0];
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useGetTasksQuery(
    { projectId: activeProject?.id },
    { skip: !activeProject?.id }
  );
  const { data: files = [], isLoading: filesLoading, error: filesError } = useGetFilesQuery(
    activeProject?.id,
    { skip: !activeProject?.id }
  );
  const [createProjectRequest] = useCreateProjectMutation();
  const [deleteProjectRequest] = useDeleteProjectMutation();
  const [createTaskRequest] = useCreateTaskMutation();
  const [updateTaskRequest] = useUpdateTaskMutation();
  const [deleteTaskRequest] = useDeleteTaskMutation();
  const [uploadFileRequest] = useUploadFileMutation();
  const [deleteFileRequest] = useDeleteFileMutation();

  // 3. Filter & UI States
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [projectView, setProjectView] = useState('board');
  const [requestError, setRequestError] = useState('');
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === activeProject?.id),
    [tasks, activeProject?.id]
  );

  // Keeps the detail modal in sync with the live task data as it changes.
  const activeViewingTask = useMemo(
    () => (viewingTask ? tasks.find((task) => task.id === viewingTask.id) || viewingTask : null),
    [tasks, viewingTask]
  );

  // Filtered tasks calculation
  const visibleTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      const matchesSearch = `${task.title} ${task.id}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesPriority = priority === 'All' || task.priority === priority;
      return matchesSearch && matchesPriority;
    });
  }, [projectTasks, query, priority]);

  // Count active tasks assigned specifically to the logged-in user.
  // useMemo keeps this calculation fast and easy to read.
  const userInitials = currentUser?.initials || 'AM';
  const activeUserTasksCount = useMemo(
    () => getMyTasksCount(projectTasks, userInitials),
    [projectTasks, userInitials]
  );

  const recentActivity = useMemo(() => getRecentActivity(projectTasks), [projectTasks]);
  const myTasks = useMemo(
    () => visibleTasks.filter((task) => task.assignee === userInitials),
    [visibleTasks, userInitials]
  );

  // Handler: Add a new task (auto-assigned to current user)
  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!canCreateTask || !activeProject) return;

    const form = new FormData(event.currentTarget);
    setRequestError('');
    try {
      await createTaskRequest({
        projectId: activeProject.id,
      title: form.get('title').trim(),
      description: form.get('description').trim(),
      status: form.get('status'),
      priority: form.get('priority'),
      type: form.get('type'),
      assigneeId: currentUser.id,
      dueDate: form.get('dueDate'),
      }).unwrap();
      setShowForm(false);
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  const handleEditTask = (task) => {
    setViewingTask(task);
  };

  // Applies a single field update (status/assignee/priority/title/description/etc.) from the task detail view.
  const handleUpdateTaskField = async (task, updates) => {
    if (!canMoveTask) return;
    setRequestError('');
    try {
      await updateTaskRequest({ id: task.id, projectId: task.projectId, ...updates }).unwrap();
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  };

  const handleDeleteTask = (task) => {
    if (!canMoveTask) return;

    const shouldDelete = window.confirm(
      `Delete “${task.title}”? This action cannot be undone.`
    );
    if (shouldDelete) {
      setRequestError('');
      deleteTaskRequest({ id: task.id, projectId: task.projectId }).unwrap().catch((error) => {
        setRequestError(getApiErrorMessage(error));
      });
    }
  };

  const handleDeleteTaskFromDetail = async (task) => {
    if (!canMoveTask) return;
    const shouldDelete = window.confirm(
      `Delete “${task.title}”? This action cannot be undone.`
    );
    if (!shouldDelete) return;
    setRequestError('');
    try {
      await deleteTaskRequest({ id: task.id, projectId: task.projectId }).unwrap();
      setViewingTask(null);
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  const openCreateTask = () => {
    setShowForm(true);
  };

  const closeTaskModal = () => {
    setShowForm(false);
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!isOwner && !isAdmin) return;

    const form = new FormData(event.currentTarget);
    setRequestError('');
    try {
      const project = await createProjectRequest({
        name: form.get('name').trim(),
        description: form.get('description').trim() || 'A new workspace project.',
        type: form.get('type'),
      }).unwrap();
      setActiveProjectId(project.id);
      setActiveView('overview');
      setQuery('');
      setPriority('All');
      setShowProjectModal(false);
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  const handleProjectChange = (projectId) => {
    setActiveProjectId(projectId);
    setQuery('');
    setPriority('All');
    setProjectView('board');
  };

  const handleDeleteProject = async () => {
    if ((!isOwner && !isAdmin) || projects.length <= 1) return;
    const shouldDelete = window.confirm(`Delete “${activeProject.name}”? This action cannot be undone.`);
    if (!shouldDelete) return;
    setRequestError('');
    try {
      await deleteProjectRequest(activeProject.id).unwrap();
      setActiveProjectId(null);
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  const handleUploadFiles = async (selectedFiles) => {
    if (!activeProject) return;
    setRequestError('');
    try {
      await Promise.all(selectedFiles.map((file) => uploadFileRequest({ projectId: activeProject.id, file }).unwrap()));
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  const handleDeleteFile = (file) => {
    if (window.confirm(`Delete “${file.name}”?`)) {
      setRequestError('');
      deleteFileRequest({ id: file.id, projectId: file.projectId }).unwrap().catch((error) => {
        setRequestError(getApiErrorMessage(error));
      });
    }
  };

  // Handler: Move a task to a different status column
  const handleMoveTask = async (id, newStatus) => {
    if (!canMoveTask) return;
    const task = tasks.find(({ id: taskId }) => taskId === id);
    if (!task) return;
    setRequestError('');
    try {
      await updateTaskRequest({ id, projectId: task.projectId, status: newStatus }).unwrap();
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  if (projectsLoading) {
    return <div className="workspace-state">Loading your workspace...</div>;
  }

  if (projectsError) {
    return <div className="workspace-state workspace-state-error" role="alert">{getApiErrorMessage(projectsError)}</div>;
  }

  if (!activeProject) {
    return <div className="workspace-state"><h1>No projects yet</h1><p>Create a project to start organizing your team's work.</p></div>;
  }

  return (
    <div className="workspace">
      {/* Sidebar Navigation */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTaskCount={activeUserTasksCount}
        activeView={activeView}
        onViewChange={setActiveView}
        projects={projects}
        activeProjectId={activeProject.id}
        onProjectChange={handleProjectChange}
        onCreateProject={() => setShowProjectModal(true)}
        canCreateProject={isOwner || isAdmin}
      />

      {/* Main Workspace Area */}
      <div className="ws-main">
        {/* Top Navigation Bar */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="workspace-content">
          {requestError && <div className="viewer-banner workspace-request-error" role="alert">{requestError}</div>}
          {tasksError && <div className="viewer-banner workspace-request-error" role="alert">{getApiErrorMessage(tasksError)}</div>}
          {filesError && projectView === 'files' && <div className="viewer-banner workspace-request-error" role="alert">{getApiErrorMessage(filesError)}</div>}
          {tasksLoading && <div className="workspace-state-inline">Loading tasks...</div>}
          {/* Viewer Banner if Read-Only Mode */}
          {isViewer && (
            <div className="viewer-banner">
              <span>
                👁️ <strong>Viewer Mode:</strong> You have read-only access to this board.
              </span>
              <small>Log in as Owner, Admin, or Member to create/move tasks</small>
            </div>
          )}

          {activeView === 'overview' && (
            <>
              <BoardHeader
                onOpenCreateModal={openCreateTask}
                onOpenInviteModal={() => setShowInviteModal(true)}
                canCreateTask={canCreateTask}
                canInvite={canInvite}
                tasks={projectTasks}
                project={activeProject}
                projectView={projectView}
                onProjectViewChange={setProjectView}
                onDeleteProject={handleDeleteProject}
                canDeleteProject={(isOwner || isAdmin) && projects.length > 1}
              />

              {projectView !== 'files' && <BoardFilters
                  query={query}
                  setQuery={setQuery}
                  priority={priority}
                  setPriority={setPriority}
                  taskCount={visibleTasks.length}
                />}

              {projectView === 'board' && (visibleTasks.length ? <section className="board-grid" aria-label="Project board">
                {columns.map((column) => {
                  const columnTasks = visibleTasks.filter(
                    (task) => task.status === column.id
                  );
                  return (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      onMoveTask={handleMoveTask}
                      onOpenCreateModal={openCreateTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      canCreateTask={canCreateTask}
                      canMoveTask={canMoveTask}
                    />
                  );
                })}
              </section> : <div className="project-view-empty"><h2>No tasks found</h2><p>Create a task or adjust your filters to see work on this board.</p></div>)}

              {projectView === 'list' && <ProjectListView
                tasks={visibleTasks}
                onMoveTask={handleMoveTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                canManageTasks={canMoveTask}
              />}

              {projectView === 'timeline' && <ProjectTimelineView tasks={visibleTasks} />}

              {projectView === 'files' && <ProjectFilesView
                files={files.filter((file) => file.projectId === activeProject.id)}
                onUploadFiles={handleUploadFiles}
                onDeleteFile={handleDeleteFile}
                canManageFiles={canCreateTask}
              />}
            </>
          )}

          {activeView === 'my-tasks' && (
            <MyTasksView
              tasks={myTasks}
              userName={currentUser?.name || 'you'}
              onMoveTask={handleMoveTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              canMoveTask={canMoveTask}
            />
          )}

          {activeView === 'activity' && (
            <ActivityView tasks={recentActivity} />
          )}
        </main>
      </div>

      {/* "Create a task" Modal Dialog (Available if permitted) */}
      {showForm && canCreateTask && (
        <TaskModal
          onClose={closeTaskModal}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Jira-style task detail view: editable fields, rich text description & comments */}
      {activeViewingTask && (
        <TaskDetailModal
          task={activeViewingTask}
          users={users}
          currentUser={currentUser}
          canEdit={canMoveTask}
          canDelete={canMoveTask}
          isOwner={isOwner}
          isAdmin={isAdmin}
          onClose={() => setViewingTask(null)}
          onUpdateTask={(updates) => handleUpdateTaskField(activeViewingTask, updates)}
          onDeleteTask={() => handleDeleteTaskFromDetail(activeViewingTask)}
        />
      )}

      {/* "Invite Member" Modal Dialog (Available for Owners & Admins) */}
      {showInviteModal && canInvite && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}

      {showProjectModal && (isOwner || isAdmin) && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
}

export default WorkspacePage;
