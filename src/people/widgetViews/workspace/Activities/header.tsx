import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import MaterialIcon from '@material/react-material-icon';
import { useStores } from '../../../../store';
import { Workspace } from '../../../../store/interface.ts';

const HeaderContainer = styled.header`
  background: #1a1b23;
  color: white;
`;

const SubHeader = styled.div`
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const BountiesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 0 0 20%;
`;

const BountiesInfo = styled.div`
  display: flex;
  gap: 10px;
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

const DropdownMenu = styled.div`
  position: relative;
  margin-top: 8px;
  display: inline-block;
`;

const DropdownContent = styled.div<{ open: boolean }>`
  display: ${(props: any) => (props.open ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  color: #1e1f25;
  min-width: 200px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;

  a {
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    color: #1a1b23;

    &:hover {
      background-color: #f1f1f1;
    }
  }
`;

export default function ActivitiesHeader({ uuid }: { uuid: string }) {
  const history = useHistory();
  const { main, ui } = useStores();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleWorkspacePlanner = () => {
    history.push(`/workspace/${uuid}/planner`);
  };

  const handleDraftTicket = () => {
    history.push(`/workspace/${uuid}/ticket`);
  };

  const handleWorkspaceClick = (uuid: string) => {
    history.push(`/workspace/${uuid}/activities`);
    setDropdownOpen(false);
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
    <HeaderContainer>
      <SubHeader>
        <BountiesHeader>
          <BountiesInfo>
            <h1>Bounties</h1>
            <DropdownMenu>
              <MaterialIcon
                icon={'more_horiz'}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="MaterialIcon"
                style={{ cursor: 'pointer', color: 'black' }}
              />
              <DropdownContent open={dropdownOpen}>
                {main.workspaces.map((workspace: Workspace) => (
                  <a key={workspace.id} onClick={() => handleWorkspaceClick(workspace.uuid)}>
                    {workspace.name}
                  </a>
                ))}
              </DropdownContent>
            </DropdownMenu>
          </BountiesInfo>

          <ButtonGroup>
            <PostBountyButton>Post a Bounty</PostBountyButton>
            <DraftTicketButton onClick={handleDraftTicket}>Draft a Ticket</DraftTicketButton>
            <WorkspacePlannerButton onClick={handleWorkspacePlanner}>
              Track your work
            </WorkspacePlannerButton>
          </ButtonGroup>
        </BountiesHeader>
      </SubHeader>
    </HeaderContainer>
  );
}
