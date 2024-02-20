import { mockBountyRoles } from '__test__/__mockData__/bounty';
import { useEffect } from 'react';
import { useStores } from 'store';

export const useMockBountyRoleData = ({ enabled }: { enabled: boolean }) => {
  const { main } = useStores();
  useEffect(() => {
    if (enabled) {
      main.setBountyRoles(mockBountyRoles);
    }
  }, [main, enabled]);
};
