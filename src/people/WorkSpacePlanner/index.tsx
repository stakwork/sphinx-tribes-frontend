import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { useBountyCardStore } from 'store/bountyCard';
import { BountyCard } from 'store/interface';
import history from 'config/history';
import { useStores } from '../../store';
import { colors } from '../../config';
import { WorkspacePlannerHeader } from './WorkspacePlannerHeader';
import BountyCardComp from './BountyCard';

const PlannerContainer = styled.div`
  padding: 0;
  height: calc(100vh - 65px);
  background: ${colors.light.grayish.G950};
  overflow-y: auto;
  overflow-x: hidden;
`;

const ContentArea = styled.div`
  width: 90%;
  margin: 20px auto;
  background: white;
  border-radius: 8px;
  text-align: center;
  padding: 20px;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
  background: whote;
  height: calc(100vh - 200px) !important;

  &::-webkit-scrollbar {
    height: 7px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.light.grayish.G900};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.light.grayish.G800};
    border-radius: 4px;
  }
`;

const Column = styled.div`
  flex: 0 0 320px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 500px;
`;

const ColumnHeader = styled.div`
  padding: 1rem;
  background: ${colors.light.grayish.G800};
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid ${colors.light.grayish.G700};
  position: sticky;
  top: 0;
  color: black;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardCount = styled.span`
  font-size: 0.875rem;
  color: ${colors.light.grayish.G400};
`;

const ColumnContent = styled.div`
  padding: 0.5rem;
  overflow-y: scroll;
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

const LoadMoreButton = styled.button`
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ErrorMessage = styled.p`
  color: ${colors.light.red1};
  padding: 1rem;
  text-align: center;
`;

const COLUMN_CONFIGS = [
  { id: 'Todo', title: 'To Do' },
  { id: 'Assigned', title: 'In Progress' },
  { id: 'Review', title: 'In Review' },
  { id: 'Complete', title: 'Complete' },
  { id: 'Paid', title: 'Paid' }
];

const getCardStatus = (card: BountyCard) => {
  if (!card.status) return 'Todo';
  if (card.status === 'Paid') return 'Paid';
  if (card.status === 'Complete') return 'Complete';
  if (card.status === 'Review') return 'Review';
  if (card.status === 'Assigned') return 'Assigned';
  return 'Todo';
};

const WorkspacePlanner = observer(() => {
  const { uuid } = useParams<{ uuid: string }>();
  const { main } = useStores();
  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [filterToggle, setFilterToggle] = useState(false);
  const bountyCardStore = useBountyCardStore(uuid);

  useEffect(() => {
    bountyCardStore.restoreFilterState();
  }, [bountyCardStore, filterToggle]);

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
      <PlannerContainer>
        <LoadingContainer>
          <EuiLoadingSpinner size="xl" />
        </LoadingContainer>
      </PlannerContainer>
    );
  }

  const groupedBounties = bountyCardStore.filteredBountyCards.reduce(
    (acc: { [key: string]: BountyCard[] }, card: BountyCard) => {
      const status = getCardStatus(card);
      if (!acc[status]) acc[status] = [];
      acc[status].push(card);
      return acc;
    },
    {}
  );

  const handleCardClick = (bountyId: string) => {
    bountyCardStore.saveFilterState();
    history.push(`/bounty/${bountyId}`, {
      from: `/workspace/${uuid}/planner`
    });
  };

  return (
    <PlannerContainer>
      <WorkspacePlannerHeader
        workspace_uuid={uuid}
        workspaceData={workspaceData}
        filterToggle={filterToggle}
        setFilterToggle={setFilterToggle}
      />
      <ContentArea>
        <ColumnsContainer>
          {COLUMN_CONFIGS.map(({ id, title }: { id: string; title: string }) => (
            <Column key={id}>
              <ColumnHeader>
                <ColumnTitle>
                  {title}
                  <CardCount>({groupedBounties[id]?.length || 0})</CardCount>
                </ColumnTitle>
              </ColumnHeader>

              <ColumnContent>
                {bountyCardStore.loading ? (
                  <LoadingContainer>
                    <EuiLoadingSpinner size="m" />
                  </LoadingContainer>
                ) : bountyCardStore.error ? (
                  <ErrorMessage>{bountyCardStore.error}</ErrorMessage>
                ) : (
                  groupedBounties[id]?.map((card: BountyCard) => (
                    <BountyCardComp
                      key={card.id}
                      {...card}
                      onclick={() => handleCardClick(card.id)}
                    />
                  ))
                )}
              </ColumnContent>

              {id === 'Todo' &&
                bountyCardStore.pagination.currentPage * bountyCardStore.pagination.pageSize <
                  bountyCardStore.pagination.total && (
                  <LoadMoreButton onClick={() => bountyCardStore.loadNextPage()}>
                    Load More
                  </LoadMoreButton>
                )}
            </Column>
          ))}
        </ColumnsContainer>
      </ContentArea>
    </PlannerContainer>
  );
});

export default WorkspacePlanner;
