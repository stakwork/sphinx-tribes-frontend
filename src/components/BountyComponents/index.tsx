import React from 'react';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { BountySteps } from './BountySteps';
import { FeaturedBounties } from './FeaturedBounties';

export const BountyComponents = () => {
  const { isEnabled: isFeatureBountyEnabled, loading: isFeatureBountyLoading } =
    useFeatureFlag('display_home_featBounty');

  return (
    <React.Fragment data-testid="bounty-components-component">
      <BountySteps />
      {!isFeatureBountyLoading && isFeatureBountyEnabled && <FeaturedBounties />}
    </React.Fragment>
  );
};