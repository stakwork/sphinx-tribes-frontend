import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThinkingModeToggle from '../ThinkingModeToggle';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';

jest.mock('../../../hooks/useFeatureFlag');
const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<typeof useFeatureFlag>;

type FeatureFlagResult = {
  isEnabled: boolean;
  isLoading: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

describe('HiveChatView Feature Flag Tests', () => {
  const defaultProps = {
    isBuild: 'Chat' as const,
    setIsBuild: jest.fn(),
    selectedModel: {
      id: 'model1',
      name: 'Model 1',
      label: 'Model 1',
      value: 'model1'
    },
    setSelectedModel: jest.fn(),
    handleKeyDown: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat toggle when feature flag is enabled', () => {
    mockUseFeatureFlag.mockImplementation(
      (flag) =>
        ({
          isEnabled: flag === 'chat_toggle',
          isLoading: false,
          loading: false,
          refresh: jest.fn().mockResolvedValue(undefined)
        }) as FeatureFlagResult
    );

    render(<ThinkingModeToggle {...defaultProps} />);

    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument(); // Model selector should not be present
  });

  test('does not render chat toggle when feature flag is disabled', () => {
    mockUseFeatureFlag.mockImplementation(
      () =>
        ({
          isEnabled: false,
          isLoading: false,
          loading: false,
          refresh: jest.fn().mockResolvedValue(undefined)
        }) as FeatureFlagResult
    );

    render(<ThinkingModeToggle {...defaultProps} />);

    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    expect(screen.queryByText('Build')).not.toBeInTheDocument();
  });

  test('renders model selector when feature flag is enabled', () => {
    mockUseFeatureFlag.mockImplementation(
      (flag) =>
        ({
          isEnabled: flag === 'chat_model',
          isLoading: false,
          loading: false,
          refresh: jest.fn().mockResolvedValue(undefined)
        }) as FeatureFlagResult
    );

    render(<ThinkingModeToggle {...defaultProps} />);

    waitFor(() => {
      expect(screen.queryByText('Chat')).not.toBeInTheDocument();
      expect(screen.queryByText('Build')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  test('calls setIsBuild when toggle buttons are clicked', () => {
    mockUseFeatureFlag.mockImplementation(
      () =>
        ({
          isEnabled: true,
          isLoading: false,
          loading: false,
          refresh: jest.fn().mockResolvedValue(undefined)
        }) as FeatureFlagResult
    );

    render(<ThinkingModeToggle {...defaultProps} />);

    fireEvent.click(screen.getByText('Build'));
    expect(defaultProps.setIsBuild).toHaveBeenCalledWith('Build');

    fireEvent.click(screen.getByText('Chat'));
    expect(defaultProps.setIsBuild).toHaveBeenCalledWith('Chat');
  });

  test('calls handleKeyDown when key is pressed', () => {
    mockUseFeatureFlag.mockImplementation(
      (flag) =>
        ({
          isEnabled: flag === 'chat_toggle',
          isLoading: false,
          loading: false,
          refresh: jest.fn().mockResolvedValue(undefined)
        }) as FeatureFlagResult
    );

    render(<ThinkingModeToggle {...defaultProps} />);

    const toggleContainer = screen.getByRole('radiogroup');
    fireEvent.keyDown(toggleContainer, { key: 'Enter' });

    expect(defaultProps.handleKeyDown).toHaveBeenCalled();
  });
});
