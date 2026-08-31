import React, { useEffect, useMemo, useState } from 'react';
import './WorkspacePage.css';
import { seedTasks, columns } from '../data/initialTasks';
import { DEFAULT_PROJECT_ID, seedProjects } from '../data/initialProjects';
import { getMyTasksCount, getRecentActivity } from '../data/workspaceSummary';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/workspace/Sidebar';
import Topbar from '../components/workspace/Topbar';
import BoardHeader from '../components/workspace/BoardHeader';
import BoardFilters from '../components/workspace/BoardFilters';
import BoardColumn from '../components/workspace/BoardColumn';
import TaskModal from '../components/workspace/TaskModal';
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
    canCreateTask,
    canMoveTask,
    canInvite,
    isViewer,
    isOwner,
    isAdmin,
  } = useAuth();

  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem('flowboard-projects');
      return savedProjects ? JSON.parse(savedProjects) : seedProjects;
    } catch {
      return seedProjects;
    }
  });
  const [activeProjectId, setActiveProjectId] = useState(() =>
    localStorage.getItem('flowboard-active-project') || DEFAULT_PROJECT_ID
  );

  // 2. Task State with localStorage persistence
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('flowboard-tasks');
      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : seedTasks;
      return parsedTasks.map((task) => {
        const seedTask = seedTasks.find(({ id }) => id === task.id);
        return {
          ...task,
          projectId: task.projectId || DEFAULT_PROJECT_ID,
          dueDate: task.dueDate || seedTask?.dueDate || '',
        };
      });
    } catch {
      return seedTasks;
    }
  });

  // 3. Filter & UI States
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [projectView, setProjectView] = useState('board');
  const [files, setFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('flowboard-files')) || [];
    } catch {
      return [];
    }
  });

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('flowboard-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('flowboard-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('flowboard-active-project', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    try {
      localStorage.setItem('flowboard-files', JSON.stringify(files));
    } catch {
      // File-size validation keeps this unlikely; retain in-memory files if storage is full.
    }
  }, [files]);

  const activeProject =
    projects.find((project) => project.id === activeProjectId) || projects[0];
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === activeProject?.id),
    [tasks, activeProject?.id]
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
  const handleCreateTask = (event) => {
    event.preventDefault();
    if (!canCreateTask) return;

    const form = new FormData(event.currentTarget);
    const nextNumber =
      Math.max(...tasks.map((task) => Number(task.id.split('-')[1]) || 0), 0) + 1;
    const nextId = `FLW-${String(nextNumber).padStart(2, '0')}`;

    const newTask = {
      id: nextId,
      title: form.get('title').trim(),
      description: form.get('description').trim(),
      status: form.get('status'),
      priority: form.get('priority'),
      type: form.get('type'),
      assignee: userInitials,
      projectId: activeProject.id,
      dueDate: form.get('dueDate'),
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setShowForm(false);
  };

  const handleUpdateTask = (event) => {
    event.preventDefault();
    if (!canMoveTask || !editingTask) return;

    const form = new FormData(event.currentTarget);
    const updates = {
      title: form.get('title').trim(),
      description: form.get('description').trim(),
      status: form.get('status'),
      priority: form.get('priority'),
      type: form.get('type'),
      dueDate: form.get('dueDate'),
    };

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editingTask.id ? { ...task, ...updates } : task
      )
    );
    setEditingTask(null);
    setShowForm(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (task) => {
    if (!canMoveTask) return;

    const shouldDelete = window.confirm(
      `Delete “${task.title}”? This action cannot be undone.`
    );
    if (shouldDelete) {
      setTasks((currentTasks) => currentTasks.filter(({ id }) => id !== task.id));
    }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const closeTaskModal = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleCreateProject = (event) => {
    event.preventDefault();
    if (!isOwner && !isAdmin) return;

    const form = new FormData(event.currentTarget);
    const project = {
      id: `project-${Date.now()}`,
      name: form.get('name').trim(),
      description: form.get('description').trim() || 'A new workspace project.',
      type: form.get('type'),
    };

    setProjects((currentProjects) => [...currentProjects, project]);
    setActiveProjectId(project.id);
    setActiveView('overview');
    setQuery('');
    setPriority('All');
    setShowProjectModal(false);
  };

  const handleProjectChange = (projectId) => {
    setActiveProjectId(projectId);
    setQuery('');
    setPriority('All');
    setProjectView('board');
  };

  const handleUploadFiles = async (selectedFiles) => {
    const uploadedFiles = await Promise.all(selectedFiles.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: `file-${Date.now()}-${file.name}`,
        projectId: activeProject.id,
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
        createdAt: new Date().toISOString(),
      });
      reader.readAsDataURL(file);
    })));
    setFiles((currentFiles) => [...uploadedFiles, ...currentFiles]);
  };

  const handleDeleteFile = (file) => {
    if (window.confirm(`Delete “${file.name}”?`)) {
      setFiles((currentFiles) => currentFiles.filter(({ id }) => id !== file.id));
    }
  };

  // Handler: Move a task to a different status column
  const handleMoveTask = (id, newStatus) => {
    if (!canMoveTask) return;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

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
              />

              {projectView !== 'files' && <BoardFilters
                  query={query}
                  setQuery={setQuery}
                  priority={priority}
                  setPriority={setPriority}
                  taskCount={visibleTasks.length}
                />}

              {projectView === 'board' && <section className="board-grid" aria-label="Project board">
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
              </section>}

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
          task={editingTask}
          onClose={closeTaskModal}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
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
