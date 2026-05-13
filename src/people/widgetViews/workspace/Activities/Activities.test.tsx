import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useHistory, useParams } from 'react-router-dom';
import { useStores } from 'store';
import { activityStore } from 'store/activityStore';
import { IActivity } from 'store/interface';
import { createAndNavigateToHivechat } from '../../../../utils/hivechatUtils';
import Activities from './Activities';

jest.mock('../../../../utils/hivechatUtils', () => ({
  createAndNavigateToHivechat: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('store/activityStore', () => ({
  activityStore: {
    fetchWorkspaceActivities: jest.fn(),
    getThreadResponses: jest.fn().mockResolvedValue([]),
    createThreadResponse: jest.fn(),
    createActivity: jest.fn(),
    deleteActivity: jest.fn(),
    updateActivity: jest.fn(),
    rootActivities: []
  }
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useParams: jest.fn()
}));

jest.mock('components/common/SidebarComponent', () => {
  const MockSidebarComponent = () => <div data-testid="sidebar" />;
  MockSidebarComponent.displayName = 'MockSidebarComponent';
  return MockSidebarComponent;
});

jest.mock('./header', () => {
  const MockActivitiesHeader = () => <div data-testid="activities-header" />;
  MockActivitiesHeader.displayName = 'MockActivitiesHeader';
  return MockActivitiesHeader;
});

jest.mock('../EditableField', () => ({
  EditableField: ({ value }: { value: string }) => <div>{value}</div>
}));

jest.mock('people/utils/RenderMarkdown', () => ({
  renderMarkdown: (value: string) => value
}));

describe('Activities', () => {
  const mockHistory = {
    push: jest.fn()
  };

  const mockRootActivities: IActivity[] = [
    {
      ID: '123',
      title: 'Test Feature Activity',
      content: 'This is test content for the feature activity',
      content_type: 'feature_creation',
      workspace: 'workspace-uuid',
      time_created: '2023-01-01T00:00:00Z',
      time_updated: '2023-01-01T00:00:00Z',
      author: 'human',
      author_ref: 'pubkey',
      feature_uuid: '',
      phase_uuid: '',
      thread_id: '123',
      feedback: '',
      actions: [],
      questions: [],
      sequence: 1,
      status: 'TODO'
    },
    {
      ID: '456',
      title: 'Non-Feature Activity',
      content: 'This is a general update',
      content_type: 'general_update',
      workspace: 'workspace-uuid',
      time_created: '2023-01-02T00:00:00Z',
      time_updated: '2023-01-02T00:00:00Z',
      author: 'human',
      author_ref: 'pubkey',
      feature_uuid: '',
      phase_uuid: '',
      thread_id: '456',
      feedback: '',
      actions: [],
      questions: [],
      sequence: 1,
      status: 'TODO'
    }
  ];

  const mockMain = {
    getWorkspaceFeatures: jest.fn().mockResolvedValue([]),
    getFeaturePhases: jest.fn().mockResolvedValue([]),
    getUserWorkspaceByUuid: jest.fn().mockResolvedValue({ owner_pubkey: 'owner-pubkey' }),
    getUserRoles: jest.fn().mockResolvedValue([]),
    bountyRoles: []
  };

  const mockUI = {
    setToasts: jest.fn(),
    _meInfo: { owner_alias: 'TestUser', owner_pubkey: 'owner-pubkey' },
    meInfo: { owner_alias: 'TestUser', owner_pubkey: 'owner-pubkey' }
  };

  const mockChat = {
    createChat: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({
      main: mockMain,
      ui: mockUI,
      chat: mockChat
    });
    (useHistory as jest.Mock).mockReturnValue(mockHistory);
    (useParams as jest.Mock).mockReturnValue({ uuid: 'workspace-uuid' });
    (createAndNavigateToHivechat as jest.Mock).mockResolvedValue(true);

    const mockedActivityStore = activityStore as typeof activityStore & {
      fetchWorkspaceActivities: jest.Mock;
      getThreadResponses: jest.Mock;
      createThreadResponse: jest.Mock;
      createActivity: jest.Mock;
      deleteActivity: jest.Mock;
      updateActivity: jest.Mock;
      rootActivities: IActivity[];
    };

    mockedActivityStore.rootActivities = mockRootActivities;
    mockedActivityStore.fetchWorkspaceActivities.mockResolvedValue(undefined);
    mockedActivityStore.getThreadResponses.mockResolvedValue([]);
    mockedActivityStore.createThreadResponse.mockResolvedValue(null);
    mockedActivityStore.createActivity.mockResolvedValue(null);
    mockedActivityStore.deleteActivity.mockResolvedValue(true);
    mockedActivityStore.updateActivity.mockResolvedValue(true);
  });

  test('renders Build with Hivechat button for feature_creation content type', async () => {
    render(<Activities />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-details')).toBeTruthy();
    });

    expect(screen.getByTestId('build-with-hivechat-btn')).toBeTruthy();
    expect(screen.getByTestId('build-with-hivechat-btn').textContent).toBe('Build with Hivechat');
  });

  test('does not render Build with Hivechat button for non-feature_creation content types', async () => {
    render(<Activities />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-details')).toBeTruthy();
    });

    const activityItems = screen.getAllByTestId('touch-target');
    fireEvent.click(activityItems[1]);

    expect(screen.queryByTestId('build-with-hivechat-btn')).toBeNull();
  });

  test('clicking Build with Hivechat button calls createAndNavigateToHivechat', async () => {
    render(<Activities />);

    await waitFor(() => {
      expect(screen.getByTestId('build-with-hivechat-btn')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('build-with-hivechat-btn'));

    expect(createAndNavigateToHivechat).toHaveBeenCalledWith(
      'workspace-uuid',
      'Test Feature Activity',
      'This is test content for the feature activity',
      mockChat,
      mockUI,
      mockHistory
    );
  });

  test('opens reply modal and closes it from the close button', async () => {
    render(<Activities />);

    await waitFor(() => {
      expect(screen.getByText('Reply')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Reply'));

    expect(screen.getByTestId('activity-modal-overlay')).toBeTruthy();
    expect(screen.getByText('Create New Activity')).toBeTruthy();

    fireEvent.click(screen.getByTestId('close-activity-modal'));

    await waitFor(() => {
      expect(screen.queryByTestId('activity-modal-overlay')).toBeNull();
    });
  });
});
