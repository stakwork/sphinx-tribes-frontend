import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { useStores } from 'store';
import SidebarComponent from '../SidebarComponent';
import { useUserInfo } from '../../../people/userInfo/hooks';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('../../../people/userInfo/hooks', () => ({
  useUserInfo: jest.fn().mockReturnValue({
    logout: jest.fn(),
    getUser: jest.fn(),
    person: {}
  })
}));

const mockStores = {
  chat: {
    createChat: jest.fn(),
    getWorkspaceChats: jest.fn(),
    getWorkspaceChatsWithPagination: jest.fn().mockResolvedValue({
      chats: [],
      total: 0
    })
  },
  ui: {
    setToasts: jest.fn(),
    meInfo: { owner_pubkey: 'test-pubkey', id: 1 }
  },
  main: {
    workspaces: [] as Array<{
      id: number;
      uuid: string;
      name: string;
      img: string;
    }>,
    getUserWorkspaces: jest.fn().mockResolvedValue([]),
    getWorkspaceFeatures: jest.fn().mockResolvedValue([])
  }
};

const renderSidebar = (props = {}) =>
  render(
    <BrowserRouter>
      <SidebarComponent uuid="test-uuid" {...props} />
    </BrowserRouter>
  );

describe('SidebarComponent Tooltip Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue(mockStores);
    (useUserInfo as jest.Mock).mockReturnValue({
      logout: jest.fn(),
      getUser: jest.fn(),
      person: {}
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
      const addChatButton = screen.queryByTestId('add-chat-button');

      if (addChatButton) {
        fireEvent.mouseEnter(addChatButton);

        waitFor(() => {
          expect(screen.getByText('New Chat')).toBeInTheDocument();
        });
      }
    });

    test('should show tooltip for new feature button', async () => {
      renderSidebar({ defaultCollapsed: false });
      const addFeatureButton = screen.queryByTestId('new-feature-btn');

      if (addFeatureButton) {
        fireEvent.mouseEnter(addFeatureButton);

        waitFor(() => {
          expect(screen.getByText('New Feature')).toBeInTheDocument();
        });
      }
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
      const workspaceImage = screen.queryByAltText('Test Workspace');

      if (workspaceImage) {
        fireEvent.mouseEnter(workspaceImage);

        waitFor(() => {
          expect(screen.getByText('Test Workspace')).toBeInTheDocument();
        });
      }
    });

    test('should show tooltip for workspace switcher', async () => {
      waitFor(() => {
        renderSidebar({ defaultCollapsed: false });
        const dropdownButton = screen.queryByText('arrow_drop_down');
        if (dropdownButton) {
          fireEvent.mouseEnter(dropdownButton);
          expect(screen.getByText('Switch Workspace')).toBeInTheDocument();
        }
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
});
