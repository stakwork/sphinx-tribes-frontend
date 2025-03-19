import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useStores } from 'store';
import { useHistory, useParams } from 'react-router-dom';
import { createAndNavigateToHivechat } from '../../../../utils/hivechatUtils';
import Activities from './Activities';

jest.mock('../../../../utils/hivechatUtils', () => ({
  createAndNavigateToHivechat: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useParams: jest.fn()
}));

describe('Activities', () => {
  const mockChat = {
    createChat: jest.fn()
  };

  const mockUI = {
    setToasts: jest.fn(),
    meInfo: { owner_alias: 'TestUser' }
  };

  const mockHistory = {
    push: jest.fn()
  };

  const mockActivityStore = {
    rootActivities: [
      {
        ID: '123',
        title: 'Test Feature Activity',
        content: 'This is test content for the feature activity',
        content_type: 'feature_creation',
        workspace: 'workspace-uuid',
        time_created: '2023-01-01T00:00:00Z'
      },
      {
        ID: '456',
        title: 'Non-Feature Activity',
        content: 'This is a general update',
        content_type: 'general_update',
        workspace: 'workspace-uuid',
        time_created: '2023-01-02T00:00:00Z'
      }
    ],
    loadActivities: jest.fn().mockResolvedValue(true),
    getActivity: jest
      .fn()
      .mockImplementation((id) => mockActivityStore.rootActivities.find((a) => a.ID === id))
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({
      chat: mockChat,
      ui: mockUI,
      activityStore: mockActivityStore
    });
    (useHistory as jest.Mock).mockReturnValue(mockHistory);
    (useParams as jest.Mock).mockReturnValue({ uuid: 'workspace-uuid' });

    (createAndNavigateToHivechat as jest.Mock).mockResolvedValue(true);
  });

  test('renders Build with Hivechat button for feature_creation content type', async () => {
    waitFor(() => {
      const { getByTestId, getAllByTestId } = render(<Activities />);

      expect(mockActivityStore.loadActivities).toHaveBeenCalled();

      const activityItems = getAllByTestId('touch-target');
      fireEvent.click(activityItems[0]);

      const detailsPanel = getByTestId('activity-details');
      expect(detailsPanel).toBeInTheDocument();

      const buildButton = getByTestId('build-with-hivechat-btn');
      expect(buildButton).toBeInTheDocument();
      expect(buildButton.textContent).toBe('Build with Hivechat');
    });
  });

  test('does not render Build with Hivechat button for non-feature_creation content types', async () => {
    waitFor(() => {
      const { queryByTestId, getAllByTestId } = render(<Activities />);

      expect(mockActivityStore.loadActivities).toHaveBeenCalled();

      const activityItems = getAllByTestId('touch-target');
      fireEvent.click(activityItems[1]);

      const buildButton = queryByTestId('build-with-hivechat-btn');
      expect(buildButton).not.toBeInTheDocument();
    });
  });

  test('clicking Build with Hivechat button calls createAndNavigateToHivechat', async () => {
    waitFor(() => {
      const { getByTestId, getAllByTestId } = render(<Activities />);

      expect(mockActivityStore.loadActivities).toHaveBeenCalled();

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
  });
});
