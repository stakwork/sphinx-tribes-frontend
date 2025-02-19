import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { useBountyCardStore } from 'store/bountyCard';
import { BountyCard, BountyCardStatus } from 'store/interface';
import history from 'config/history';
import { autorun } from 'mobx';
import { useStores } from '../../store';
import { colors } from '../../config';
import SidebarComponent from '../../components/common/SidebarComponent';
import { WorkspacePlannerHeader } from './WorkspacePlannerHeader';
import BountyCardComp from './BountyCard';

const PlannerContainer = styled.div<{ collapsed: boolean }>`
  padding: 0;
  height: calc(100vh - 65px);
  background: ${colors.light.grayish.G950};
  overflow-y: auto;
  overflow-x: hidden;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const ContentArea = styled.div`
  width: 90%;
  margin: 20px auto;
  background: white;
  border-radius: 8px;
  text-align: center;
  padding: 20px;
  transition: width 0.3s ease-in-out;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
  background: white;
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

interface ColumnProps {
  hidden?: boolean;
}

const Column = styled.div<ColumnProps>`
  flex: 0 0 320px;
  border-radius: 8px;
  display: ${(props: ColumnProps) => (props.hidden ? 'none' : 'flex')};
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
  { id: 'DRAFT', title: 'Draft' },
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'COMPLETED', title: 'Complete' },
  { id: 'PAID', title: 'Paid' }
];

const getCardStatus = (card: BountyCard) => {
  if (card.status === 'DRAFT') return 'DRAFT';
  if (!card.status) return 'TODO';
  if (card.status === 'PAID') return 'PAID';
  if (card.status === 'COMPLETED') return 'COMPLETED';
  if (card.status === 'IN_REVIEW') return 'IN_REVIEW';
  if (card.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  return 'TODO';
};

const WorkspacePlanner = observer(() => {
  const { uuid } = useParams<{ uuid: string }>();
  const { main } = useStores();
  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [filterToggle, setFilterToggle] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const bountyCardStore = useBountyCardStore(uuid);

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

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

  const handleToggleInverse = () => {
    bountyCardStore.toggleInverseSearch();
  };

  useEffect(() => {
    const disposer = autorun(() => {
      const { loading, error, bountyCards } = bountyCardStore;
      console.log('BountyCardStore the updated:', { loading, error, bountyCards });
    });

    return () => {
      disposer();
    };
  }, [bountyCardStore]);

  if (loading) {
    return (
      <PlannerContainer collapsed={collapsed}>
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

  const handleCardClick = (bountyId: string, status?: BountyCardStatus, ticketGroup?: string) => {
    bountyCardStore.saveFilterState();
    if (status === 'DRAFT' && ticketGroup) {
      const ticketUrl = history.createHref({
        pathname: `/workspace/${uuid}/ticket/${ticketGroup}`,
        state: { from: `/workspace/${uuid}/planner` }
      });
      console.log('Opening ticket URL:', ticketUrl);
      window.open(ticketUrl, '_blank');
    } else {
      window.open(
        history.createHref({
          pathname: `/bounty/${bountyId}`,
          state: { from: `/workspace/${uuid}/planner` }
        }),
        '_blank'
      );
    }
  };

  const shouldShowColumn = (status: BountyCardStatus): boolean => {
    if (bountyCardStore.selectedStatuses.length === 0) {
      return true;
    }
    return bountyCardStore.selectedStatuses.includes(status);
  };

  return (
    <>
      <SidebarComponent uuid={uuid} defaultCollapsed={true} />
      <PlannerContainer collapsed={collapsed}>
        <WorkspacePlannerHeader
          workspace_uuid={uuid}
          workspaceData={workspaceData}
          filterToggle={filterToggle}
          setFilterToggle={setFilterToggle}
          searchText={searchText}
          setSearchText={setSearchText}
          inverseSearch={bountyCardStore.inverseSearch}
          onToggleInverse={handleToggleInverse}
        />
        <ContentArea>
          <ColumnsContainer>
            {COLUMN_CONFIGS.map(({ id, title }: { id: string; title: string }) => (
              <Column key={id} hidden={!shouldShowColumn(id as BountyCardStatus)}>
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
                    groupedBounties[id]
                      ?.filter((card: BountyCard) =>
                        bountyCardStore.inverseSearch
                          ? !card.title.toLowerCase().includes(searchText.toLowerCase())
                          : card.title.toLowerCase().includes(searchText.toLowerCase())
                      )
                      .map((card: BountyCard) => (
                        <BountyCardComp
                          key={card.id}
                          {...card}
                          onclick={() => handleCardClick(card.id, card.status, card.ticket_group)}
                        />
                      ))
                  )}
                </ColumnContent>
              </Column>
            ))}
          </ColumnsContainer>
        </ContentArea>
      </PlannerContainer>
    </>
  );
});

export default WorkspacePlanner;
