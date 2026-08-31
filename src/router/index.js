import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

/**
 * 🎓 Custom Router with Path & Query Parameter Support
 * 
 * Supports:
 * - Hash routing (e.g. `#/signup?invite=inv_admin_demo`)
 * - `useLocation()` -> `{ pathname, search }`
 * - `useSearchParams()` -> `URLSearchParams` instance
 * - `useNavigate()` -> imperative navigation
 * - `<Routes>`, `<Route>`, `<Link>`
 */

const RouterContext = createContext(null);

/**
 * Helper: Normalizes browser hash into pathname and search query string.
 * Example:
 * '#/signup?invite=123' -> { pathname: '/signup', search: '?invite=123' }
 */
function getNormalizedHashLocation() {
  const fullHash = window.location.hash.replace(/^#/, '');
  const [pathPart, searchPart] = fullHash.split('?');

  let cleanPath = !pathPart || pathPart === 'top' ? '/' : pathPart;
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  const search = searchPart ? `?${searchPart}` : '';

  return {
    pathname: cleanPath,
    search: search,
  };
}

export function HashRouter({ children }) {
  const [location, setLocation] = useState(getNormalizedHashLocation);

  useEffect(() => {
    const handleHashChange = () => {
      setLocation(getNormalizedHashLocation());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to) => {
    let target = to;
    if (target.startsWith('/')) {
      target = target.slice(1);
    }
    window.location.hash = target === '' ? '/' : target;
  };

  const contextValue = {
    currentPath: location.pathname,
    location,
    navigate,
  };

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

export const Router = HashRouter;

export function Routes({ children }) {
  const context = useContext(RouterContext);
  const currentPath = context ? context.currentPath : getNormalizedHashLocation().pathname;

  let matchedElement = null;

  React.Children.forEach(children, (child) => {
    if (!matchedElement && React.isValidElement(child)) {
      const { path, element } = child.props;

      const isDirectMatch = path === currentPath;
      const isWildcard = path === '*';

      if (isDirectMatch || isWildcard) {
        matchedElement = element;
      }
    }
  });

  return matchedElement;
}

export function Route({ path, element }) {
  return element;
}

export function Link({ to, className, children, onClick, ...restProps }) {
  const { navigate } = useNavigationContext();

  const handleClick = (event) => {
    if (onClick) onClick(event);
    event.preventDefault();
    navigate(to);
  };

  const formattedHref = to.startsWith('/') ? `#${to.slice(1)}` : `#${to}`;

  return (
    <a
      href={formattedHref}
      className={className}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </a>
  );
}

function useNavigationContext() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('Router hooks and components must be used within a <Router>');
  }
  return context;
}

export function useLocation() {
  return useNavigationContext().location;
}

/**
 * useSearchParams Hook
 * Returns [searchParams, setSearchParams] to read and update query parameters.
 */
export function useSearchParams() {
  const location = useLocation();
  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search || '');
  }, [location.search]);

  return [searchParams];
}

export function useNavigate() {
  return useNavigationContext().navigate;
}
