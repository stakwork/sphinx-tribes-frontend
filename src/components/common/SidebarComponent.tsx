/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { EuiDraggable } from '@elastic/eui';

import { EuiDroppable } from '@elastic/eui';

import { EuiDragDropContext } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { Modal, useDeleteConfirmationModal } from 'components/common';
import AddFeature from 'people/widgetViews/workspace/AddFeatureModal';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useStores } from 'store';
import { Chat, Feature, Workspace } from 'store/interface';
import styled from 'styled-components';
import { Box } from '@mui/system';
import { EuiLoadingSpinner } from '@elastic/eui';
import {
  EditPopover,
  EditPopoverText,
  EditPopoverContent,
  EditPopoverTail
} from 'pages/tickets/style.ts';
import { colors } from '../../config/colors';
import avatarIcon from '../../public/static/profile_avatar.svg';
import WorkspaceBudget from '../../people/widgetViews/workspace/WorkspaceBudget.tsx';
import { chatService } from '../../services';
import { Toast } from '../../people/widgetViews/workspace/interface.ts';
import { archiveIcon } from './DeleteConfirmationModal/archiveIcon.tsx';

const color = colors['light'];

const IconWrapper = styled.div`
  margin-bottom: 4px;
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
  position: relative;
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
  margin-left: 2%;
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

const WorkspaceDropdown = styled.div<{ collapsed: boolean }>`
  position: relative;
  cursor: pointer;
  margin-left: auto;
  display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};
  z-index: 1001;
`;

const DropdownMenu = styled.div`
  position: fixed;
  top: 190px;
  left: 0px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  min-width: 250px;
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DropdownWorkspaceImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ChatItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ChatItemContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatTitle = styled.h6`
  margin: 0;
  margin-bottom: 4px;
  font-weight: bold;
`;

const ChatTimestamp = styled.span`
  font-size: 12px;
  color: black;
  margin-left: -1px !important;
`;

const PaginationContainer = styled.div`
  display: grid;
  grid-template-columns: 24px auto 24px;
  justify-content: center;
  align-items: center;
  padding: 15px 15px;
  margin-left: -34px;
  text-align: center;
  gap: 12px;
`;

const PaginationButton = styled(MaterialIcon)`
  cursor: pointer;
  color: #4285f4;
  font-size: 22px;
  &:hover {
    opacity: 0.8;
  }
  display: flex;
  align-items: center;
  height: 20px;
`;

const ViewMoreLink = styled.span`
  color: #4285f4;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    text-decoration: none;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  margin: 0 8px;
`;

const Tooltip = styled.div<{ visible: boolean; top: number; collapsed: boolean }>`
  position: fixed;
  left: ${(props) => (props.collapsed ? '70px' : '260px')};
  background: rgba(31, 41, 55, 0.95);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  max-width: 200px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  white-space: nowrap;
  top: ${(props) => props.top}px;
  pointer-events: none;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-style: solid;
    border-width: 6px 6px 6px 0;
    border-color: transparent rgba(31, 41, 55, 0.95) transparent transparent;
  }
`;

interface SidebarComponentProps {
  uuid?: string;
  defaultCollapsed?: boolean;
}

