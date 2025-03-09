/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import addBounty from 'pages/tickets/workspace/workspaceHeader/Icons/addBounty.svg';
import { useHistory } from 'react-router-dom';
import avatarIcon from '../../../../public/static/profile_avatar.svg';
import { useFeatureFlag, useBrowserTabTitle } from '../../../../hooks';

const HeaderContainer = styled.header`
  background: #1a1b23;
  color: white;
`;

const SubHeader = styled.div`
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const BountiesHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const BaseButton = styled.button`
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
`;

const PostBountyButton = styled(BaseButton)`
  background: #22c55e;

  &:hover {
    background: #16a34a;
  }
`;

const WhatYouLikeToBuild = styled(BaseButton)`
  background: #3ad573;

  &:hover {
    background: #44dc7c;
  }
`;

const DraftTicketButton = styled(BaseButton)`
  background: #4285f4;

  &:hover {
    background: #2c76f1;
  }
`;

const WorkspacePlannerButton = styled(BaseButton)`
  background: #4285f4;

  &:hover {
    background: #2c76f1;
  }
`;

const WorkspaceImage = styled.img`
  display: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  ${({ collapsed }: { collapsed?: boolean }) =>
    collapsed &&
    `
   margin-right: 0;
 `}

  @media (max-width: 768px) {
    display: flex;
  }
`;

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu = styled.div<MobileMenuProps>`
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  }
`;

export default function ActivitiesHeader({ uuid }: { uuid: string }) {
  const { main, ui } = useStores();
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [canPostBounty, setCanPostBounty] = useState(false);
  const { isEnabled } = useFeatureFlag('buildtoday');

  const history = useHistory();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const workspace = main.workspaces.find((p) => p.uuid === uuid) ?? null;

  console.log(workspace?.img);

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

  const handleWhatYouWantToBuild = () => {
    history.push(`/hivechat/${uuid}/build`);
  };

  const handleWorkspacePlanner = () => {
    history.push(`/workspace/${uuid}/planner`);
  };

  const handleDraftTicket = () => {
    history.push(`/workspace/${uuid}/ticket`);
  };

  const getUserWorkspaces = useCallback(async () => {
    if (ui.selectedPerson) {
      await main.getUserWorkspaces(ui.selectedPerson);
    }
  }, [main, ui.selectedPerson]);

  useBrowserTabTitle('Activities');

  useEffect(() => {
    getUserWorkspaces();
  }, [getUserWorkspaces]);

  useEffect(() => {
    console.log('workspaces', main.workspaces);
  }, [main]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <HeaderContainer>
      <SubHeader>
        <BountiesHeader>
          <WorkspaceImage
            src={workspace?.img || avatarIcon}
            alt={'workspacename'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          <ButtonGroup>
            {isEnabled && (
              <WhatYouLikeToBuild onClick={handleWhatYouWantToBuild}>
                <span>What would you like to build?</span>
              </WhatYouLikeToBuild>
            )}
            {canPostBounty && (
              <PostBountyButton onClick={handlePostBountyClick}>
                <img src={addBounty} alt="Add Bounty" />
                <span>Post a Bounty</span>
              </PostBountyButton>
            )}
            <DraftTicketButton onClick={handleDraftTicket}>
              <span>Draft a Ticket</span>
            </DraftTicketButton>
            <WorkspacePlannerButton onClick={handleWorkspacePlanner}>
              <span>Track your work</span>
            </WorkspacePlannerButton>
          </ButtonGroup>
        </BountiesHeader>
        <MobileMenu isOpen={isMobileMenuOpen}>
          {isEnabled && (
            <WhatYouLikeToBuild onClick={handleWhatYouWantToBuild}>
              <span>What would you like to build?</span>
            </WhatYouLikeToBuild>
          )}
          {canPostBounty && (
            <PostBountyButton onClick={handlePostBountyClick}>
              <img src={addBounty} alt="Add Bounty" />
              <span>Post a Bounty</span>
            </PostBountyButton>
          )}
          <DraftTicketButton onClick={handleDraftTicket}>
            <span>Draft a Ticket</span>
          </DraftTicketButton>
          <WorkspacePlannerButton onClick={handleWorkspacePlanner}>
            <span>Track your work</span>
          </WorkspacePlannerButton>
        </MobileMenu>
      </SubHeader>
      <PostModal
        isOpen={isPostBountyModalOpen}
        onClose={() => setIsPostBountyModalOpen(false)}
        widget="bounties"
      />
    </HeaderContainer>
  );
}
