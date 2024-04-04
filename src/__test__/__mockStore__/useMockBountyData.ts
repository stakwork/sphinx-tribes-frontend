import { bountyResponse } from '__test__/__mockData__/bounty';
import { useEffect } from 'react';
import { useStores } from 'store';
import { transformBountyWithPeopleBounty } from 'store/__tests__/util';

export const useMockBountyData = ({ enabled }: { enabled: boolean }) => {
  const { main } = useStores();
  useEffect(() => {
    if (enabled) {
      // TODO: should write proper types once its when proper are written or people bounty
      main.setPeopleBounties([transformBountyWithPeopleBounty(bountyResponse[0])] as any);
    }
  }, [main, enabled]);
};
