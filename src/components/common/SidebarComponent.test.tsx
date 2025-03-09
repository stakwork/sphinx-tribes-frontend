import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Chat } from 'store/interface';
import { useStores } from 'store';
import SidebarComponent from './SidebarComponent';

type MockStore = {
  chat: {
    createChat: jest.Mock;
    getWorkspaceChats: jest.Mock;
  };
  ui: {
    setToasts: jest.Mock;
  };
  main: {
    workspaces: any[];
  };
};

jest.mock('store', () => ({
  useStores: jest.fn()
}));

const mockChats: Chat[] = [
  {
    id: '1',
    workspaceId: 'test-workspace-1',
    title: 'Chat 1',
    createdAt: '2024-02-24T11:19:00Z',
    updatedAt: '2024-02-24T11:19:00Z'
  },
  {
    id: '2',
    workspaceId: 'test-workspace-1',
    title: 'Chat 2',
    createdAt: '2024-02-24T11:18:00Z',
    updatedAt: '2024-02-24T11:18:00Z'
  },
  {
    id: '3',
    workspaceId: 'test-workspace-1',
    title: 'Chat 3',
    createdAt: '2024-02-24T11:17:00Z',
    updatedAt: '2024-02-24T11:17:00Z'
  },
  {
    id: '4',
    workspaceId: 'test-workspace-1',
    title: 'Chat 4',
    createdAt: '2024-02-24T11:16:00Z',
    updatedAt: '2024-02-24T11:16:00Z'
  },
  {
    id: '5',
    workspaceId: 'test-workspace-1',
    title: 'Chat 5',
    createdAt: '2024-02-24T11:15:00Z',
    updatedAt: '2024-02-24T11:15:00Z'
  },
  {
    id: '6',
    workspaceId: 'test-workspace-1',
    title: 'Chat 6',
    createdAt: '2024-02-24T11:14:00Z',
    updatedAt: '2024-02-24T11:14:00Z'
  }
];

const renderSidebar = (props: any) =>
  render(
    <BrowserRouter>
      <SidebarComponent uuid="test-uuid" workspaces={[]} {...props} />
    </BrowserRouter>
  );

describe('SidebarComponent Chat Section', () => {
  test('should display add chat button in both collapsed and expanded states', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: true });
      expect(screen.getByTestId('add-chat-button')).toBeInTheDocument();

      renderSidebar({ defaultCollapsed: false });
      expect(screen.getByTestId('add-chat-button')).toBeInTheDocument();
    });
  });

  test('should show chat section header when expanded', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      expect(screen.getByText('Chats')).toBeInTheDocument();
    });
  });

  test('should toggle chat list when clicking on header', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      const header = screen.getByText('Chats').closest('div');
      if (!header) {
        throw new Error('Chat header not found');
      }

      fireEvent.click(header);
      expect(screen.queryByTestId('chat-list')).toBeInTheDocument();

      fireEvent.click(header);
      expect(screen.queryByTestId('chat-list')).not.toBeInTheDocument();
    });
  });

  test('should display loading spinner when loading chats', () => {
    waitFor(() => {
      renderSidebar({ isLoadingChats: true });
      expect(screen.getByTestId('chat-loading-spinner')).toBeInTheDocument();
    });
  });

  test('should display up to 5 most recent chats', () => {
    waitFor(() => {
      renderSidebar({ chats: mockChats });
      const chatItems = screen.getAllByTestId(/^chat-item-/);
      expect(chatItems).toHaveLength(5);

      const firstChat = within(chatItems[0]).getByText('Chat 1');
      expect(firstChat).toBeInTheDocument();
    });
  });

  test('should show "View More" link when there are more than 5 chats', () => {
    waitFor(() => {
      renderSidebar({ chats: mockChats });
      expect(screen.getByText('View More')).toBeInTheDocument();
    });
  });

  test('should not show "View More" link when there are 5 or fewer chats', () => {
    waitFor(() => {
      renderSidebar({ chats: mockChats.slice(0, 4) });
      expect(screen.queryByText('View More')).not.toBeInTheDocument();
    });
  });

  test('should show chat options menu when clicking ellipsis', () => {
    waitFor(() => {
      renderSidebar({ chats: mockChats });
      const firstChatOptions = screen.getAllByTestId('chat-options-button')[0];
      fireEvent.click(firstChatOptions);
      expect(screen.getByText('Archive')).toBeInTheDocument();
    });
  });

  test('should format chat timestamps correctly', () => {
    waitFor(() => {
      renderSidebar({ chats: mockChats });
      const timestamp = screen.getByTestId('chat-timestamp-1');
      expect(timestamp).toHaveTextContent(new Date('2024-02-24T11:19:00Z').toLocaleString());
    });
  });

  test('should handle chat with no title', () => {
    waitFor(() => {
      const chatsWithNoTitle = [
        {
          ...mockChats[0],
          title: undefined
        }
      ];
      renderSidebar({ chats: chatsWithNoTitle });
      expect(screen.getByText('Untitled Chat')).toBeInTheDocument();
    });
  });

  test('should handle chat with no timestamp', () => {
    waitFor(() => {
      const chatsWithNoTimestamp = [
        {
          ...mockChats[0],
          createdAt: undefined,
          updatedAt: undefined
        }
      ];
      renderSidebar({ chats: chatsWithNoTimestamp });
      expect(screen.getByText('No date')).toBeInTheDocument();
    });
  });
});

