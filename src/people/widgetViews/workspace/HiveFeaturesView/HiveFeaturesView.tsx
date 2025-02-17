/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import { Feature } from 'store/interface';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { EuiDragDropContext, EuiDraggable, EuiDroppable } from '@elastic/eui';
import {
  QuickBountyTicket,
  quickBountyTicketStore
} from '../../../../store/quickBountyTicketStore.tsx';
import ActivitiesHeader from './header';

const TableContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
`;

const PhaseHeader = styled.h3`
  margin-top: 20px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 10px;
  border-bottom: 2px solid #ddd;
  width: 33.33%;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  width: 33.33%;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #fff;
  background-color: ${({ status }) =>
    status === 'PAID'
      ? 'green'
      : status === 'IN_PROGRESS'
      ? 'gray'
      : status === 'IN_REVIEW'
      ? 'orange'
      : status === 'TODO'
      ? 'blue'
      : status === 'DRAFT'
      ? 'lightgray'
      : 'black'};
`;

export const ActivitiesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 3.5rem;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-bottom: 50px;
  margin-top: 50px;
`;

const MainContainer = styled.div<{ collapsed: boolean }>`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  margin-left: ${({ collapsed }) => (collapsed ? '60px' : '250px')};
  width: ${({ collapsed }) => (collapsed ? 'calc(100% - 60px)' : 'calc(100% - 250px)')};
  overflow: hidden;
`;

const SidebarContainer = styled.div<{ collapsed: boolean }>`
  width: ${({ collapsed }) => (collapsed ? '60px' : '250px')};
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  background: #f4f4f4;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 80px;
  margin-left: 10px;
  z-index: 1000;
`;

const NavItem = styled.div<{ collapsed: boolean; active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? '#e0e0e0' : 'transparent')};
  &:hover {
    background-color: #e0e0e0;
  }
  span {
    margin-left: ${(props) => (props.collapsed ? '0' : '10px')};
    display: ${(props) => (props.collapsed ? 'none' : 'inline')};
  }
`;

const FeaturesSection = styled.div`
  margin-top: 20px;
`;

const FeatureData = styled.div`
  min-width: calc(100% - 7%);
  font-size: 0.6rem;
  font-weight: 400;
  display: flex;
  margin-left: 4%;
  color: #333;
`;

const MissionRowFlex = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  left: 18px;
`;

