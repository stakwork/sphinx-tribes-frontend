import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { useStores } from 'store';
import SidebarComponent from '../SidebarComponent';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

const mockChats = [
  { id: '1', title: 'Chat 1', updatedAt: new Date().toISOString() },
  { id: '2', title: 'Chat 2', updatedAt: new Date().toISOString() }
];

const chatMap = new Map(mockChats.map(chat => [chat.id, chat]));

const mockStores = {
  chat: {
    chats: chatMap,
    createChat: jest.fn(),
    getWorkspaceChats: jest.fn().mockResolvedValue(mockChats),
    getChatMessages: jest.fn(),
    loadChat: jest.fn(),
    updateChat: jest.fn(),
    addChat: jest.fn()
  },
  ui: {
    setToasts: jest.fn(),
    meInfo: { owner_pubkey: 'test-pubkey' }
  },
  main: {
    workspaces: [] as Array<{
      id: number;
      uuid: string;
      name: string;
      img: string;
    }>,
    getUserWorkspaces: jest.fn(),
    getWorkspaceFeatures: jest.fn()
  }
};

const renderSidebar = (props = {}) => {
  (useStores as jest.Mock).mockReturnValue(mockStores);
  
  return render(
    <BrowserRouter>
      <SidebarComponent uuid="test-uuid" {...props} />
    </BrowserRouter>
  );
};

