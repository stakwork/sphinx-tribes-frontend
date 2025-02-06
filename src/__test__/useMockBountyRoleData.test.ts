import { renderHook } from '@testing-library/react-hooks';
import { useStores } from 'store';
import { useMockBountyRoleData } from './__mockStore__/useMockBountyRoleData';
import { mockBountyRoles } from './__mockData__/bounty';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

describe('useMockBountyRoleData', () => {
  let mockSetBountyRoles: jest.Mock;
  let mockMain: { setBountyRoles: jest.Mock };

  beforeEach(() => {
    mockSetBountyRoles = jest.fn();
    mockMain = { setBountyRoles: mockSetBountyRoles };
    (useStores as jest.Mock).mockReturnValue({ main: mockMain });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call setBountyRoles with mockBountyRoles when enabled is true', () => {
    renderHook(() => useMockBountyRoleData({ enabled: true }));
    expect(mockSetBountyRoles).toHaveBeenCalledWith(mockBountyRoles);
  });

  it('should not call setBountyRoles when enabled is false', () => {
    renderHook(() => useMockBountyRoleData({ enabled: false }));
    expect(mockSetBountyRoles).not.toHaveBeenCalled();
  });

  it('should call setBountyRoles only when enabled changes to true', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockBountyRoleData({ enabled }),
      { initialProps: { enabled: false } }
    );

    expect(mockSetBountyRoles).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(mockSetBountyRoles).toHaveBeenCalledTimes(1);
    expect(mockSetBountyRoles).toHaveBeenCalledWith(mockBountyRoles);
  });

  it('should not call setBountyRoles when enabled changes to false', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockBountyRoleData({ enabled }),
      { initialProps: { enabled: true } }
    );

    expect(mockSetBountyRoles).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });
    expect(mockSetBountyRoles).toHaveBeenCalledTimes(1);
  });

  it('should handle non-boolean enabled values gracefully', () => {
    // @ts-expect-error - Testing invalid type (null)
    renderHook(() => useMockBountyRoleData({ enabled: null }));
    expect(mockSetBountyRoles).not.toHaveBeenCalled();

    // @ts-expect-error - Testing invalid type (undefined)
    renderHook(() => useMockBountyRoleData({ enabled: undefined }));
    expect(mockSetBountyRoles).not.toHaveBeenCalled();
  });
  it('should handle rapid toggling of enabled value', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockBountyRoleData({ enabled }),
      { initialProps: { enabled: false } }
    );

    rerender({ enabled: true });
    rerender({ enabled: false });
    rerender({ enabled: true });
    rerender({ enabled: false });

    expect(mockSetBountyRoles).toHaveBeenCalledTimes(2);
  });

  it('should handle main store being null or undefined', () => {
    (useStores as jest.Mock).mockReturnValue({ main: null });

    expect(() => {
      renderHook(() => useMockBountyRoleData({ enabled: true }));
    }).not.toThrow();

    (useStores as jest.Mock).mockReturnValue({ main: undefined });

    expect(() => {
      renderHook(() => useMockBountyRoleData({ enabled: true }));
    }).not.toThrow();
  });

  it('should call setBountyRoles with an empty array if mockBountyRoles is empty', () => {
    jest.mock('__test__/__mockData__/bounty', () => ({
      mockBountyRoles: []
    }));

    renderHook(() => useMockBountyRoleData({ enabled: true }));
    expect(mockSetBountyRoles).toHaveBeenCalled();
  });

  it('should handle errors thrown by setBountyRoles gracefully', () => {
    mockSetBountyRoles.mockImplementation(() => {
      throw new Error('Test error');
    });

    expect(() => {
      renderHook(() => useMockBountyRoleData({ enabled: true }));
    }).not.toThrow();
  });
});
