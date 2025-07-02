import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import { useParams, useHistory } from 'react-router-dom';
import { featuresWorkspaceStore } from 'store/features_workspace';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Feature, FeatureStatus, FeatureTabLabels, TAB_TO_STATUS_MAP } from 'store/interface';
import SidebarComponent from 'components/common/SidebarComponent';
import { toCapitalize } from 'helpers/helpers-extended';
import { DropResult } from 'react-beautiful-dnd';
import { useStores } from 'store';
import { userHasRole } from 'helpers';
import { RestrictedAccess } from 'components/common/RestrictedAccess';
import { Body } from 'pages/tickets/style';
import { EuiLoadingSpinner } from '@elastic/eui';
import ActivitiesHeader from '../HiveFeaturesView/header';
import { FullNoBudgetWrap, FullNoBudgetText } from '../style';
import TabBar from './TabBar';

const MainContainer = styled.div`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  overflow: hidden;
`;

const BacklogContainer = styled.div<{ collapsed: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  padding: 2rem;
  padding-bottom: 0 !important;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-bottom: 50px;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const FeatureHeadNameWrap = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding-bottom: 10px !important;
  gap: 0.8rem;
  padding: 2rem;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 16%;
  overflow: visible;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  height: 48px;
  background: #f8f9fa;
  border-bottom: 2px solid #ddd;
  font-weight: 500;
`;

const HeaderCell = styled.div`
  &:nth-child(1) {
    width: 100px;
    min-width: 100px;
  }

  &:nth-child(2) {
    width: 350px;
    min-width: 350px;
  }

  &:nth-child(3) {
    flex: 1;
  }

  &:nth-child(4) {
    width: 200px;
    min-width: 200px;
    position: relative;
    text-align: right;
  }
`;

const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const Cell = styled.div<{ collapsed?: boolean }>`
  padding: 8px 0;

  &:nth-child(1) {
    width: 100px;
    min-width: 100px;
  }

  &:nth-child(2) {
    width: 350px;
    min-width: 350px;
  }

  &:nth-child(3) {
    flex: 1;
    padding-right: 16px;
  }

  &:nth-child(4) {
    width: 200px;
    min-width: 200px;
    text-align: right;
  }
`;

const DraggableItem = styled.div`
  &.dragging {
    background: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    opacity: 0.9;
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #9aa0a6;
  display: flex;
  align-items: center;
  padding: 4px;
  margin-right: 8px;

  &:hover {
    background: #f1f3f4;
    border-radius: 4px;
  }
`;

const StatusSelect = styled.select`
  padding: 8px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #202124;
  font-size: 14px;
  width: 130px;
  cursor: pointer;
  float: right;

  &:hover {
    border-color: #bdc1c6;
  }

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const HeaderStatusSelect = styled(StatusSelect)`
  position: static;
  background: transparent;
  border: 1px solid lightgray;
  color: black;
  font-weight: 600;
  width: 130px;
  float: right;
  z-index: 1;

  &:hover {
    background: #f1f3f4;
  }
`;

const PriorityCell = styled.div`
  display: flex;
  align-items: center;
`;

const FeatureCell = styled.div`
  font-size: 14px;
  color: #202124;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #1a73e8;
  }
`;

const BriefCell = styled.div<{ empty: boolean }>`
  font-size: 14px;
  color: ${(props: { empty: boolean }) => (props.empty ? '#9AA0A6' : '#202124')};
  font-style: ${(props: { empty: boolean }) => (props.empty ? 'italic' : 'normal')};
  height: 80px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoFeaturesMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 16px;
  color: #69707d;
  background: white;
  border-radius: 0 0 8px 8px;
`;

const NewFeatureRow = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  gap: 12px;
`;

const NewFeatureInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
  max-width: 330px;
  min-width: 330px;
  height: 44px;
  margin-left: 35px;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const NewBriefInput = styled.input<{ collapsed: boolean }>`
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
  width: ${({ collapsed }: any) => (collapsed ? '940px' : '740px')};
  min-width: ${({ collapsed }: any) => (collapsed ? '940px' : '740px')};
  height: 44px;
  margin-left: 10px;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const CreateButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 40px;
  font-size: 14px;
  margin-left: 17px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props: { disabled: boolean }) => (props.disabled ? '#dadce0' : '#1557b0')};
  }

  &:disabled {
    background: #dadce0;
    cursor: not-allowed;
  }
`;

const NewLabel = styled.span`
  display: flex;
  align-items: center;
  padding-right: 8px;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Barlow';
  color: #202124;
  margin-left: 10px;
