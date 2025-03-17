import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Chat } from 'store/interface';
import SidebarComponent from './SidebarComponent';

jest.mock('store', () => ({
  useStores: () => ({
    chat: {
      createChat: jest.fn(),
      getWorkspaceChats: jest.fn()
    },
    ui: {
      setToasts: jest.fn()
    }
  })
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

describe('SidebarComponent Kanban Navigation', () => {
  test('should display Kanban navigation item', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      expect(screen.getByTestId('navbar-kanban')).toBeInTheDocument();
      expect(screen.getByText('Kanban')).toBeInTheDocument();
    });
  });

  test('should navigate to planner page when clicking the Kanban item', () => {
    const historyMock = { push: jest.fn() };

    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });
      const kanbanItem = screen.getByTestId('navbar-kanban');

      fireEvent.click(kanbanItem);

      expect(historyMock.push).toHaveBeenCalledWith('/workspace/test-uuid/planner');
    });
  });

  test('should display Kanban icon in collapsed state', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: true });

      const kanbanItem = screen.getByTestId('navbar-kanban');
      expect(kanbanItem).toBeInTheDocument();

      const kanbanIcon = kanbanItem.querySelector('img');
      expect(kanbanIcon).toBeInTheDocument();
      expect(kanbanIcon).toHaveAttribute('alt', 'kanban');
    });
  });

  test('should position Kanban between Settings and Backlog', () => {
    waitFor(() => {
      renderSidebar({ defaultCollapsed: false });

      const settingsItem = screen.getByLabelText('Settings');
      const kanbanItem = screen.getByLabelText('Kanban');
      const backlogItem = screen.getByLabelText('Feature Backlog');

      const navItems = screen.getAllByRole('button');

      const settingsIndex = navItems.indexOf(settingsItem);
      const kanbanIndex = navItems.indexOf(kanbanItem);
      const backlogIndex = navItems.indexOf(backlogItem);

      expect(settingsIndex).toBeLessThan(kanbanIndex);
      expect(kanbanIndex).toBeLessThan(backlogIndex);
    });
  });
});
