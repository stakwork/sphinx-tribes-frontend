import { mockWorkspaces } from '__test__/__mockData__/workspace';
import { useEffect } from 'react';
import { useStores } from 'store';

// This hook will populate the store with mock data for the dropdownWorkspaces slice
export const useMockDropdownWorkspaceData = ({
  personId,
  enabled
}: {
  personId?: string;
  enabled: boolean;
}) => {
  const { main } = useStores();
  useEffect(() => {
    if (enabled) {
      main.setDropdownWorkspaces(mockWorkspaces);
    }
  }, [main, personId, enabled]);
};