`;

const FeatureBacklogView = observer(() => {
  const params = useParams<{ workspace_uuid?: string }>();
  const workspaceUuid = params.workspace_uuid ?? '';
  const history = useHistory();
  const { main, ui } = useStores();
  const [collapsed, setCollapsed] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureBrief, setNewFeatureBrief] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<FeatureTabLabels>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('tab') as FeatureTabLabels) || 'focus';
  });

  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const editWorkspaceDisabled = React.useMemo(() => {
    if (!ui.meInfo) return true;
    if (!workspaceData?.owner_pubkey) return false;

    const isWorkspaceAdmin = workspaceData.owner_pubkey === ui.meInfo.owner_pubkey;
    return (
      !isWorkspaceAdmin &&
      !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION') &&
      !userHasRole(main.bountyRoles, userRoles, 'ADD USER') &&
      !userHasRole(main.bountyRoles, userRoles, 'VIEW REPORT')
    );
  }, [workspaceData, ui.meInfo, userRoles, main.bountyRoles]);

  const getWorkspaceData = React.useCallback(async () => {
    if (!workspaceUuid) return;
    try {
      const data = await main.getUserWorkspaceByUuid(workspaceUuid);
      setWorkspaceData(data);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    }
  }, [workspaceUuid, main]);

  const getUserRoles = React.useCallback(async () => {
    if (!workspaceUuid || !ui.meInfo?.owner_pubkey) {
      setPermissionsChecked(true);
      return;
    }

    try {
      const roles = await main.getUserRoles(workspaceUuid, ui.meInfo.owner_pubkey);
      setUserRoles(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setPermissionsChecked(true);
    }
  }, [workspaceUuid, ui.meInfo?.owner_pubkey, main]);

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
    const loadData = async () => {
      setLoading(true);
      await getWorkspaceData();
      await getUserRoles();

      if (!editWorkspaceDisabled) {
        await featuresWorkspaceStore.fetchFeatures(workspaceUuid, {});
        const workspaceFeatures = featuresWorkspaceStore.getWorkspaceFeatures(workspaceUuid);
        setFeatures(workspaceFeatures);
      }

      setLoading(false);
    };

    loadData();
  }, [workspaceUuid, getWorkspaceData, getUserRoles, editWorkspaceDisabled]);

  const handleStatusChange = async (feature: Feature, newStatus: FeatureStatus) => {
    await featuresWorkspaceStore.updateFeatureStatus(feature.uuid, newStatus);

    const workspaceFeatures = featuresWorkspaceStore.getWorkspaceFeatures(workspaceUuid);
    setFeatures(workspaceFeatures);
  };

  const filteredFeatures = features.filter((feature: Feature) => {
    if (statusFilter === 'all') return true;
    return feature.feat_status === statusFilter;
  });

  const handleReorderFeatures = async (feat: Feature, priority: number) => {
    await featuresWorkspaceStore.updateFeaturePriority(feat.uuid, priority);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (source && destination && source.index !== destination.index) {
      const updatedFeatures = [...features];

      const [movedItem] = updatedFeatures.splice(source.index, 1);
      const dropItem = features[destination.index];

      if (destination.index !== updatedFeatures.length) {
        updatedFeatures.splice(destination.index, 0, movedItem);
      } else {
        updatedFeatures[source.index] = dropItem;
        updatedFeatures.splice(updatedFeatures.length, 1, movedItem);
      }

      setFeatures(updatedFeatures);

      const dragIndex = updatedFeatures.findIndex((feat: Feature) => feat.uuid === movedItem.uuid);
      const dropIndex = updatedFeatures.findIndex((feat: Feature) => feat.uuid === dropItem.uuid);

      handleReorderFeatures(movedItem, dragIndex + 1);
      handleReorderFeatures(dropItem, dropIndex + 1);
    }
  };

  const handleCreateFeature = async () => {
    if (newFeatureTitle.trim().length < 2) return;

    setIsCreating(true);
    try {
      const newFeature = await featuresWorkspaceStore.createFeature({
        workspace_uuid: workspaceUuid,
        name: newFeatureTitle.trim(),
        brief: newFeatureBrief.trim(),
        priority: features.length + 1
      });

      if (newFeature) {
        setNewFeatureTitle('');
        setNewFeatureBrief('');

        const workspaceFeatures = featuresWorkspaceStore.getWorkspaceFeatures(workspaceUuid);
        setFeatures(workspaceFeatures);
      }
    } catch (error) {
      console.error('Failed to create feature:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFeatureClick = (featureUuid: string) => {
    history.push(`/workspace/${workspaceUuid}/feature/${featureUuid}`);
  };

  const handleTabChange = (tab: FeatureTabLabels) => {
    setActiveTab(tab);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('tab', tab);
    history.push({
      pathname: window.location.pathname,
      search: searchParams.toString()
    });

    setStatusFilter(TAB_TO_STATUS_MAP[tab]);
  };

  const showNewFeatureRow = activeTab === 'focus' || activeTab === 'all';

  if (loading || !permissionsChecked) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  if (editWorkspaceDisabled) {
    return (
      <RestrictedAccess isRestricted={true} variant="full" context="page" />
    );
  }

  return (
    <MainContainer>
      <SidebarComponent uuid={workspaceUuid} />
      <ActivitiesHeader uuid={workspaceUuid} collapsed={collapsed} />
      <FeatureHeadNameWrap collapsed={collapsed}>
        <MaterialIcon
          onClick={() => history.goBack()}
          icon="arrow_back"
          style={{ fontSize: 25, cursor: 'pointer' }}
        />
        <Title>Feature Backlog</Title>
      </FeatureHeadNameWrap>
      <BacklogContainer collapsed={collapsed}>
        <TableContainer>
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

          <HeaderRow>
            <HeaderCell>Priority</HeaderCell>
            <HeaderCell>Feature</HeaderCell>
            <HeaderCell>Brief</HeaderCell>
            <HeaderCell>
              <HeaderStatusSelect
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">Status</option>
                {Object.values(FeatureStatus).map((status) => (
                  <option key={status} value={status}>
                    {toCapitalize(status)}
                  </option>
                ))}
              </HeaderStatusSelect>
            </HeaderCell>
          </HeaderRow>

          {filteredFeatures.length === 0 && (
            <NoFeaturesMessage>
              No features found for the selected status:{' '}
              {statusFilter === 'all' ? 'all statuses' : statusFilter}
            </NoFeaturesMessage>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="FEATURES_LIST">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredFeatures.length > 0 &&
                    filteredFeatures.map((feature: Feature, index: number) => (
                      <Draggable
                        key={feature.uuid}
                        draggableId={feature.uuid}
                        index={index}
                        isDragDisabled={activeTab !== 'all'}
                      >
                        {(provided, snapshot) => (
                          <DraggableItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? 'dragging' : ''}
                          >
                            <FeatureRow>
                              <Cell>
                                <PriorityCell>
                                  {activeTab === 'all' && (
                                    <DragHandle {...provided.dragHandleProps}>
                                      <MaterialIcon
                                        icon="drag_indicator"
                                        style={{ fontSize: '20px' }}
                                      />
                                    </DragHandle>
                                  )}
                                  {index + 1}
                                </PriorityCell>
                              </Cell>
                              <Cell>
                                <FeatureCell onClick={() => handleFeatureClick(feature.uuid)}>
                                  {feature.name}
                                </FeatureCell>
                              </Cell>
                              <Cell>
                                <BriefCell empty={!feature.brief}>
                                  {feature.brief || 'No brief yet'}
                                </BriefCell>
                              </Cell>
                              <Cell>
                                <StatusSelect
                                  value={feature.feat_status}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    handleStatusChange(feature, e.target.value as FeatureStatus)
                                  }
                                >
                                  {Object.values(FeatureStatus).map((status) => (
                                    <option key={status} value={status}>
                                      {toCapitalize(status)}
                                    </option>
                                  ))}
                                </StatusSelect>
                              </Cell>
                            </FeatureRow>
                          </DraggableItem>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {showNewFeatureRow && (
            <NewFeatureRow>
              <NewLabel>New</NewLabel>
              <NewFeatureInput
                placeholder="Enter Title"
                value={newFeatureTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewFeatureTitle(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && newFeatureTitle.trim().length >= 2 && !isCreating) {
                    e.preventDefault();
                    handleCreateFeature();
                  }
                }}
              />
              <NewBriefInput
                placeholder="Enter Brief"
                value={newFeatureBrief}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewFeatureBrief(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && newFeatureTitle.trim().length >= 2 && !isCreating) {
                    e.preventDefault();
                    handleCreateFeature();
                  }
                }}
                collapsed={collapsed}
              />
              <CreateButton
                disabled={newFeatureTitle.trim().length < 2 || isCreating}
                onClick={handleCreateFeature}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </CreateButton>
            </NewFeatureRow>
          )}
        </TableContainer>
      </BacklogContainer>
    </MainContainer>
  );
});

export default FeatureBacklogView;
