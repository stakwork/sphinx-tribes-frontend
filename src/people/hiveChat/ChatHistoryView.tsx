import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { useDeleteConfirmationModal } from 'components/common';
import { Box } from '@mui/system';
import SidebarComponent from 'components/common/SidebarComponent';
import ActivitiesHeader from 'people/widgetViews/workspace/Activities/header';
import styled from 'styled-components';
import { ActionPopover, ActionItem, ActionIcon } from 'pages/tickets/style.ts';
import { archiveIcon } from 'components/common/DeleteConfirmationModal/archiveIcon.tsx';
import { useStores } from '../../store';
import { Chat } from '../../store/interface';

const Container = styled.div<{ collapsed: boolean }>`
  gap: 2rem;
  padding-bottom: 0 !important;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const ChatHistoryContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const ChatTable = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 200px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  padding: 16px;
  background: #f5f5f5;
  font-weight: 700;
  color: #333;
  font-family: 'Barlow';
  font-size: 20px;
`;

const ChatRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  padding: 16px;
  border-bottom: 1px solid #eee;
  align-items: center;
  position: relative;

  &:hover {
    background: #f9f9f9;
  }
`;

const ChatTitle = styled.div`
  cursor: pointer;
  color: #666;
  font-weight: 500;
  font-size: 18px;
  font-family: 'Barlow';
  &:hover {
    text-decoration: none;
  }
`;

const DateTime = styled.div`
  color: #666;
  font-family: 'Barlow';
  font-size: 16px;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const ChatActions = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 10px;
`;

const EllipsesButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 0 !important;
  color: #666;

  &:hover {
    background: #f0f0f0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
  padding: 8px;
  position: absolute;
  right: 12px;
  top: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  cursor: ${(props: { primary?: boolean; disabled?: boolean }) =>
    props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  background: ${(props: { primary?: boolean; disabled?: boolean }) => {
    if (props.disabled) return '#ccc';
    return props.primary ? '#4285f4' : '#fff';
  }};
  color: ${(props: { primary?: boolean; disabled?: boolean }) => (props.primary ? '#fff' : '#333')};
  border: ${(props: { primary?: boolean; disabled?: boolean }) =>
    props.primary ? 'none' : '1px solid #ddd'};
  transition: all 0.2s ease;
  opacity: ${(props: { primary?: boolean; disabled?: boolean }) => (props.disabled ? 0.7 : 1)};

  &:hover {
    background: ${(props: { primary?: boolean; disabled?: boolean }) => {
      if (props.disabled) return '#ccc';
      return props.primary ? '#3367d6' : '#f5f5f5';
    }};
    transform: ${(props: { primary?: boolean; disabled?: boolean }) =>
      props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${(props: { primary?: boolean; disabled?: boolean }) =>
      props.disabled ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  }

  &:active {
    transform: ${(props: { primary?: boolean; disabled?: boolean }) =>
      props.disabled ? 'none' : 'translateY(0)'};
    box-shadow: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const NewChatButton = styled.button`
  background-color: #49c998;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #3ab584;
  }
