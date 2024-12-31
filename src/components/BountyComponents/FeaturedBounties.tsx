import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { colors } from '../../config/colors';
import { bountyStore } from '../../store/bountyStore';

const FeaturedContainer = styled.div`
  margin: 20px 0;
`;

const FeaturedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.light.text1};
    margin: 0;
  }
`;

const BountyCard = styled.div`
  padding: 16px;
  border: 1px solid ${colors.light.grayish.G900};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.light.grayish.G950};
  }
`;

const BountyTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.light.text1};
  margin: 0 0 8px 0;
`;

const BountyMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.light.text2};
  font-size: 14px;
`;

export const FeaturedBounties: React.FC = observer(() => {
  const featuredBounty = bountyStore.getFeaturedBounty();
  return (
    <FeaturedContainer>
      <FeaturedHeader>
        <h2>Featured Bounties</h2>
      </FeaturedHeader>

      {featuredBounty ? (
        <BountyCard onClick={() => (window.location.href = featuredBounty.url)}>
          <BountyTitle>Bounty #{featuredBounty.bountyId}</BountyTitle>
          <BountyMeta>
            <span>View Details</span>
          </BountyMeta>
        </BountyCard>
      ) : (
        <div style={{ color: colors.light.text2, textAlign: 'center', padding: '20px' }}>
          No featured bounties at the moment
        </div>
      )}
    </FeaturedContainer>
  );
});
