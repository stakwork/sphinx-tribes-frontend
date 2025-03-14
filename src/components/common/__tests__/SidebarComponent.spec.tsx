import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { useStores } from 'store';
import SidebarComponent from '../SidebarComponent';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

const mockStores = {
  chat: {
    createChat: jest.fn(),
    getWorkspaceChats: jest.fn()
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

describe('SidebarComponent Tooltip Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue(mockStores);
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
  });
});