const HiveFeaturesView = observer(() => {
  const { workspace_uuid, feature_uuid } = useParams<{
    workspace_uuid: string;
    feature_uuid: string;
  }>();
  const { main } = useStores();
  const history = useHistory();
  const [data, setData] = useState<QuickBountyTicket[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('activities');
  const [phaseNames, setPhaseNames] = useState<{ [key: string]: string }>({});

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleOpenWorkspace = () => {
    history.push(`/workspace/${workspace_uuid}`);
  };

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await main.getWorkspaceFeatures(workspace_uuid || '', {
          page: 1,
          status: 'active'
        });
        setFeatures(Array.isArray(response) ? response : response || response || []);
      } catch (error) {
        console.error('Error fetching features:', error);
        setFeatures([]);
      }
    };
    fetchFeatures();
  }, [main, workspace_uuid]);

  const handleReorderFeatures = async (feat: Feature, priority: number) => {
    await main.addWorkspaceFeature({
      workspace_uuid: feat.workspace_uuid,
      uuid: feat.uuid,
      priority: priority
    });
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

  useEffect(() => {
    const fetchData = async () => {
      const response = await quickBountyTicketStore.fetchAndSetQuickData(feature_uuid);
      setData(response || []);
    };
    fetchData();
  }, [feature_uuid]);

  const groupedData = data.reduce<{ [key: string]: QuickBountyTicket[] }>((acc, item) => {
    if (!acc[item.phaseID]) acc[item.phaseID] = [];
    acc[item.phaseID].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const fetchPhaseNames = async () => {
      const names: { [key: string]: string } = {};
      for (const phaseID of Object.keys(groupedData)) {
        const phase = await main.getFeaturePhaseByUUID(feature_uuid, phaseID);
        names[phaseID] = phase?.name || 'Untitled Phase';
      }
      setPhaseNames(names);
    };

    fetchPhaseNames();
  }, [groupedData, feature_uuid, main]);

  const getNavigationURL = (item: QuickBountyTicket) => {
    if (item.bountyTicket === 'bounty') {
      return `/bounty/${item.bountyID}`;
    } else if (item.bountyTicket === 'ticket') {
      return `/workspace/${workspace_uuid}/ticket/${item.ticketUUID}`;
    }
    return '';
  };

  const handleTitleClick = (item: QuickBountyTicket) => {
    const url = getNavigationURL(item);
    if (url !== '') {
      history.push(url);
    }
  };

  return (
    <>
      <SidebarContainer collapsed={collapsed}>
        <HamburgerButton onClick={() => setCollapsed(!collapsed)}>
          <MaterialIcon icon="menu" style={{ fontSize: 28 }} />
        </HamburgerButton>
        <NavItem
          active={activeItem === 'activities'}
          onClick={() => handleItemClick('activities')}
          collapsed={collapsed}
        >
          <MaterialIcon icon="home" />
          <span>Activities</span>
        </NavItem>
        <NavItem onClick={handleOpenWorkspace} collapsed={collapsed}>
          <MaterialIcon icon="settings" />
          <span>Workspace</span>
        </NavItem>
        <FeaturesSection>
          <h6 style={{ display: collapsed ? 'none' : 'block', paddingLeft: '15px' }}>Features</h6>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 150px)' }}>
            <EuiDragDropContext onDragEnd={onDragEnd}>
              <EuiDroppable droppableId="features_droppable_area" spacing="m">
                {features &&
                  features.map((feat: Feature, i: number) => (
                    <EuiDraggable
                      spacing="m"
                      key={feat.id}
                      index={i}
                      draggableId={feat.uuid}
                      customDragHandle
                      hasInteractiveChildren
                    >
                      {(provided: any) => (
                        <NavItem
                          onClick={() => history.push(`/feature/${feat.uuid}`)}
                          key={feat.id}
                          collapsed={collapsed}
                        >
                          <MissionRowFlex>
                            <MaterialIcon
                              icon="menu"
                              color="transparent"
                              className="drag-handle"
                              paddingSize="s"
                              {...provided.dragHandleProps}
                              data-testid={`drag-handle-${feat.priority}`}
                              aria-label="Drag Handle"
                              style={{ fontSize: 20, marginBottom: '6px' }}
                            />
                          </MissionRowFlex>
                          {!collapsed && (
                            <FeatureData>
                              <h6 style={{ marginLeft: '1rem' }}>{feat.name}</h6>
                            </FeatureData>
                          )}
                        </NavItem>
                      )}
                    </EuiDraggable>
                  ))}
              </EuiDroppable>
            </EuiDragDropContext>
          </div>
        </FeaturesSection>
      </SidebarContainer>
      <MainContainer collapsed={collapsed}>
        <ActivitiesHeader uuid={workspace_uuid} />
        <ActivitiesContainer>
          {Object.values(groupedData).length === 0 ? (
            <p>No phases available</p>
          ) : (
            <TableContainer>
              {Object.values(groupedData).map((items, index) => (
                <div key={index}>
                  <PhaseHeader>
                    Phase {index + 1}: {phaseNames[items[0].phaseID] || 'Untitled Phase'}
                  </PhaseHeader>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Name</Th>
                        <Th>Status</Th>
                        <Th>Assigned</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.ID}>
                          <Td onClick={() => handleTitleClick(item)}>{item.Title || 'Unnamed'}</Td>
                          <Td>
                            <StatusBadge status={item.status}>{item.status}</StatusBadge>
                          </Td>
                          <Td>{item.assignedAlias || '...'}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </TableContainer>
          )}
        </ActivitiesContainer>
      </MainContainer>
    </>
  );
});

export default HiveFeaturesView;
