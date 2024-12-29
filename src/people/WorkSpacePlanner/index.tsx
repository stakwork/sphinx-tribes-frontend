import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { BountyCard } from 'store/interface';
import history from 'config/history';
import { useStores } from '../../store';
import { colors } from '../../config';
import { useBountyCardStore } from '../../store/bountyCard';
import { useIsMobile } from '../../hooks';
import { WorkspacePlannerHeader } from './WorkspacePlannerHeader';
import BountyCardComp from './BountyCard';

// Add these interfaces at the top of the file
interface MobileProps {
  isMobile: boolean;
}

// Styled Components
const PlannerContainer = styled.div<MobileProps>`
  padding: 0;
  height: ${(props: MobileProps) => (props.isMobile ? 'calc(100% - 105px)' : 'calc(100vh - 65px)')};
  background: ${(props: MobileProps) => (props.isMobile ? 'white' : colors.light.grayish.G950)};
  overflow-y: auto;
  overflow-x: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const BoardContent = styled.div<MobileProps>`
  width: ${(props: MobileProps) => (props.isMobile ? '100%' : '90%')};
  margin: ${(props: MobileProps) => (props.isMobile ? '0' : '20px auto')};
  background: white;
  border-radius: ${(props: MobileProps) => (props.isMobile ? '0' : '8px')};
  text-align: center;
  padding: ${(props: MobileProps) => (props.isMobile ? '10px' : '20px')};
`;

const BoardLayout = styled.div<MobileProps>`
  display: flex;
  flex-direction: ${(props: MobileProps) => (props.isMobile ? 'column' : 'row')};
  gap: 1rem;
  padding: 1rem;
  overflow-x: ${(props: MobileProps) => (props.isMobile ? 'hidden' : 'auto')};
  overflow-y: ${(props: MobileProps) => (props.isMobile ? 'auto' : 'hidden')};
  height: ${(props: MobileProps) => (props.isMobile ? 'auto' : 'calc(100% - 60px)')};
  background: white;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.light.grayish.G900};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.light.grayish.G800};
    border-radius: 4px;
  }
`;

const BoardColumn = styled.div<MobileProps>`
  flex: ${(props: MobileProps) => (props.isMobile ? '1' : '0 0 320px')};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: ${(props: MobileProps) => (props.isMobile ? 'none' : '100%')};
  margin-bottom: ${(props: MobileProps) => (props.isMobile ? '1rem' : '0')};
`;

const BoardColumnHeader = styled.div`
  padding: 1rem;
  background: ${colors.light.grayish.G800};
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid ${colors.light.grayish.G700};
  position: sticky;
  top: 0;
  color: black;
`;

const ColumnHeading = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemCounter = styled.span`
  font-size: 0.875rem;
  color: ${colors.light.grayish.G400};
`;

const BoardColumnContent = styled.div`
  padding: 0.5rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.light.grayish.G900};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.light.grayish.G800};
    border-radius: 3px;
  }
`;

const LoadMoreTrigger = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: ${colors.light.grayish.G800};
  color: white;
  border: none;
  border-top: 1px solid ${colors.light.grayish.G700};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${colors.light.grayish.G700};
  }
`;

const ErrorMessage = styled.p`
  color: ${colors.light.red1};
  padding: 1rem;
  text-align: center;
`;

const BOARD_COLUMNS = [
  { key: 'Todo', label: 'To Do' },
  { key: 'Assigned', label: 'In Progress' },
  { key: 'Complete', label: 'Complete' },
  { key: 'Paid', label: 'Paid' }
] as const;

const WorkspacePlanner: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { main } = useStores();
  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const bountyCardStore = useBountyCardStore(uuid);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!uuid) return;
      const data = await main.getUserWorkspaceByUuid(uuid);
      setWorkspaceData(data);
      bountyCardStore.loadWorkspaceBounties();
      setLoading(false);
    };
    fetchWorkspaceData();
  }, [main, uuid, bountyCardStore]);

  if (loading) {
    return (
      <PlannerContainer isMobile={isMobile}>
        <LoadingContainer>
          <EuiLoadingSpinner size="xl" />
        </LoadingContainer>
      </PlannerContainer>
    );
  }

  const boardSections = {
    Todo: bountyCardStore.todoItems,
    Assigned: bountyCardStore.assignedItems,
    Complete: bountyCardStore.completedItems,
    Paid: bountyCardStore.paidItems
  };

  const navigateToBounty = (bountyId: string): void => {
    history.push(`/bounty/${bountyId}`);
  };

  return (
    <PlannerContainer isMobile={isMobile}>
      <WorkspacePlannerHeader workspace_uuid={uuid} workspaceData={workspaceData} />
      <BoardContent isMobile={isMobile}>
        <h1>Welcome to the new Workspace Planner</h1>
        <BoardLayout isMobile={isMobile}>
          {BOARD_COLUMNS.map(({ key, label }: { key: string; label: string }) => (
            <BoardColumn key={key} isMobile={isMobile}>
              <BoardColumnHeader>
                <ColumnHeading>
                  {label}
                  <ItemCounter>({boardSections[key]?.length || 0})</ItemCounter>
                </ColumnHeading>
              </BoardColumnHeader>

              <BoardColumnContent>
                {bountyCardStore.loading ? (
                  <LoadingContainer>
                    <EuiLoadingSpinner size="m" />
                  </LoadingContainer>
                ) : bountyCardStore.error ? (
                  <ErrorMessage>{bountyCardStore.error}</ErrorMessage>
                ) : (
                  boardSections[key]?.map((bounty: BountyCard) => (
                    <BountyCardComp
                      key={bounty.id}
                      {...bounty}
                      onclick={() => navigateToBounty(bounty.id)}
                    />
                  ))
                )}
              </BoardColumnContent>

              {key === 'Todo' && bountyCardStore.hasMorePages && (
                <LoadMoreTrigger onClick={() => bountyCardStore.loadNextPage()}>
                  Load More
                </LoadMoreTrigger>
              )}
            </BoardColumn>
          ))}
        </BoardLayout>
      </BoardContent>
    </PlannerContainer>
  );
};

export default observer(WorkspacePlanner);
