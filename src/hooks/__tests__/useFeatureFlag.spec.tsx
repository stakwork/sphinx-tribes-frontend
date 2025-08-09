```
import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { useFeatureFlag } from '../useFeatureFlag';
import { mainStore } from '../../store/main';

jest.mock('../../store/main', () => ({
  mainStore: {
    getFeatureFlags: jest.fn()
  }
}));

describe('useFeatureFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useFeatureFlag('display_planner'));
    expect(result.current.loading).toBe(true);
    expect(result.current.isEnabled).toBe(false);
  });

  it('should return enabled state when flag is enabled', async () => {
    (mainStore.getFeatureFlags as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [
        {
          name: 'display_planner',
          enabled: true,
          uuid: 'test-uuid',
          description: 'test',
          endpoints: []
        }
      ]
    });

    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlag('display_planner'));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.isEnabled).toBe(true);
  });

  it('should return disabled state when flag is disabled', async () => {
    (mainStore.getFeatureFlags as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [
        {
          name: 'display_planner',
          enabled: false,
          uuid: 'test-uuid',
          description: 'test',
          endpoints: []
        }
      ]
    });

    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlag('display_planner'));

    waitFor(() => {
      waitForNextUpdate();
      expect(result.current.loading).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });
  });

  it('should handle errors', async () => {
    (mainStore.getFeatureFlags as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlag('display_planner'));

    waitFor(() => {
      waitForNextUpdate();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.isEnabled).toBe(false);
    });
  });

  it('should refresh the flags when refresh is called', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlag('display_planner'));

    await waitForNextUpdate();

    waitFor(() => {
      result.current.refresh();
      expect(mainStore.getFeatureFlags).toHaveBeenCalledTimes(2);
    });
  });
});
```