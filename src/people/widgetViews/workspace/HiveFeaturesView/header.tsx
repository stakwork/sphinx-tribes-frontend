/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import addBounty from 'pages/tickets/workspace/workspaceHeader/Icons/addBounty.svg';
import { useHistory } from 'react-router-dom';

const HeaderContainer = styled.header`
  background: #1a1b23;
  color: white;
`;

const SubHeader = styled.div`
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const BountiesHeader = styled.div<{ collapsed: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: auto;
  margin: 0;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const PostBountyButton = styled.button`
  background: #22c55e;
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

  &:hover {
    background: #16a34a;
  }
`;

export default function ActivitiesHeader({
  uuid,
  collapsed
}: {
  uuid: string;
  collapsed: boolean;
}) {
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

  const DraftTicketButton = styled.button`
    background: #4285f4;
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

    &:hover {
      background: #2c76f1;
    }
  `;

  const WorkspacePlannerButton = styled.button`
    background: #4285f4;
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

    &:hover {
      background: #2c76f1;
    }
  `;

  const history = useHistory();

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

  useEffect(() => {
    getUserWorkspaces();
  }, [getUserWorkspaces]);

  useEffect(() => {
    console.log('workspaces', main.workspaces);
  }, [main]);

  return (
    <HeaderContainer data-testid="activities-header-component">
      <SubHeader>
        <BountiesHeader collapsed={collapsed}>
          <ButtonGroup>
            {canPostBounty && (
              <PostBountyButton onClick={handlePostBountyClick}>
                <img src={addBounty} alt="Add Bounty" />
                Post a Bounty
              </PostBountyButton>
            )}
            <DraftTicketButton onClick={handleDraftTicket}>Draft a Ticket</DraftTicketButton>
            <WorkspacePlannerButton onClick={handleWorkspacePlanner}>
              Track your work
            </WorkspacePlannerButton>
          </ButtonGroup>
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
