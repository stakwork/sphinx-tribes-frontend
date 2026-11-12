import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import { useStores } from 'store';
import { activityStore } from 'store/activityStore';
import { useHistory, useParams } from 'react-router-dom';
import { useDeleteConfirmationModal } from 'components/common';
import { createAndNavigateToHivechat } from '../../../../utils/hivechatUtils';
import Activities from './Activities';

jest.mock('../../../../utils/hivechatUtils', () => ({
  createAndNavigateToHivechat: jest.fn()
}));

jest.mock(
  'components/common/SidebarComponent',
  () =>
    function MockSidebarComponent() {
      return <div data-testid="sidebar" />;
    }
);

jest.mock('people/utils/RenderMarkdown', () => ({
  renderMarkdown: (content: string) => content
}));

jest.mock(
  './header',
  () =>
    function MockActivitiesHeader() {
      return <div data-testid="activities-header" />;
    }
);

jest.mock('remark-gfm', () => null);

jest.mock('rehype-raw', () => null);

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('store/activityStore', () => ({
  activityStore: {
    rootActivities: [],
    fetchWorkspaceActivities: jest.fn().mockResolvedValue(true),
    getActivity: jest.fn(),
    getThreadResponses: jest.fn().mockReturnValue([]),
    createActivity: jest.fn(),
    createThreadResponse: jest.fn(),
    updateActivity: jest.fn(),
    deleteActivity: jest.fn().mockResolvedValue(true)
  }
}));

jest.mock('components/common', () => ({
  ...jest.requireActual('components/common'),
  useDeleteConfirmationModal: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useParams: jest.fn()
}));

describe('Activities', () => {
  const mockChat = {
    createChat: jest.fn()
  };

  const mockMain = {
    getWorkspaceFeatures: jest.fn().mockResolvedValue([]),
    getFeaturePhases: jest.fn().mockResolvedValue([]),
    getUserWorkspaceByUuid: jest.fn().mockResolvedValue({ owner_pubkey: 'owner-pubkey' }),
    getUserRoles: jest.fn().mockResolvedValue([]),
    bountyRoles: []
  };

  const mockUI = {
    setToasts: jest.fn(),
    meInfo: { owner_alias: 'TestUser', owner_pubkey: 'owner-pubkey' },
    _meInfo: { owner_alias: 'TestUser', owner_pubkey: 'owner-pubkey' }
  };

  const mockHistory = {
    push: jest.fn()
  };

  const mockOpenDeleteConfirmation = jest.fn();

  const activities = [
    {
      id: '123',
      ID: '123',
      title: 'Test Feature Activity',
      content: 'This is test content for the feature activity',
      content_type: 'feature_creation',
      workspace: 'workspace-uuid',
      time_created: '2023-01-01T00:00:00Z'
    },
    {
      id: '456',
      ID: '456',
      title: 'Non-Feature Activity',
      content: 'This is a general update',
      content_type: 'general_update',
      workspace: 'workspace-uuid',
      time_created: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(activityStore, {
      rootActivities: activities,
      fetchWorkspaceActivities: jest.fn().mockResolvedValue(true),
      getActivity: jest.fn().mockImplementation((id) => activities.find((a) => a.ID === id)),
      getThreadResponses: jest.fn().mockReturnValue([]),
      deleteActivity: jest.fn().mockResolvedValue(true)
    });
    (useStores as jest.Mock).mockReturnValue({
      main: mockMain,
      chat: mockChat,
      ui: mockUI
    });
    (useHistory as jest.Mock).mockReturnValue(mockHistory);
    (useParams as jest.Mock).mockReturnValue({ uuid: 'workspace-uuid' });
    (useDeleteConfirmationModal as jest.Mock).mockReturnValue({
      openDeleteConfirmation: mockOpenDeleteConfirmation
    });

    (createAndNavigateToHivechat as jest.Mock).mockResolvedValue(true);
  });

  test('renders Build with Hivechat button for feature_creation content type', async () => {
    const { getByTestId, getAllByTestId } = render(<Activities />);

    await waitFor(() => {
      expect(activityStore.fetchWorkspaceActivities).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(activityStore.getThreadResponses).toHaveBeenCalled();
    });

    const activityItems = getAllByTestId('touch-target');
    fireEvent.click(activityItems[0]);

    const detailsPanel = getByTestId('activity-details');
    expect(detailsPanel).toBeInTheDocument();

    const buildButton = getByTestId('build-with-hivechat-btn');
    expect(buildButton).toBeInTheDocument();
    expect(buildButton.textContent).toBe('Build with Hivechat');
  });

  test('does not render Build with Hivechat button for non-feature_creation content types', async () => {
    const { queryByTestId, getAllByTestId } = render(<Activities />);

    await waitFor(() => {
      expect(activityStore.fetchWorkspaceActivities).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(activityStore.getThreadResponses).toHaveBeenCalled();
    });

    const activityItems = getAllByTestId('touch-target');
    fireEvent.click(activityItems[1]);

    const buildButton = queryByTestId('build-with-hivechat-btn');
    expect(buildButton).not.toBeInTheDocument();
  });

  test('clicking Build with Hivechat button calls createAndNavigateToHivechat', async () => {
    const { getByTestId, getAllByTestId } = render(<Activities />);

    await waitFor(() => {
      expect(activityStore.fetchWorkspaceActivities).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(activityStore.getThreadResponses).toHaveBeenCalled();
    });

    const activityItems = getAllByTestId('touch-target');
    fireEvent.click(activityItems[0]);

    const buildButton = getByTestId('build-with-hivechat-btn');
    fireEvent.click(buildButton);

    expect(createAndNavigateToHivechat).toHaveBeenCalledWith(
      'workspace-uuid',
      'Test Feature Activity',
      'This is test content for the feature activity',
      mockChat,
      mockUI,
      mockHistory
    );
  });

  test('clicking Delete opens delete confirmation modal', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm');

    const { getByTestId, getAllByTestId } = render(<Activities />);

    await waitFor(() => {
      expect(activityStore.fetchWorkspaceActivities).toHaveBeenCalledWith('workspace-uuid');
    });
    await waitFor(() => {
      expect(activityStore.getThreadResponses).toHaveBeenCalled();
    });

    fireEvent.click(getAllByTestId('touch-target')[0]);
    fireEvent.click(within(getByTestId('activity-details-buttons')).getByText('Delete'));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockOpenDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        onDelete: expect.any(Function),
        children: expect.anything()
      })
    );

    confirmSpy.mockRestore();
  });
});
