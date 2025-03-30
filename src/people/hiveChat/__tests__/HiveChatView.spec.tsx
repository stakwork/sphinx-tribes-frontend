import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { chatHistoryStore } from 'store/chat';
import { HiveChatView } from '../index';
import ThinkingModeToggle from '../ThinkingModeToggle';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';

jest.mock('../index', () => ({
  HiveChatView: () => <div>Mocked HiveChatView</div>
}));

jest.mock('../../../helpers/codeFormatter', () => ({
  formatCodeWithPrettier: jest.fn((code) => code)
}));

jest.mock('../../../hooks/useFeatureFlag');
const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<typeof useFeatureFlag>;

jest.mock('store/chat', () => ({
  chatHistoryStore: {
    loadChatHistory: jest.fn(),
    getChat: jest.fn(),
    updateChat: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({ uuid: 'test-uuid', chatId: 'test-chat-id' })),
  useNavigate: jest.fn()
}));

jest.mock('../../../config/socket', () => ({
  createSocketInstance: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    id: 'test-socket-id'
  })),
  SOCKET_MSG: {
    CHAT_LOG: 'chat_log'
  }
}));

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

describe('HiveChatView Chat Title', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (chatHistoryStore.getChat as jest.Mock).mockReturnValue({ title: 'Initial Title' });
  });

  test('should not refresh title while editing', async () => {
    render(<HiveChatView />);

    waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Enter chat title...'), {
        target: { value: 'New Title' }
      });

      document.dispatchEvent(new Event('visibilitychange'));

      expect(chatHistoryStore.loadChatHistory).not.toHaveBeenCalled();
    });
  });

  test('should refresh title when tab becomes visible', async () => {
    render(<HiveChatView />);

    waitFor(() => {
      document.dispatchEvent(new Event('visibilitychange'));

      expect(chatHistoryStore.loadChatHistory).toHaveBeenCalled();
    });
  });

  test('should refresh title when window regains focus', async () => {
    render(<HiveChatView />);

    waitFor(() => {
      window.dispatchEvent(new Event('focus'));

      expect(chatHistoryStore.loadChatHistory).toHaveBeenCalled();
    });
  });

  test('should update title in UI when backend title changes', async () => {
    waitFor(() => {
      (chatHistoryStore.getChat as jest.Mock).mockReturnValue({ title: 'Initial Title' });

      render(<HiveChatView />);

      expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();

      (chatHistoryStore.loadChatHistory as jest.Mock).mockImplementation(() => {
        (chatHistoryStore.getChat as jest.Mock).mockReturnValue({ title: 'Updated Title' });
        return Promise.resolve();
      });

      window.dispatchEvent(new Event('focus'));

      expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument();
    });
  });

  test('should handle errors during title refresh without breaking UI', async () => {
    waitFor(() => {
      (chatHistoryStore.loadChatHistory as jest.Mock).mockRejectedValue(new Error('Network error'));

      jest.spyOn(console, 'error').mockImplementation(() => {
        ('');
      });

      render(<HiveChatView />);

      window.dispatchEvent(new Event('focus'));

      expect(console.error).toHaveBeenCalled();

      expect(screen.getByPlaceholderText('Enter chat title...')).toBeInTheDocument();

      (console.error as jest.Mock).mockRestore();
    });
  });
});

describe('HiveChatView New Chat Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (chatHistoryStore.getChat as jest.Mock).mockReturnValue({ title: 'Test Chat' });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  test('should ensure New Chat button remains visible on all screen sizes', async () => {
    waitFor(() => {
      render(<HiveChatView />);

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

      Object.defineProperty(window, 'innerWidth', { value: 768 });
      window.dispatchEvent(new Event('resize'));

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

      Object.defineProperty(window, 'innerWidth', { value: 480 });
      window.dispatchEvent(new Event('resize'));

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });

  test('should maintain button visibility when title is very long', async () => {
    (chatHistoryStore.getChat as jest.Mock).mockReturnValue({
      title:
        'This is an extremely long chat title that could potentially cause layout issues on smaller screens by pushing buttons out of view'
    });

    waitFor(() => {
      render(<HiveChatView />);

      Object.defineProperty(window, 'innerWidth', { value: 600 });
      window.dispatchEvent(new Event('resize'));

      const titleInput = screen.getByPlaceholderText('Enter chat title...');
      const addButton = screen.getByRole('button', { name: /add/i });

      expect(titleInput).toBeInTheDocument();
      expect(addButton).toBeInTheDocument();

      const buttonRect = addButton.getBoundingClientRect();

      expect(buttonRect.right).toBeLessThanOrEqual(window.innerWidth);
    });
  });
});
