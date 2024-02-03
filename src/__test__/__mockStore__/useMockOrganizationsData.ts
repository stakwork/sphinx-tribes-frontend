import { mockOrganizations } from '__test__/__mockData__/organization';
import { useEffect } from 'react';
import { useStores } from 'store';

// This hook will populate the store with mock data for the organization slice
export const useMockOrganizationsData = ({ enabled }: { enabled: boolean }) => {
  const { main } = useStores();
  useEffect(() => {
    if (enabled) {
      main.setOrganizations(mockOrganizations);
    }
  }, [main, enabled]);
};
