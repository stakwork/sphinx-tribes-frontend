import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { useMockWorkspacesData } from '../__test__/__mockStore__/useMockWorkspacesData';
import { mockWorkspaces } from '../__test__/__mockData__/workspace';
import { useStores } from '../store';

jest.mock('../store', () => ({
  useStores: jest.fn()
}));

describe('useMockWorkspacesData', () => {
  const mockSetWorkspaces = jest.fn();
  const mockMain = {
    setWorkspaces: mockSetWorkspaces
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({ main: mockMain });
  });

  it('should set workspaces when enabled is true', () => {
    renderHook(() => useMockWorkspacesData({ enabled: true }));
    expect(mockSetWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
  });

  it('should not set workspaces when enabled is false', () => {
    renderHook(() => useMockWorkspacesData({ enabled: false }));
    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should set workspaces on initial render with enabled true', () => {
    renderHook(() => useMockWorkspacesData({ enabled: true }));
    expect(mockSetWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
  });

  it('should not set workspaces on initial render with enabled false', () => {
    renderHook(() => useMockWorkspacesData({ enabled: false }));
    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should set workspaces when enabled changes from false to true', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockWorkspacesData({ enabled }),
      { initialProps: { enabled: false } }
    );

    expect(mockSetWorkspaces).not.toHaveBeenCalled();

    act(() => {
      rerender({ enabled: true });
    });

    expect(mockSetWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
  });

  it('should not set workspaces when enabled changes from true to false', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockWorkspacesData({ enabled }),
      { initialProps: { enabled: true } }
    );

    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
    mockSetWorkspaces.mockClear();

    act(() => {
      rerender({ enabled: false });
    });

    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should handle invalid data type for enabled', () => {
    renderHook(() => useMockWorkspacesData({ enabled: 'true' as any }));
    expect(mockSetWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should handle null value for enabled', () => {
    renderHook(() => useMockWorkspacesData({ enabled: null as any }));
    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should not trigger effect when dependencies change without enabled change', () => {
    const { rerender } = renderHook(() => useMockWorkspacesData({ enabled: true }));

    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
    mockSetWorkspaces.mockClear();

    act(() => {
      rerender();
    });

    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should not trigger additional effects when enabled value stays the same', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockWorkspacesData({ enabled }),
      { initialProps: { enabled: true } }
    );

    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
    mockSetWorkspaces.mockClear();

    act(() => {
      rerender({ enabled: true });
    });

    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should handle multiple consecutive true values correctly', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockWorkspacesData({ enabled }),
      { initialProps: { enabled: true } }
    );

    expect(mockSetWorkspaces).toHaveBeenCalledTimes(1);
    mockSetWorkspaces.mockClear();

    act(() => {
      rerender({ enabled: true });
      rerender({ enabled: true });
      rerender({ enabled: true });
    });

    expect(mockSetWorkspaces).not.toHaveBeenCalled();
  });

  it('should handle high frequency of updates', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockWorkspacesData({ enabled }),
      { initialProps: { enabled: false } }
    );

    for (let i = 0; i < 10; i++) {
      act(() => {
        rerender({ enabled: true });
        rerender({ enabled: false });
      });
    }

    waitFor(() => {
      expect(mockSetWorkspaces).toHaveBeenCalledTimes(10);
    });
  });
});
