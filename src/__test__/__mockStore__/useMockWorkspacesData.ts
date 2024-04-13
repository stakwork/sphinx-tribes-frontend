import { mockWorkspaces } from '__test__/__mockData__/workspace';
import { useEffect } from 'react';
import { useStores } from 'store';

// This hook will populate the store with mock data for the workspace slice
export const useMockWorkspacesData = ({ enabled }: { enabled: boolean }) => {
  const { main } = useStores();
  useEffect(() => {
    if (enabled) {
      main.setWorkspaces(mockWorkspaces);
    }
  }, [main, enabled]);
};
