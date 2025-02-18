/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { EuiDraggable } from '@elastic/eui';

import { EuiDroppable } from '@elastic/eui';

import { EuiDragDropContext } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useStores } from 'store';
import { Feature, Workspace } from 'store/interface';
import styled from 'styled-components';
import avatarIcon from '../../public/static/profile_avatar.svg';

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
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f4f4f4;
  }
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

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 15px;
  justify-content: space-between;
  &:hover {
    background-color: #e0e0e0;
  }
  padding-top: 10px;
  padding-bottom: 10px;
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

const WorkspaceSection = styled.div`
  margin-top: 20px;
`;

const WorkspaceHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 15px;
  justify-content: space-between;
  &:hover {
    background-color: #e0e0e0;
  }
  padding-top: 10px;
  padding-bottom: 10px;
`;

const WorkspaceTitle = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px;
  margin-top: 20px;
  border-bottom: 1px solid #e0e0e0;
  ${({ collapsed }) =>
    collapsed &&
    `
    justify-content: center;
    padding: 15px 0;
  `}
`;

const WorkspaceImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  ${({ collapsed }: { collapsed?: boolean }) =>
    collapsed &&
    `
    margin-right: 0;
  `}
`;

const WorkspaceName = styled.span<{ collapsed: boolean }>`
  font-weight: 500;
  display: ${({ collapsed }) => (collapsed ? 'none' : 'inline')};
  font-size: 1.2rem;
`;

interface SidebarComponentProps {
  uuid: string;
}

export default function SidebarComponent({ uuid }: SidebarComponentProps) {
  const { ui, main } = useStores();
  const [activeItem, setActiveItem] = useState('activities');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(true);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUserWorkspaces = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use the current user's ID if selectedPerson is 0
      const userId = ui.selectedPerson !== 0 ? ui.selectedPerson : ui.meInfo?.id;
      if (userId) {
        const workspaces = await main.getUserWorkspaces(userId);
        setWorkspaces(workspaces || []);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, [main, ui.selectedPerson, ui.meInfo?.id]);

  useEffect(() => {
    getUserWorkspaces();
  }, [getUserWorkspaces]);

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleOpenWorkspace = () => {
    history.push(`/workspace/${uuid}`);
  };

  const handleReorderFeatures = async (feat: Feature, priority: number) => {
    await main.addWorkspaceFeature({
      workspace_uuid: feat.workspace_uuid,
      uuid: feat.uuid,
      priority: priority
    });
  };

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await main.getWorkspaceFeatures(uuid || '', {
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
  }, [main, uuid]);

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

  const toggleFeatures = () => {
    setIsFeaturesExpanded(!isFeaturesExpanded);
  };

  const toggleWorkspace = () => {
    setIsWorkspaceExpanded(!isWorkspaceExpanded);
  };

  const handleWorkspaceClick = (uuid: string) => {
    window.location.href = `/workspace/${uuid}/activities`;
  };

  const handleCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
    const event = new CustomEvent('sidebarCollapse', {
      detail: { collapsed }
    });
    window.dispatchEvent(event);
  };

  return (
    <SidebarContainer collapsed={collapsed}>
      <HamburgerButton onClick={() => handleCollapse(!collapsed)}>
        <MaterialIcon icon="menu" style={{ fontSize: 28 }} />
      </HamburgerButton>

      <WorkspaceTitle collapsed={collapsed}>
        {main.workspaces
          .filter((workspace: Workspace) => workspace.uuid === uuid)
          .map((workspace: Workspace) => (
            <React.Fragment key={workspace.id}>
              <WorkspaceImage
                src={workspace.img || avatarIcon}
                alt={workspace.name}
                collapsed={collapsed}
              />
              <WorkspaceName collapsed={collapsed}>{workspace.name}</WorkspaceName>
            </React.Fragment>
          ))}
      </WorkspaceTitle>

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
        <span>Settings</span>
      </NavItem>

      {/* Workspace Section */}
      <WorkspaceSection>
        <WorkspaceHeader onClick={toggleWorkspace}>
          <h6 style={{ display: collapsed ? 'none' : 'block' }}>Workspace</h6>
          <MaterialIcon
            icon={isWorkspaceExpanded ? 'arrow_drop_down' : 'arrow_right'}
            style={{ marginRight: '5px' }}
          />
        </WorkspaceHeader>
        {isWorkspaceExpanded && (
          <div>
            {workspaces.map((workspace) => (
              <NavItem
                key={workspace.uuid}
                onClick={() => handleWorkspaceClick(workspace.uuid)}
                collapsed={collapsed}
              >
                <MaterialIcon icon="folder" />
                <span>{workspace.name}</span>
              </NavItem>
            ))}
          </div>
        )}
      </WorkspaceSection>

      <FeaturesSection>
        <FeatureHeader onClick={toggleFeatures}>
          <h6 style={{ display: collapsed ? 'none' : 'block' }}>Features</h6>
          <MaterialIcon
            icon={isFeaturesExpanded ? 'arrow_drop_down' : 'arrow_right'}
            style={{ marginRight: '5px' }}
          />
        </FeatureHeader>
        {isFeaturesExpanded && (
          <div>
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
                            {!collapsed && (
                              <FeatureData>
                                <h6 style={{ marginLeft: '1rem' }}>{feat.name}</h6>
                              </FeatureData>
                            )}
                          </MissionRowFlex>
                        </NavItem>
                      )}
                    </EuiDraggable>
                  ))}
              </EuiDroppable>
            </EuiDragDropContext>
          </div>
        )}
      </FeaturesSection>
    </SidebarContainer>
  );
}
