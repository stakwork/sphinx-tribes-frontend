import React, { useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import addBounty from 'pages/tickets/workspace/workspaceHeader/Icons/addBounty.svg';

const HeaderContainer = styled.header`
  background: #1a1b23;
  color: white;
`;

const SubHeader = styled.div`
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const BountiesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const BountiesInfo = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1b23;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 0.875rem;
  }
`;

const PostBountyButton = styled.button`
  background: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: #16a34a;
  }
`;

export default function ActivitiesHeader() {
  const { main, ui } = useStores();
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [canPostBounty, setCanPostBounty] = useState(false);

  React.useEffect(() => {
    const checkUserPermissions = async () => {
      const isLoggedIn = !!ui.meInfo;
      const hasPermission = isLoggedIn;
      setCanPostBounty(hasPermission);
    };

    if (ui.meInfo) {
      checkUserPermissions();
    }
  }, [ui.meInfo, main]);

  const handlePostBountyClick = () => {
    if (canPostBounty) {
      setIsPostBountyModalOpen(true);
    }
  };

  return (
    <HeaderContainer>
      <SubHeader>
        <BountiesHeader>
          <BountiesInfo>
            <h1>Bounties Platform</h1>
            <p>
              Building the modern marketplace for work. Complete a bounty and get paid in Bitcoin
              instantly! 💰
            </p>
          </BountiesInfo>

          {canPostBounty && (
            <PostBountyButton onClick={handlePostBountyClick}>
              {' '}
              <img src={addBounty} alt="Add Bounty" />
              Post a Bounty
            </PostBountyButton>
          )}
        </BountiesHeader>
      </SubHeader>
      <PostModal
        isOpen={isPostBountyModalOpen}
        onClose={() => setIsPostBountyModalOpen(false)}
        widget="bounties"
      />
    </HeaderContainer>
  );
}