export default function SidebarComponent({
  uuid,
  defaultCollapsed = false
}: SidebarComponentProps) {
  const { ui, main, chat } = useStores();
  const [activeItem, setActiveItem] = useState<'activities' | 'settings' | 'feature' | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const history = useHistory();
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(true);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [featureModal, setFeatureModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [visibleChatMenu, setVisibleChatMenu] = useState<{ [key: string]: boolean }>({});
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isChatsExpanded, setIsChatsExpanded] = useState(false);
  const [chatOffset, setChatOffset] = useState(0);
  const CHATS_PER_PAGE = 5;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipTop, setTooltipTop] = useState(0);

  const user_pubkey = ui.meInfo?.owner_pubkey;

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

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/activities')) {
      setActiveItem('activities');
    } else if (path === `/workspace/${uuid}`) {
      setActiveItem('settings');
    } else if (path.includes('/feature/')) {
      setActiveItem('feature');
    } else {
      setActiveItem(null);
    }
  }, [uuid]);

  const handleItemClick = (item: 'activities' | 'settings') => {
    setActiveItem(item);
    if (item === 'activities') {
      history.push(`/workspace/${uuid}/activities`);
    } else if (item === 'settings') {
      history.push(`/workspace/${uuid}`);
    }
  };

  const handleReorderFeatures = async (feat: Feature, priority: number) => {
    await main.addWorkspaceFeature({
      workspace_uuid: feat.workspace_uuid,
      uuid: feat.uuid,
      priority: priority
    });
  };

  const fetchFeatures = useCallback(async () => {
    try {
      const response = await main.getWorkspaceFeatures(uuid || '', {
        page: 1,
        status: 'active'
      });
      setFeatures(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching features:', error);
      setFeatures([]);
    }
  }, [main, uuid]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

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
    setShowDropdown(false);
  };

  const handleCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
    const event = new CustomEvent('sidebarCollapse', {
      detail: { collapsed }
    });
    window.dispatchEvent(event);
  };

  const toggleFeatureModal = () => {
    setFeatureModal(!featureModal);
  };

  const handleAddFeature = () => {
    toggleFeatureModal();
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        const workspaceChats = await chat.getWorkspaceChats(uuid as string);
        if (workspaceChats && workspaceChats.length > 0) {
          const sortedChats = workspaceChats
            .filter((chat: Chat) => chat && chat.id)
            .sort((a: Chat, b: Chat) => {
              const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return dateB - dateA;
            });
          setChats(sortedChats);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        ui.setToasts([
          {
            title: 'Error',
            color: 'danger',
            text: 'Failed to load chats.'
          }
        ]);
      } finally {
        setIsLoadingChats(false);
      }
    };
    loadChats();
  }, [uuid, chat, ui]);

  const handleArchiveChat = async (chatId: string) => {
    try {
      setIsLoadingChats(true);
      await chatService.archiveChat(chatId);

      const updatedChats = await chat.getWorkspaceChats(uuid as string);
      setChats(updatedChats);

      setToasts([
        {
          id: `${Date.now()}-archive-success`,
          title: 'Success',
          color: 'success',
          text: 'Chat archived successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-archive-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to archive chat'
        }
      ]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const toggleChatMenu = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setVisibleChatMenu({ [chatId]: !visibleChatMenu[chatId] });
  };

  const confirmArchiveChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    openDeleteConfirmation({
      onDelete: () => handleArchiveChat(chatId),
      onCancel: () =>
        setVisibleChatMenu((prev: Record<string, boolean>) => ({
          ...prev,
          [chatId]: false
        })),
      confirmButtonText: 'Confirm',
      customIcon: archiveIcon,
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            Archive this Chat?
          </Box>
        </Box>
      )
    });
  };

  const toggleChats = () => {
    setIsChatsExpanded(!isChatsExpanded);
  };

  const handleNewChat = async () => {
    try {
      const newChat = await chat.createChat(uuid as string, 'New Chat');
      if (newChat && newChat.id) {
        history.push(`/workspace/${uuid}/hivechat/${newChat.id}`);
      } else {
        ui.setToasts([
          {
            title: 'Error',
            color: 'danger',
            text: 'Failed to create new chat. Please try again.'
          }
        ]);
      }
    } catch (error) {
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'An error occurred while creating the chat.'
        }
      ]);
    }
  };

  const handleFeatureBacklogClick = () => {
    history.push(`/workspace/${uuid}/feature_backlog`);
  };

  const visibleChats = chats.slice(chatOffset, chatOffset + CHATS_PER_PAGE);
  const hasNextPage = chatOffset + CHATS_PER_PAGE < chats.length;
  const hasPreviousPage = chatOffset > 0;

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNextPage) {
      setChatOffset(chatOffset + CHATS_PER_PAGE);
    }
  };

  const handlePreviousPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPreviousPage) {
      setChatOffset(chatOffset - CHATS_PER_PAGE);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent, itemName: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipTop(rect.top + rect.height / 2 - 15);
    setHoveredItem(itemName);
  };

  return (
    <SidebarContainer collapsed={collapsed} onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (collapsed) toggleDropdown(e);
                }}
                onMouseEnter={(e) => handleMouseEnter(e, `workspace-${workspace.uuid}`)}
                onMouseLeave={() => setHoveredItem(null)}
              />
              {!collapsed && (
                <>
                  <div
                    onMouseEnter={(e) => handleMouseEnter(e, `workspace-budget-${workspace.uuid}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <WorkspaceBudget org={workspace} user_pubkey={user_pubkey ?? ''} />
                  </div>
                  <WorkspaceDropdown
                    collapsed={collapsed}
                    onClick={toggleDropdown}
                    onMouseEnter={(e) => handleMouseEnter(e, 'workspace-dropdown')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <MaterialIcon icon="arrow_drop_down" style={{ fontSize: 24 }} />
                    {showDropdown && (
                      <DropdownMenu>
                        {main.workspaces
                          .filter((w) => w.uuid !== uuid)
                          .map((workspace) => (
                            <DropdownItem
                              key={workspace.uuid}
                              onClick={() => handleWorkspaceClick(workspace.uuid)}
                              onMouseEnter={(e) =>
                                handleMouseEnter(e, `workspace-${workspace.uuid}`)
                              }
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <DropdownWorkspaceImage
                                src={workspace.img || avatarIcon}
                                alt={workspace.name}
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <WorkspaceBudget org={workspace} user_pubkey={user_pubkey ?? ''} />
                              </div>
                            </DropdownItem>
                          ))}
                      </DropdownMenu>
                    )}
                  </WorkspaceDropdown>
                </>
              )}
              {(collapsed || hoveredItem === `workspace-${workspace.uuid}`) && (
                <Tooltip
                  visible={hoveredItem === `workspace-${workspace.uuid}`}
                  top={tooltipTop}
                  collapsed={collapsed}
                >
                  {workspace.name}
                </Tooltip>
              )}
              {hoveredItem === `workspace-budget-${workspace.uuid}` && (
                <Tooltip visible={true} top={tooltipTop} collapsed={collapsed}>
                  {workspace.name}
                </Tooltip>
              )}
              {hoveredItem === 'workspace-dropdown' && (
                <Tooltip visible={true} top={tooltipTop} collapsed={collapsed}>
                  Switch Workspace
                </Tooltip>
              )}
            </React.Fragment>
          ))}
      </WorkspaceTitle>

      <NavItem
        active={activeItem === 'activities'}
        onClick={() => handleItemClick('activities')}
        collapsed={collapsed}
        onMouseEnter={(e) => handleMouseEnter(e, 'activities')}
        onMouseLeave={() => setHoveredItem(null)}
        aria-label="Activities"
      >
        <MaterialIcon icon="home" />
        <span>Activities</span>
        {(collapsed || hoveredItem === 'activities') && (
          <Tooltip visible={hoveredItem === 'activities'} top={tooltipTop} collapsed={collapsed}>
            Activities
          </Tooltip>
        )}
      </NavItem>

      <NavItem
        active={activeItem === 'settings'}
        onClick={() => handleItemClick('settings')}
        collapsed={collapsed}
        onMouseEnter={(e) => handleMouseEnter(e, 'settings')}
        onMouseLeave={() => setHoveredItem(null)}
        aria-label="Settings"
      >
        <MaterialIcon icon="settings" />
        <span>Settings</span>
        {(collapsed || hoveredItem === 'settings') && (
          <Tooltip visible={hoveredItem === 'settings'} top={tooltipTop} collapsed={collapsed}>
            Settings
          </Tooltip>
        )}
      </NavItem>

      <NavItem
        active={window.location.pathname.includes('feature_backlog')}
        onClick={handleFeatureBacklogClick}
        collapsed={collapsed}
        onMouseEnter={(e) => handleMouseEnter(e, 'backlog')}
        onMouseLeave={() => setHoveredItem(null)}
        aria-label="Feature Backlog"
      >
        <img
          src="/static/backlog.png"
          alt="feature_backlog"
          style={{
            width: '22px',
            height: '22px',
            marginBottom: '4px',
            marginLeft: '2px'
          }}
        />
        <span>Backlog</span>
        {(collapsed || hoveredItem === 'backlog') && (
          <Tooltip visible={hoveredItem === 'backlog'} top={tooltipTop} collapsed={collapsed}>
            Feature Backlog
          </Tooltip>
        )}
      </NavItem>

      <FeaturesSection>
        <FeatureHeader
          onClick={toggleChats}
          onMouseEnter={(e) => handleMouseEnter(e, 'chats')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <h6 style={{ display: collapsed ? 'none' : 'block' }}>Chats</h6>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MaterialIcon
              data-testid="add-chat-button"
              icon="add"
              style={{ marginRight: '10px', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleNewChat();
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setHoveredItem('new-chat');
              }}
              onMouseLeave={() => setHoveredItem(null)}
            />
            {hoveredItem === 'new-chat' && (
              <Tooltip visible={true} top={tooltipTop} collapsed={collapsed}>
                New Chat
              </Tooltip>
            )}
            <MaterialIcon
              icon={isChatsExpanded ? 'arrow_drop_down' : 'arrow_right'}
              style={{ marginRight: '5px' }}
            />
          </div>
          {(collapsed || hoveredItem === 'chats') && (
            <Tooltip visible={hoveredItem === 'chats'} top={tooltipTop} collapsed={collapsed}>
              Chats
            </Tooltip>
          )}
        </FeatureHeader>
        {isChatsExpanded && (
          <div data-testid="chat-list">
            {isLoadingChats ? (
              <LoadingContainer data-testid="chat-loading-spinner">
                <EuiLoadingSpinner size="m" />
              </LoadingContainer>
            ) : (
              <>
                {visibleChats.map((chat) => (
                  <NavItem
                    data-testid={`chat-item-${chat.id}`}
                    key={chat.id}
                    onClick={() => history.push(`/workspace/${uuid}/hivechat/${chat.id}`)}
                    collapsed={collapsed}
                    active={window.location.pathname.includes(`/hivechat/${chat.id}`)}
                  >
                    <MissionRowFlex>
                      {!collapsed && (
                        <FeatureData>
                          <ChatItemContainer>
                            <ChatItemContent>
                              <ChatTitle>{chat.title || 'Untitled Chat'}</ChatTitle>
                              <ChatTimestamp data-testid={`chat-timestamp-${chat.id}`}>
                                {chat.updatedAt || chat.createdAt
                                  ? new Date(chat.updatedAt || chat.createdAt).toLocaleString()
                                  : 'No date'}
                              </ChatTimestamp>
                            </ChatItemContent>
                            <MaterialIcon
                              data-testid="chat-options-button"
                              icon="more_horiz"
                              onClick={(e) => toggleChatMenu(chat.id, e)}
                              style={{ cursor: 'pointer' }}
                            />
                          </ChatItemContainer>
                          {visibleChatMenu[chat.id] && (
                            <EditPopover>
                              <EditPopoverTail />
                              <EditPopoverContent onClick={(e) => confirmArchiveChat(chat.id, e)}>
                                <EditPopoverText>Archive</EditPopoverText>
                              </EditPopoverContent>
                            </EditPopover>
                          )}
                        </FeatureData>
                      )}
                    </MissionRowFlex>
                  </NavItem>
                ))}
                {!collapsed && chats.length > 0 && (
                  <PaginationContainer>
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      {hasPreviousPage && (
                        <PaginationButton
                          icon="chevron_left"
                          onClick={handlePreviousPage}
                          data-testid="previous-page-button"
                        />
                      )}
                    </div>
                    <ViewMoreLink
                      onClick={() => history.push(`/workspace/${uuid}/hivechat/history`)}
                      data-testid="view-more-link"
                    >
                      View More
                    </ViewMoreLink>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {hasNextPage && (
                        <PaginationButton
                          icon="chevron_right"
                          onClick={handleNextPage}
                          data-testid="next-page-button"
                        />
                      )}
                    </div>
                  </PaginationContainer>
                )}
              </>
            )}
          </div>
        )}
      </FeaturesSection>

      <FeaturesSection>
        <FeatureHeader
          onClick={toggleFeatures}
          onMouseEnter={(e) => handleMouseEnter(e, 'features')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <h6 style={{ display: collapsed ? 'none' : 'block' }}>Features</h6>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MaterialIcon
              icon="add"
              style={{ marginRight: '10px', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddFeature();
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleMouseEnter(e, 'new-feature');
              }}
              onMouseLeave={() => setHoveredItem(null)}
            />
            <MaterialIcon
              icon={isFeaturesExpanded ? 'arrow_drop_down' : 'arrow_right'}
              style={{ marginRight: '5px' }}
            />
          </div>
          {(collapsed || hoveredItem === 'features') && (
            <Tooltip visible={hoveredItem === 'features'} top={tooltipTop} collapsed={collapsed}>
              Features
            </Tooltip>
          )}
          {hoveredItem === 'new-feature' && (
            <Tooltip visible={true} top={tooltipTop} collapsed={collapsed}>
              New Feature
            </Tooltip>
          )}
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
                          onClick={() => {
                            setActiveItem('feature');
                            history.push(`/workspace/${uuid}/feature/${feat.uuid}`);
                          }}
                          key={feat.id}
                          collapsed={collapsed}
                          active={
                            activeItem === 'feature' && window.location.pathname.includes(feat.uuid)
                          }
                          onMouseEnter={(e) => handleMouseEnter(e, `feature-${feat.uuid}`)}
                          onMouseLeave={() => setHoveredItem(null)}
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
                          {(collapsed || hoveredItem === `feature-${feat.uuid}`) && (
                            <Tooltip
                              visible={hoveredItem === `feature-${feat.uuid}`}
                              top={tooltipTop}
                              collapsed={collapsed}
                            >
                              {feat.name}
                            </Tooltip>
                          )}
                        </NavItem>
                      )}
                    </EuiDraggable>
                  ))}
              </EuiDroppable>
            </EuiDragDropContext>
          </div>
        )}
      </FeaturesSection>

      {featureModal && (
        <Modal
          visible={featureModal}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: '25%',
            minHeight: '20%'
          }}
          overlayClick={toggleFeatureModal}
          bigCloseImage={toggleFeatureModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <AddFeature
            closeHandler={toggleFeatureModal}
            getFeatures={() => {
              fetchFeatures();
              toggleFeatureModal();
            }}
            workspace_uuid={uuid}
            priority={features.length}
          />
        </Modal>
      )}
    </SidebarContainer>
  );
}
