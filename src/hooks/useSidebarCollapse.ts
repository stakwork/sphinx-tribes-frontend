import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to track and control sidebar collapse state
 * @param initialState - Optional initial state for the collapse (defaults to false)
 * @returns Object containing current collapse state and toggle function
 */
export const useSidebarCollapse = (
  initialState = false
): {
  collapsed: boolean;
  toggleCollapseSidebar: (state: boolean) => void;
} => {
  const [collapsed, setCollapsed] = useState<boolean>(initialState);

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

  /**
   * Toggles sidebar collapsed state and dispatches a custom event
   * to notify other components of the change
   */
  const toggleCollapseSidebar = useCallback((newState: boolean) => {
    setCollapsed(newState);

    const event = new CustomEvent('sidebarCollapse', {
      detail: { collapsed: newState }
    });

    window.dispatchEvent(event);
  }, []);

  return { collapsed, toggleCollapseSidebar };
};