describe('SidebarComponent Tooltip Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show tooltip for activities when collapsed', async () => {
    const mockStores: MockStore = {
      chat: {
        createChat: jest.fn(),
        getWorkspaceChats: jest.fn()
      },
      ui: {
        setToasts: jest.fn()
      },
      main: {
        workspaces: []
      }
    };

    (useStores as jest.Mock).mockReturnValue(mockStores);

    renderSidebar({ defaultCollapsed: true });
    const activitiesButton = screen.getByLabelText('Activities');

    fireEvent.mouseEnter(activitiesButton);
    waitFor(() => {
      expect(screen.getByText('Activities')).toBeInTheDocument();
    });
  });

  test('should show tooltip for settings when collapsed', async () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: true });
      const settingsButton = screen.getByLabelText('Settings');

      fireEvent.mouseEnter(settingsButton);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  test('should show tooltip for feature backlog when collapsed', async () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: true });
      const backlogButton = screen.getByLabelText('Feature Backlog');

      fireEvent.mouseEnter(backlogButton);
      expect(screen.getByText('Feature Backlog')).toBeInTheDocument();
    });
  });

  test('should show tooltip for new chat button', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      const addChatButton = screen.getByTestId('add-chat-button');

      fireEvent.mouseEnter(addChatButton);
      expect(screen.getByText('New Chat')).toBeInTheDocument();
    });
  });

  test('should show tooltip for new feature button', async () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      const addFeatureButton = screen.getByLabelText('New Feature');

      fireEvent.mouseEnter(addFeatureButton);
      expect(screen.getByText('New Feature')).toBeInTheDocument();
    });
  });

  test('should show tooltip for workspace budget', async () => {
    waitFor(() => {
      const mockWorkspace = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Test Workspace',
        img: 'test.jpg'
      };

      renderSidebar({
        defaultCollapsed: false,
        workspaces: [mockWorkspace]
      });

      const budgetElement = screen.getByText(/Budget/i).closest('div');
      if (!budgetElement) throw new Error('Budget element not found');

      fireEvent.mouseEnter(budgetElement);
      expect(screen.getByText('Test Workspace Budget')).toBeInTheDocument();
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

  test('should show tooltip for feature names when collapsed', async () => {
    waitFor(() => {
      const mockFeature = {
        id: 1,
        uuid: 'feature-uuid',
        name: 'Test Feature',
        workspace_uuid: 'test-uuid',
        priority: 1
      };

      renderSidebar({
        defaultCollapsed: true,
        features: [mockFeature]
      });

      const featureElement = screen.getByText('Test Feature').closest('div');
      if (!featureElement) throw new Error('Feature element not found');

      fireEvent.mouseEnter(featureElement);
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
  });

  test('should not show tooltips when sidebar is expanded', async () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      const activitiesButton = screen.getByLabelText('Activities');

      fireEvent.mouseEnter(activitiesButton);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  test('should handle keyboard navigation for tooltips', async () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: true });
      const activitiesButton = screen.getByLabelText('Activities');

      fireEvent.focus(activitiesButton);
      expect(activitiesButton).toHaveFocus();
      expect(screen.getByText('Activities')).toBeInTheDocument();
    });
  });
});
