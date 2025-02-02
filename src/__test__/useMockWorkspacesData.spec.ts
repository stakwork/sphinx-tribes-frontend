import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { transformBountyWithPeopleBounty } from '../store/__test__/util';
import { useMockWorkspacesData } from '../__test__/__mockStore__/useMockWorkspacesData';
import { mockWorkspaces } from '../__test__/__mockData__/workspace';
import { useStores } from '../store';
import { useMockBountyData } from './__mockStore__/useMockBountyData';
import { bountyResponse } from './__mockData__/bounty';

jest.mock('../store', () => ({
  useStores: jest.fn()
}));

jest.mock('../store/__test__/util', () => ({
  transformBountyWithPeopleBounty: jest.fn((data: any) => ({ ...data, transformed: true }))
}));

jest.mock('../__test__/__mockData__/bounty', () => ({
  bountyResponse: [{ id: 1, title: 'Test Bounty' }]
}));

describe('useMockWorkspacesData', () => {
  const mockSetWorkspaces = jest.fn();
  const mockSetPeopleBounties = jest.fn();
  const mockMain = {
    setWorkspaces: mockSetWorkspaces,
    setPeopleBounties: mockSetPeopleBounties
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

  it('should call setPeopleBounties when enabled is true', () => {
    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalledWith([
        transformBountyWithPeopleBounty(bountyResponse[0])
      ]);

      expect(mockSetPeopleBounties).toHaveBeenCalledTimes(1);
    });
  });

  it('should not call setPeopleBounties when enabled is false', () => {
    renderHook(() => useMockBountyData({ enabled: false }));
    expect(mockSetPeopleBounties).not.toHaveBeenCalled();
  });

  it('should handle empty bountyResponse gracefully', () => {
    jest.mock('../__test__/__mockData__/bounty', () => ({
      bountyResponse: []
    }));
    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalledWith([]);
    });
  });

  it('should handle single bountyResponse item', () => {
    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalledWith([
        transformBountyWithPeopleBounty(bountyResponse[0])
      ]);
    });
  });

  it('should handle invalid bounty data structure', () => {
    const invalidBounty = { invalid: 'data' };
    (transformBountyWithPeopleBounty as jest.Mock).mockImplementationOnce(() => invalidBounty);
    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalledWith([invalidBounty]);
    });
  });

  it('should handle null bountyResponse', () => {
    (transformBountyWithPeopleBounty as jest.Mock).mockImplementationOnce(() => null);
    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalledWith([null]);
    });
  });

  it('should handle large bountyResponse array', () => {
    const mockData = Array(100).fill({ id: 1, title: 'Test Bounty' });
    (transformBountyWithPeopleBounty as jest.Mock).mockImplementation(() => ({
      ...mockData[0],
      transformed: true
    }));

    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalled();
      expect(mockSetPeopleBounties.mock.calls[0][0]).toHaveLength(1);
    });
  });

  it('should handle complex nested structures in bountyResponse', () => {
    const complexBounty = {
      id: 1,
      title: 'Test Bounty',
      nested: { deep: { structure: { value: 'test' } } }
    };

    (transformBountyWithPeopleBounty as jest.Mock).mockReturnValueOnce({
      ...complexBounty,
      transformed: true
    });

    renderHook(() => useMockBountyData({ enabled: true }));
    waitFor(() => {
      expect(mockSetPeopleBounties).toHaveBeenCalledWith([
        {
          ...complexBounty,
          transformed: true
        }
      ]);
    });
  });

  it('should call setPeopleBounties only when transitioning to enabled: true', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockBountyData({ enabled }),
      { initialProps: { enabled: false } }
    );
    waitFor(() => {
      expect(mockSetPeopleBounties).not.toHaveBeenCalled();

      act(() => {
        rerender({ enabled: true });
      });

      expect(mockSetPeopleBounties).toHaveBeenCalledTimes(1);

      act(() => {
        rerender({ enabled: true });
      });

      expect(mockSetPeopleBounties).toHaveBeenCalledTimes(1);
    });
  });
});