describe('SidebarComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue(mockStores);
  });

  describe('Chat List Functionality', () => {
    test('should display chat list when expanded', async () => {
      renderSidebar({ defaultCollapsed: false });

      waitFor(() => {
        expect(mockStores.chat.getWorkspaceChats).toHaveBeenCalledWith('test-uuid');
        mockChats.forEach(chat => {
          expect(screen.getByText(chat.title)).toBeInTheDocument();
        });
      });
    });

    test('should update chat list when store changes', async () => {
      const { rerender } = renderSidebar({ defaultCollapsed: false });

      const newChat = { id: '3', title: 'New Chat', updatedAt: new Date().toISOString() };
      const updatedChatMap = new Map(chatMap);
      updatedChatMap.set(newChat.id, newChat);

      const updatedStores = {
        ...mockStores,
        chat: {
          ...mockStores.chat,
          chats: updatedChatMap
        }
      };

      (useStores as jest.Mock).mockReturnValue(updatedStores);

      rerender(
        <BrowserRouter>
          <SidebarComponent uuid="test-uuid" defaultCollapsed={false} />
        </BrowserRouter>
      );

      waitFor(() => {
        expect(screen.getByText(newChat.title)).toBeInTheDocument();
      });
    });

    test('should not display chat list when collapsed', () => {
      renderSidebar({ defaultCollapsed: true });

      mockChats.forEach(chat => {
        expect(screen.queryByText(chat.title)).not.toBeInTheDocument();
      });
    });

    test('should create new chat when add chat button is clicked', async () => {
      mockStores.chat.createChat.mockResolvedValueOnce({
        id: '4',
        title: 'New Chat',
        updatedAt: new Date().toISOString()
      });

      renderSidebar({ defaultCollapsed: false });

      const addChatButton = screen.getByTestId('add-chat-button');
      fireEvent.click(addChatButton);

      await waitFor(() => {
        expect(mockStores.chat.createChat).toHaveBeenCalledWith('test-uuid', 'New Chat');
      });
    });
  });

  describe('Navigation Item Tooltips', () => {
    test('should show tooltip for activities when collapsed', async () => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Activities');

      fireEvent.mouseEnter(activitiesButton);

      waitFor(() => {
        expect(screen.getByText('Activities')).toBeInTheDocument();
      });
    });

    test('should show tooltip for kanban when collapsed', async () => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Kanban');

      fireEvent.mouseEnter(activitiesButton);

      waitFor(() => {
        expect(screen.getByText('Kanban')).toBeInTheDocument();
      });
    });

    test('should show tooltip for settings when collapsed', async () => {
      renderSidebar({ defaultCollapsed: true });
      const settingsButton = screen.getByLabelText('Settings');

      fireEvent.mouseEnter(settingsButton);

      waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });

    test('should show tooltip for feature backlog when collapsed', async () => {
      renderSidebar({ defaultCollapsed: true });
      const backlogButton = screen.getByLabelText('Feature Backlog');

      fireEvent.mouseEnter(backlogButton);

      waitFor(() => {
        expect(screen.getByText('Feature Backlog')).toBeInTheDocument();
      });
    });
  });

  describe('Action Button Tooltips', () => {
    test('should show tooltip for new chat button', async () => {
      renderSidebar({ defaultCollapsed: false });
      const addChatButton = screen.getByTestId('add-chat-button');

      fireEvent.mouseEnter(addChatButton);

      waitFor(() => {
        expect(screen.getByText('New Chat')).toBeInTheDocument();
      });
    });

    test('should show tooltip for new feature button', async () => {
      renderSidebar({ defaultCollapsed: false });
      const addFeatureButton = screen.getByTestId('add-chat-button');

      fireEvent.mouseEnter(addFeatureButton);

      waitFor(() => {
        expect(screen.getByText('New Chat')).toBeInTheDocument();
      });
    });
  });

  describe('Workspace Related Tooltips', () => {
    const mockWorkspace = {
      id: 1,
      uuid: 'test-uuid',
      name: 'Test Workspace',
      img: 'test.jpg'
    };

    beforeEach(() => {
      mockStores.main.workspaces = [mockWorkspace];
    });

    test('should show tooltip for workspace name when collapsed', async () => {
      renderSidebar({ defaultCollapsed: true });
      const workspaceImage = screen.getByAltText('Test Workspace');

      fireEvent.mouseEnter(workspaceImage);

      waitFor(() => {
        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      });
    });

    test('should show tooltip for workspace switcher', async () => {
      waitFor(() => {
        renderSidebar({ defaultCollapsed: false });
        const dropdownButton = screen.getByTestId('workspace-dropdown');

        fireEvent.mouseEnter(dropdownButton);

        expect(screen.getByText('Switch Workspace')).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip Behavior', () => {
    test('should not show tooltips when sidebar is expanded', async () => {
      waitFor(() => {
        renderSidebar({ defaultCollapsed: false });
        const activitiesButton = screen.getByLabelText('Activities');

        fireEvent.mouseEnter(activitiesButton);

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    test('should hide tooltip on mouse leave', async () => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Activities');

      fireEvent.mouseEnter(activitiesButton);
      waitFor(() => {
        expect(screen.getByText('Activities')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(activitiesButton);
      waitFor(() => {
        expect(screen.queryByText('Activities')).not.toBeInTheDocument();
      });
    });

    test('should handle keyboard focus for tooltips', async () => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Activities');

      fireEvent.focus(activitiesButton);

      waitFor(() => {
        expect(activitiesButton).toHaveFocus();
        expect(screen.getByText('Activities')).toBeInTheDocument();
      });

      fireEvent.blur(activitiesButton);
      waitFor(() => {
        expect(screen.queryByText('Activities')).not.toBeInTheDocument();
      });
    });

    test('should not show kanban tooltips when sidebar is expanded', async () => {
      waitFor(() => {
        renderSidebar({ defaultCollapsed: false });
        const activitiesButton = screen.getByLabelText('Kanban');

        fireEvent.mouseEnter(activitiesButton);

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    test('should hide kanban tooltip on mouse leave', async () => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Kanban');

      fireEvent.mouseEnter(activitiesButton);
      waitFor(() => {
        expect(screen.getByText('Kanban')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(activitiesButton);
      waitFor(() => {
        expect(screen.queryByText('Kanban')).not.toBeInTheDocument();
      });
    });

    test('should handle keyboard focus for kanban tooltips', async () => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Kanban');

      fireEvent.focus(activitiesButton);

      waitFor(() => {
        expect(activitiesButton).toHaveFocus();
        expect(screen.getByText('Kanban')).toBeInTheDocument();
      });

      fireEvent.blur(activitiesButton);
      waitFor(() => {
        expect(screen.queryByText('Kanban')).not.toBeInTheDocument();
      });
    });
  });

  describe('Chat Title Updates', () => {
    test('should update chat title in sidebar when changed in store', async () => {
      waitFor(() => {
      const { rerender } = renderSidebar({ defaultCollapsed: false });

      const updatedChatMap = new Map(chatMap);
      updatedChatMap.set('1', { ...mockChats[0], title: 'Updated Chat 1' });

      const updatedStores = {
        ...mockStores,
        chat: {
          ...mockStores.chat,
          chats: updatedChatMap
        }
      };

      (useStores as jest.Mock).mockReturnValue(updatedStores);

      rerender(
        <BrowserRouter>
          <SidebarComponent uuid="test-uuid" defaultCollapsed={false} />
        </BrowserRouter>
      );

      
        expect(screen.getByText('Updated Chat 1')).toBeInTheDocument();
      });
    });

    test('should maintain chat order after title update', async () => {
      waitFor(() => {
      const { rerender } = renderSidebar({ defaultCollapsed: false });

      const updatedChatMap = new Map(chatMap);
      updatedChatMap.set('1', { ...mockChats[0], title: 'Updated Chat 1' });

      const updatedStores = {
        ...mockStores,
        chat: {
          ...mockStores.chat,
          chats: updatedChatMap
        }
      };

      (useStores as jest.Mock).mockReturnValue(updatedStores);

      rerender(
        <BrowserRouter>
          <SidebarComponent uuid="test-uuid" defaultCollapsed={false} />
        </BrowserRouter>
      );

      const chatElements = screen.getAllByTestId(/^chat-item-/);

        expect(chatElements[0]).toHaveTextContent('Updated Chat 1');
      });
    });
  });
});
