import React from 'react';

/**
 * BoardFilters Component
 * 
 * Provides local search and priority filter controls for the workflow board.
 * 
 * Props:
 * - query: Search string input.
 * - setQuery: Setter function for query.
 * - priority: Current priority filter ('All', 'High', 'Medium', 'Low').
 * - setPriority: Setter function for priority.
 * - taskCount: Total number of tasks matching the current filters.
 */
function BoardFilters({ query, setQuery, priority, setPriority, taskCount }) {
  const handleClearFilters = () => {
    setQuery('');
    setPriority('All');
  };

  return (
    <div className="board-tools">
      {/* Board search field */}
      <div className="local-search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this board"
          aria-label="Search this board"
        />
      </div>

      {/* Priority filter dropdown */}
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        aria-label="Filter by priority"
      >
        <option>All</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>

      {/* Button to reset filters */}
      <button onClick={handleClearFilters}>Clear filters</button>

      {/* Filtered task count counter */}
      <span className="task-total">{taskCount} tasks</span>
    </div>
  );
}

export default BoardFilters;
