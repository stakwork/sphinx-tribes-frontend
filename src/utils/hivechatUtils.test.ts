import { createAndNavigateToHivechat } from './hivechatUtils';

describe('createAndNavigateToHivechat', () => {
  const mockChat = {
    createChat: jest.fn()
  };

  const mockUI = {
    setToasts: jest.fn()
  };

  const mockHistory = {
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    });
  });

  test('successfully creates chat and navigates', async () => {
    mockChat.createChat.mockResolvedValue({ id: 'new-chat-id' });

    const result = await createAndNavigateToHivechat(
      'workspace-uuid',
      'Test Activity',
      'Activity content',
      mockChat as any,
      mockUI as any,
      mockHistory
    );

    expect(result).toBe(true);
    expect(mockChat.createChat).toHaveBeenCalledWith(
      'workspace-uuid',
      'Build from Hivechat: Test Activity'
    );
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      'pending-hivechat-message',
      'Activity content'
    );
    expect(mockHistory.push).toHaveBeenCalledWith('/workspace/workspace-uuid/hivechat/new-chat-id');
  });

  test('handles chat creation failure', async () => {
    mockChat.createChat.mockResolvedValue(null);

    const result = await createAndNavigateToHivechat(
      'workspace-uuid',
      'Test Activity',
      'Activity content',
      mockChat as any,
      mockUI as any,
      mockHistory
    );

    expect(result).toBe(false);
    expect(mockUI.setToasts).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Error',
        color: 'danger'
      })
    ]);
    expect(mockHistory.push).not.toHaveBeenCalled();
  });

  test('handles exceptions', async () => {
    mockChat.createChat.mockRejectedValue(new Error('API error'));

    const result = await createAndNavigateToHivechat(
      'workspace-uuid',
      'Test Activity',
      'Activity content',
      mockChat as any,
      mockUI as any,
      mockHistory
    );

    expect(result).toBe(false);
    expect(mockUI.setToasts).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Error',
        color: 'danger'
      })
    ]);
    expect(mockHistory.push).not.toHaveBeenCalled();
  });
});
