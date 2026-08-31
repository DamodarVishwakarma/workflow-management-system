import React, { useEffect, useMemo, useState } from 'react';
import '../workspace.css';
import { seedTasks, columns } from '../data/initialTasks';
import { getMyTasksCount, getRecentActivity } from '../data/workspaceSummary';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/workspace/Sidebar';
import Topbar from '../components/workspace/Topbar';
import BoardHeader from '../components/workspace/BoardHeader';
import BoardFilters from '../components/workspace/BoardFilters';
import KanbanColumn from '../components/workspace/KanbanColumn';
import TaskModal from '../components/workspace/TaskModal';
import InviteModal from '../components/workspace/InviteModal';

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
  } = useAuth();

  // 2. Task State with localStorage persistence
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('flowboard-tasks');
      return savedTasks ? JSON.parse(savedTasks) : seedTasks;
    } catch {
      return seedTasks;
    }
  });

  // 3. Filter & UI States
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('flowboard-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filtered tasks calculation
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = `${task.title} ${task.id}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesPriority = priority === 'All' || task.priority === priority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, query, priority]);

  // Count active tasks assigned specifically to the logged-in user.
  // useMemo keeps this calculation fast and easy to read.
  const userInitials = currentUser?.initials || 'AM';
  const activeUserTasksCount = useMemo(
    () => getMyTasksCount(tasks, userInitials),
    [tasks, userInitials]
  );

  const recentActivity = useMemo(() => getRecentActivity(tasks), [tasks]);

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
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setShowForm(false);
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
      />

      {/* Main Workspace Area */}
      <div className="ws-main">
        {/* Top Navigation Bar */}
        <Topbar
          query={query}
          setQuery={setQuery}
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

          {/* Breadcrumbs & Project Heading */}
          <BoardHeader
            onOpenCreateModal={() => setShowForm(true)}
            onOpenInviteModal={() => setShowInviteModal(true)}
            canCreateTask={canCreateTask}
            canInvite={canInvite}
          />

          {/* Search & Filter Toolbar */}
          <BoardFilters
            query={query}
            setQuery={setQuery}
            priority={priority}
            setPriority={setPriority}
            taskCount={visibleTasks.length}
          />

          {/* Kanban Columns Grid */}
          <section className="kanban" aria-label="Project board">
            {columns.map((column) => {
              const columnTasks = visibleTasks.filter(
                (task) => task.status === column.id
              );
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onMoveTask={handleMoveTask}
                  onOpenCreateModal={() => setShowForm(true)}
                  canCreateTask={canCreateTask}
                  canMoveTask={canMoveTask}
                />
              );
            })}
          </section>
        </main>
      </div>

      {/* "Create a task" Modal Dialog (Available if permitted) */}
      {showForm && canCreateTask && (
        <TaskModal
          onClose={() => setShowForm(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* "Invite Member" Modal Dialog (Available for Owners & Admins) */}
      {showInviteModal && canInvite && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

export default WorkspacePage;