`;

export const ChatHistoryView: React.FC = observer(() => {
  const { workspaceId } = useParams<{ uuid: string; workspaceId: string }>();
  const { chat } = useStores();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      try {
        const workspaceChats = await chat.getWorkspaceChats(workspaceId);
        if (workspaceChats) {
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
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [workspaceId, chat]);

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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-testid^="chat-options-"]')) {
        setVisibleMenu({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleArchiveChat = async (chatId: string) => {
    try {
      await chat.archiveChat(chatId);
      setChats(chats.filter((chat: Chat) => chat.id !== chatId));
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

  const handleBackClick = () => {
    history.push(`/workspace/${workspaceId}`);
  };

  const handleChatClick = (chatId: string) => {
    history.push(`/workspace/${workspaceId}/hivechat/${chatId}`);
  };

  const confirmArchiveChat = (chatId: string) => {
    openDeleteConfirmation({
      onDelete: () => handleArchiveChat(chatId),
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

  const toggleMenu = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisibleMenu((prev: { [key: string]: boolean }) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key: string) => {
        if (key !== chatId) {
          newState[key] = false;
        }
      });
      newState[chatId] = !prev[chatId];
      return newState;
    });
  };

  const handleRenameClick = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChatId(chatId);
    setNewTitle(currentTitle);
    setIsRenameModalOpen(true);
    setVisibleMenu((prev: { [key: string]: boolean }) => ({ ...prev, [chatId]: false }));
  };

  const handleSave = async () => {
    if (selectedChatId && newTitle.trim()) {
      try {
        await chat.updateChatTitle(selectedChatId, newTitle);
        setChats((prevChats: Chat[]) =>
          prevChats.map((chat: Chat) =>
            chat.id === selectedChatId ? { ...chat, title: newTitle } : chat
          )
        );
        setIsRenameModalOpen(false);
        setSelectedChatId(null);
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await chat.createChat(workspaceId, 'New Chat');
      if (newChat && newChat.id) {
        history.push(`/workspace/${workspaceId}/hivechat/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  if (loading) {
    return (
      <Container collapsed={collapsed}>
        <LoadingContainer>
          <EuiLoadingSpinner size="l" />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <>
      <SidebarComponent uuid={workspaceId} />
      <Container collapsed={collapsed}>
        <ActivitiesHeader uuid={workspaceId} />
        <ChatHistoryContainer>
          <Header>
            <MaterialIcon
              onClick={handleBackClick}
              icon="arrow_back"
              style={{
                fontSize: 25,
                cursor: 'pointer',
                color: '#5f6368'
              }}
            />
            <Title>Hive Chat History</Title>
          </Header>

          <ChatTable>
            <TableHeader>
              <div>Chats</div>
              <div>Date Time</div>
              <div>Actions</div>
            </TableHeader>
            {chats.length > 0 ? (
              chats.map((chat: Chat) => (
                <ChatRow key={chat.id}>
                  <ChatTitle onClick={() => handleChatClick(chat.id)}>
                    {chat.title || 'Untitled Chat'}
                  </ChatTitle>
                  <DateTime>{formatDate(chat.updatedAt || chat.createdAt)}</DateTime>
                  <ChatActions>
                    <EllipsesButton
                      onClick={(e: React.MouseEvent) => toggleMenu(chat.id, e)}
                      data-testid={`chat-options-${chat.id}`}
                    >
                      <MaterialIcon icon="more_horiz" />
                    </EllipsesButton>
                    {visibleMenu[chat.id] && (
                      <ActionPopover onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <ActionItem
                          onClick={(e: React.MouseEvent) =>
                            handleRenameClick(chat.id, chat.title || '', e)
                          }
                          data-testid={`rename-chat-${chat.id}`}
                        >
                          <ActionIcon>
                            <MaterialIcon icon="edit" style={{ fontSize: '16px' }} />
                          </ActionIcon>
                          Rename
                        </ActionItem>
                        <ActionItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            confirmArchiveChat(chat.id);
                            setVisibleMenu((prev: { [key: string]: boolean }) => ({
                              ...prev,
                              [chat.id]: false
                            }));
                          }}
                          data-testid={`archive-chat-${chat.id}`}
                        >
                          <ActionIcon>
                            <MaterialIcon icon="archive" style={{ fontSize: '16px' }} />
                          </ActionIcon>
                          Archive
                        </ActionItem>
                      </ActionPopover>
                    )}
                  </ChatActions>
                </ChatRow>
              ))
            ) : (
              <EmptyState>
                <MaterialIcon
                  icon="chat"
                  style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}
                />
                <p>No chat history found</p>
              </EmptyState>
            )}
          </ChatTable>

          <ButtonContainer>
            <NewChatButton onClick={handleNewChat}>
              <MaterialIcon icon="add" style={{ fontSize: '20px' }} />
              New Chat
            </NewChatButton>
          </ButtonContainer>
        </ChatHistoryContainer>
      </Container>

      {isRenameModalOpen && (
        <ModalOverlay onClick={() => setIsRenameModalOpen(false)}>
          <ModalContent onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Rename Chat Title</ModalTitle>
              <CloseButton onClick={() => setIsRenameModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <Input
              value={newTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
              placeholder="Enter chat name"
              autoFocus
            />
            <ButtonGroup>
              <Button onClick={() => setIsRenameModalOpen(false)}>Cancel</Button>
              <Button primary disabled={!newTitle.trim()} onClick={handleSave}>
                Update
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
});

export default ChatHistoryView;
