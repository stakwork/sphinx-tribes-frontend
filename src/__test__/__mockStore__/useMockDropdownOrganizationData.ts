import { mockOrganizations } from '__test__/__mockData__/organization';
import { useEffect } from 'react';
import { useStores } from 'store';

// This hook will populate the store with mock data for the dropdownOrganizations slice
export const useMockDropdownOrganizationData = ({
  personId,
  enabled
}: {
  personId?: string;
  enabled: boolean;
}) => {
  const { main } = useStores();
  useEffect(() => {
    if (enabled) {
      main.setDropdownOrganizations(mockOrganizations);
    }
  }, [main, personId, enabled]);
};
