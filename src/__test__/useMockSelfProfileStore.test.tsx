```
import { renderHook } from '@testing-library/react-hooks';
import { useStores } from 'store';
import { waitFor } from '@testing-library/react';
import { user } from '__test__/__mockData__/user';
import { useMockSelfProfileStore } from './__mockStore__/useMockSelfProfileStore';

jest.mock('store');

describe('useMockSelfProfileStore', () => {
  const mockSetMeInfo = jest.fn();
  const mockSetSelectedPerson = jest.fn();
  const mockSetActivePerson = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useStores as jest.Mock).mockReturnValue({
      ui: {
        setMeInfo: mockSetMeInfo,
        setSelectedPerson: mockSetSelectedPerson
      },
      main: {
        setActivePerson: mockSetActivePerson
      }
    });
  });

  it('should set store values when enabled is true', () => {
    renderHook(() => useMockSelfProfileStore({ enabled: true }));

    expect(mockSetMeInfo).toHaveBeenCalledWith(user);
    expect(mockSetSelectedPerson).toHaveBeenCalledWith(user.id);
    expect(mockSetActivePerson).toHaveBeenCalledWith(
      expect.objectContaining({
        ...user,
        unique_name: expect.any(String),
        tags: []
      })
    );

    expect(mockSetMeInfo).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedPerson).toHaveBeenCalledTimes(1);
    expect(mockSetActivePerson).toHaveBeenCalledTimes(1);
  });

  it('should not set store values when enabled is false', () => {
    renderHook(() => useMockSelfProfileStore({ enabled: false }));

    expect(mockSetMeInfo).not.toHaveBeenCalled();
    expect(mockSetSelectedPerson).not.toHaveBeenCalled();
    expect(mockSetActivePerson).not.toHaveBeenCalled();
  });

  it('should handle re-renders without duplicate calls', () => {
    const { rerender } = renderHook(() => useMockSelfProfileStore({ enabled: true }));

    expect(mockSetMeInfo).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedPerson).toHaveBeenCalledTimes(1);
    expect(mockSetActivePerson).toHaveBeenCalledTimes(1);

    rerender();

    expect(mockSetMeInfo).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedPerson).toHaveBeenCalledTimes(1);
    expect(mockSetActivePerson).toHaveBeenCalledTimes(1);
  });

  it('should handle enabled prop changes', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockSelfProfileStore({ enabled }),
      {
        initialProps: { enabled: false }
      }
    );

    expect(mockSetMeInfo).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(mockSetMeInfo).toHaveBeenCalledWith(user);
    expect(mockSetSelectedPerson).toHaveBeenCalledWith(user.id);
    expect(mockSetActivePerson).toHaveBeenCalled();
  });

  it('should generate unique name for each call when enabled', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMockSelfProfileStore({ enabled }),
      {
        initialProps: { enabled: true }
      }
    );

    const firstCall = mockSetActivePerson.mock.calls[0][0].unique_name;

    rerender({ enabled: true });

    waitFor(() => {
      const secondCall = mockSetActivePerson.mock.calls[1][0].unique_name;

      expect(firstCall).not.toBe(secondCall);
    });
  });
});
```