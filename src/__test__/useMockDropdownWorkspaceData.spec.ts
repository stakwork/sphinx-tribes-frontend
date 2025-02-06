import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { useStores } from 'store';
import { act } from 'react-dom/test-utils';
import { useMockDropdownWorkspaceData } from './__mockStore__/useMockDropdownWorkspaceData';
import { mockWorkspaces } from './__mockData__/workspace';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

describe('useMockDropdownWorkspaceData', () => {
  const mockSetDropdownWorkspaces = jest.fn();
  const mockMain = {
    setDropdownWorkspaces: mockSetDropdownWorkspaces
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({ main: mockMain });
  });

  it('should set workspaces when enabled is true with valid personId', () => {
    renderHook(() => useMockDropdownWorkspaceData({ personId: '123', enabled: true }));
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should set workspaces when enabled is true without personId', () => {
    renderHook(() => useMockDropdownWorkspaceData({ enabled: true }));
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should not set workspaces when enabled is false with valid personId', () => {
    renderHook(() => useMockDropdownWorkspaceData({ personId: '123', enabled: false }));
    expect(mockSetDropdownWorkspaces).not.toHaveBeenCalled();
  });

  it('should not set workspaces when enabled is false without personId', () => {
    renderHook(() => useMockDropdownWorkspaceData({ enabled: false }));
    expect(mockSetDropdownWorkspaces).not.toHaveBeenCalled();
  });

  it('should handle empty string as personId', () => {
    renderHook(() => useMockDropdownWorkspaceData({ personId: '', enabled: true }));
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should handle null personId', () => {
    renderHook(() => useMockDropdownWorkspaceData({ personId: null as any, enabled: true }));
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should handle large number of calls with enabled true', () => {
    const { rerender } = renderHook(() =>
      useMockDropdownWorkspaceData({ personId: '123', enabled: true })
    );

    for (let i = 0; i < 100; i++) {
      rerender();
    }

    expect(mockSetDropdownWorkspaces).toHaveBeenCalledTimes(1);
  });

  it('should handle large number of calls with enabled false', () => {
    const { rerender } = renderHook(() =>
      useMockDropdownWorkspaceData({ personId: '123', enabled: false })
    );

    for (let i = 0; i < 100; i++) {
      rerender();
    }

    expect(mockSetDropdownWorkspaces).not.toHaveBeenCalled();
  });

  it('should handle changing enabled from false to true', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useMockDropdownWorkspaceData({ personId: '123', enabled }),
      { initialProps: { enabled: false } }
    );

    expect(mockSetDropdownWorkspaces).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should handle changing personId with enabled true', () => {
    const { rerender } = renderHook(
      ({ personId }: { personId: string }) =>
        useMockDropdownWorkspaceData({ personId, enabled: true }),
      { initialProps: { personId: '123' } }
    );

    expect(mockSetDropdownWorkspaces).toHaveBeenCalledTimes(1);

    rerender({ personId: '456' });
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledTimes(2);
  });

  it('should handle undefined personId with enabled true', () => {
    renderHook(() => useMockDropdownWorkspaceData({ personId: undefined, enabled: true }));
    expect(mockSetDropdownWorkspaces).toHaveBeenCalledWith(mockWorkspaces);
  });

  it('should handle rapid toggle of enabled', async () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useMockDropdownWorkspaceData({ personId: '123', enabled }),
      { initialProps: { enabled: false } }
    );

    for (let i = 0; i < 10; i++) {
      act(() => {
        rerender({ enabled: true });
        rerender({ enabled: false });
      });
    }

    waitFor(() => {
      expect(mockSetDropdownWorkspaces).toHaveBeenCalledTimes(10);
    });
  });
});
