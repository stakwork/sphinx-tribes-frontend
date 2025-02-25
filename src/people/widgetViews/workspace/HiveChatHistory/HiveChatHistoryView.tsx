import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatService } from 'services';
import {
  EuiBasicTable,
  EuiButtonIcon,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiFieldText,
  EuiButton,
  EuiLoadingSpinner,
  EuiCallOut
} from '@elastic/eui';
import { Chat } from 'store/interface';

const chatService = new ChatService();

export function HiveChatHistoryView() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChats() {
      try {
        const chatHistory = await chatService.getWorkspaceChats(workspaceId);
        setChats(chatHistory || []);
      } catch (error) {
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChats();
  }, [workspaceId]);

  const handleArchive = async (chatId: string) => {
    try {
      await chatService.archiveChat(chatId);
      setChats(chats.filter((chat: Chat) => chat.id !== chatId));
    } catch (error) {
      setError('Failed to archive chat');
    }
  };

  const handleRename = (chat: any) => {
    setCurrentChat(chat);
    setNewTitle(chat.title);
    setIsRenameModalVisible(true);
  };

  const handleRenameSubmit = async () => {
    try {
      if (currentChat) {
        await chatService.updateChatTitle(currentChat.id, newTitle);
        setChats(
          chats.map((chat: Chat) =>
            chat.id === currentChat.id ? { ...chat, title: newTitle } : chat
          )
        );
        setIsRenameModalVisible(false);
      }
    } catch (error) {
      setError('Failed to rename chat');
    }
  };

  const columns = [
    {
      field: 'title',
      name: 'Chat Title'
    },
    {
      field: 'updatedAt',
      name: 'Date Time',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      name: 'Actions',
      render: (chat: any) => (
        <EuiPopover
          button={
            <EuiButtonIcon
              iconType="boxesHorizontal"
              onClick={() => setPopoverOpen(chat.id)}
              aria-label="Actions"
            />
          }
          isOpen={popoverOpen === chat.id}
          closePopover={() => setPopoverOpen(null)}
          panelPaddingSize="none"
        >
          <EuiContextMenuPanel
            items={[
              <EuiContextMenuItem
                key="archive"
                icon="trash"
                onClick={() => {
                  handleArchive(chat.id);
                  setPopoverOpen(null);
                }}
              >
                Archive
              </EuiContextMenuItem>,
              <EuiContextMenuItem
                key="rename"
                icon="pencil"
                onClick={() => {
                  handleRename(chat);
                  setPopoverOpen(null);
                }}
              >
                Rename
              </EuiContextMenuItem>
            ]}
          />
        </EuiPopover>
      )
    }
  ];

  return (
    <div>
      {error && (
        <EuiCallOut title="Error" color="danger" iconType="alert">
          <p>{error}</p>
        </EuiCallOut>
      )}
      {isLoading ? (
        <EuiLoadingSpinner size="xl" />
      ) : (
        <EuiBasicTable items={chats || []} columns={columns} rowHeader="title" />
      )}
      {isRenameModalVisible && (
        <EuiOverlayMask>
          <EuiModal onClose={() => setIsRenameModalVisible(false)}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Rename Chat</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiFieldText
                placeholder="New chat title"
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
              />
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton onClick={() => setIsRenameModalVisible(false)} color="text">
                Cancel
              </EuiButton>
              <EuiButton onClick={handleRenameSubmit} fill>
                Save
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )}
    </div>
  );
}
