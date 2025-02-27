import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import { useParams, useHistory } from 'react-router-dom';
import { featuresWorkspaceStore } from 'store/features_workspace';
import { EuiDragDropContext, EuiDraggable, EuiDroppable } from '@elastic/eui';
import { Feature } from 'store/interface';
import SidebarComponent from 'components/common/SidebarComponent';
import ActivitiesHeader from '../HiveFeaturesView/header';

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
  margin-top: 15px;
  margin-bottom: 50px;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const FeatureHeadNameWrap = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 2rem;
  padding-bottom: 0 !important;
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

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: visible;
  border-radius: 8px;
  table-layout: fixed;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
  border-bottom: 1px solid #e0e0e0;
  height: 56px;
`;

const DraggableWrapper = styled.div`
  transform: translate(0, 0) !important;

  &[data-rbd-dragging='true'] {
    display: table-row;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    width: 100%;
    table-layout: fixed;

    pointer-events: none;
    position: relative !important;
    z-index: 1000;
  }
`;

interface TdProps {
  collapsed?: boolean;
}

const Td = styled.td<TdProps>`
  padding: 8px 16px;
  color: #202124;
  font-size: 14px;
  vertical-align: middle;
  border-bottom: 1px solid #e0e0e0;
  background: white;

  &:first-child {
    width: 100px;
    min-width: 100px;
  }

  &:nth-child(2) {
    width: 350px;
    min-width: 350px;
  }

  &:nth-child(3) {
    width: ${({ collapsed }: any) => (collapsed ? '930px' : '730px')};
    min-width: ${({ collapsed }: any) => (collapsed ? '930px' : '730px')};
  }

  &:last-child {
    width: 200px;
    min-width: 200px;
    text-align: right;
    padding-right: 24px;
  }
`;

const Th = styled.th`
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid #ddd;
  background: #f8f9fa;
  height: 48px;

  &:first-child {
    width: 105px;
    min-width: 105px;
  }

  &:nth-child(2) {
    width: 350px;
    min-width: 350px;
  }

  &:nth-child(3) {
    width: calc(100% - 600px);
    min-width: 300px;
  }

  &:last-child {
    width: 200px;
    min-width: 200px;
    position: relative;
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #9aa0a6;
  display: flex;
  align-items: center;
  padding: 4px;

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
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 1px solid lightgray;
  color: black;
  font-weight: 600;
  width: 130px;
  margin-left: 35px;
  z-index: 1;

  &:hover {
    background: #f1f3f4;
  }
`;

const PriorityCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
`;

const FeatureCell = styled.div`
  font-size: 14px;
  color: #202124;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    color: #1a73e8;
  }
`;

interface BriefCellProps {
  empty: boolean;
  collapsed?: boolean;
}

const BriefCell = styled.div<BriefCellProps>`
  font-size: 14px;
  color: ${(props: { empty: boolean }) => (props.empty ? '#9AA0A6' : '#202124')};
  font-style: ${(props: { empty: boolean }) => (props.empty ? 'italic' : 'normal')};
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  min-width: ${({ collapsed }: any) => (collapsed ? '900px' : '700px')};
  max-width: ${({ collapsed }: any) => (collapsed ? '900px' : '700px')};
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
  const [collapsed, setCollapsed] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureBrief, setNewFeatureBrief] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    const loadFeatures = async () => {
      await featuresWorkspaceStore.fetchFeatures(workspaceUuid, {});
      const workspaceFeatures = featuresWorkspaceStore.getWorkspaceFeatures(workspaceUuid);
      setFeatures(workspaceFeatures);
    };
    loadFeatures();
  }, [workspaceUuid]);

  const handleStatusChange = async (feature: Feature, newStatus: string) => {
    if (newStatus === 'archived') {
      await featuresWorkspaceStore.archiveFeature(feature.uuid);
    }

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

  const onDragEnd = ({ source, destination }: any) => {
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
          <Table>
            <thead>
              <tr>
                <Th>Priority</Th>
                <Th>Feature</Th>
                <Th>Brief</Th>
                <Th style={{ position: 'relative' }}>
                  <HeaderStatusSelect
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setStatusFilter(e.target.value)
                    }
                  >
                    <option value="all">Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </HeaderStatusSelect>
                </Th>
              </tr>
            </thead>
            {filteredFeatures.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <NoFeaturesMessage>
                    No features found for the selected status:{' '}
                    {statusFilter === 'all' ? 'all statuses' : statusFilter}
                  </NoFeaturesMessage>
                </td>
              </tr>
            )}
            <EuiDragDropContext
              onDragEnd={onDragEnd}
              dragHandleUsageInstructions="Drag to reorder features"
            >
              <EuiDroppable
                droppableId="FEATURES_LIST"
                spacing="none"
                style={{ transform: 'none !important' }}
              >
                <tbody>
                  {filteredFeatures.length > 0 &&
                    filteredFeatures.map((feature: Feature, index: number) => (
                      <EuiDraggable
                        key={feature.uuid}
                        index={index}
                        draggableId={feature.uuid}
                        customDragHandle={true}
                        hasInteractiveChildren={true}
                      >
                        {(provided: any) => (
                          <DraggableWrapper ref={provided.innerRef} {...provided.draggableProps}>
                            <TableRow>
                              <Td>
                                <PriorityCell>
                                  <DragHandle {...provided.dragHandleProps}>
                                    <MaterialIcon
                                      icon="drag_indicator"
                                      style={{ fontSize: '20px' }}
                                    />
                                  </DragHandle>
                                  {index + 1}
                                </PriorityCell>
                              </Td>
                              <Td>
                                <FeatureCell onClick={() => handleFeatureClick(feature.uuid)}>
                                  {feature.name}
                                </FeatureCell>
                              </Td>
                              <Td collapsed={collapsed}>
                                <BriefCell empty={!feature.brief} collapsed={collapsed}>
                                  {feature.brief || 'No brief yet'}
                                </BriefCell>
                              </Td>
                              <Td collapsed={collapsed}>
                                <StatusSelect
                                  value={feature.feat_status}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    handleStatusChange(feature, e.target.value)
                                  }
                                >
                                  <option value="active">Active</option>
                                  <option value="archived">Archived</option>
                                </StatusSelect>
                              </Td>
                            </TableRow>
                          </DraggableWrapper>
                        )}
                      </EuiDraggable>
                    ))}
                </tbody>
              </EuiDroppable>
            </EuiDragDropContext>
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
          </Table>
        </TableContainer>
      </BacklogContainer>
    </MainContainer>
  );
});

export default FeatureBacklogView;
