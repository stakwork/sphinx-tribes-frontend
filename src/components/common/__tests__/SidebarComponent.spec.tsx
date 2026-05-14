import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { useStores } from 'store';
import SidebarComponent from '../SidebarComponent';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('../../../people/widgetViews/workspace/WorkspaceBudget.tsx', () => ({
  __esModule: true,
  default: ({ org }: any) => <span>{org.name}</span>
}));

const mockStores = {
  chat: {
    createChat: jest.fn(),
    getWorkspaceChats: jest.fn(),
    getWorkspaceChatsWithPagination: jest.fn()
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

const renderSidebar = (props = {}) =>
  render(
    <BrowserRouter>
      <SidebarComponent uuid="test-uuid" {...props} />
    </BrowserRouter>
  );

const resizeWindow = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width
  });
  fireEvent(window, new Event('resize'));
};

describe('SidebarComponent Tooltip Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resizeWindow(1024);
    mockStores.main.workspaces = [];
    mockStores.main.getUserWorkspaces.mockResolvedValue([]);
    mockStores.main.getWorkspaceFeatures.mockResolvedValue([]);
    mockStores.chat.getWorkspaceChatsWithPagination.mockResolvedValue({
      chats: [],
      total: 0
    });
    (useStores as jest.Mock).mockReturnValue(mockStores);
  });

  describe('Mobile sidebar behavior', () => {
    test('starts collapsed on mobile and opens from the hamburger control', () => {
      resizeWindow(375);
      renderSidebar();

      const openButton = screen.getByRole('button', { name: 'Open sidebar' });
      expect(openButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(openButton);

      expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByTestId('sidebar-mobile-backdrop')).toBeInTheDocument();
      expect(screen.getByLabelText('Activities')).toBeInTheDocument();
    });

    test('closes the mobile sidebar from the backdrop', () => {
      resizeWindow(375);
      renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: 'Open sidebar' }));
      fireEvent.click(screen.getByTestId('sidebar-mobile-backdrop'));

      expect(screen.getByRole('button', { name: 'Open sidebar' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    test('closes the mobile sidebar after selecting a navigation item', () => {
      resizeWindow(375);
      renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: 'Open sidebar' }));
      fireEvent.click(screen.getByLabelText('Activities'));

      expect(screen.getByRole('button', { name: 'Open sidebar' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    test('keeps the desktop sidebar expanded by default', () => {
      renderSidebar();

      expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByLabelText('Activities')).toBeInTheDocument();
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
      renderSidebar({ defaultCollapsed: false });
      const dropdownButton = screen.getByTestId('workspace-dropdown');

      fireEvent.mouseEnter(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Switch Workspace')).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip Behavior', () => {
    test('should not show tooltips when sidebar is expanded', async () => {
      renderSidebar({ defaultCollapsed: false });
      const activitiesButton = screen.getByLabelText('Activities');

      fireEvent.mouseEnter(activitiesButton);

      await waitFor(() => {
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
      renderSidebar({ defaultCollapsed: false });
      const activitiesButton = screen.getByLabelText('Kanban');

      fireEvent.mouseEnter(activitiesButton);

      await waitFor(() => {
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
});
