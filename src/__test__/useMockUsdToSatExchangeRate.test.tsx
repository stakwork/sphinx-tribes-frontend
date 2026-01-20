import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import { useStores } from 'store';
import { useMockUsdToSatExchangeRate } from './__mockStore__/useMockUsdToSatExchangeRate.tsx';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

describe('useMockUsdToSatExchangeRate', () => {
  const mockSetUsdToSatsExchangeRate = jest.fn();
  const mockMath = Object.create(global.Math);
  let originalMath: any;

  beforeEach(() => {
    jest.useFakeTimers();
    mockSetUsdToSatsExchangeRate.mockClear();
    (useStores as jest.Mock).mockReturnValue({
      ui: { setUsdToSatsExchangeRate: mockSetUsdToSatsExchangeRate }
    });
    originalMath = global.Math;
    global.Math = mockMath;
  });

  afterEach(() => {
    jest.useRealTimers();
    global.Math = originalMath;
  });

  test('Standard Input with Default Time', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(0.5 / 0.00000001);
    act(() => {
      jest.advanceTimersByTime(100000);
    });
    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(2);
  });

  test('Standard Input with Custom Time', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true, time: 5000 }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(0.5 / 0.00000001);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(2);
  });

  test('Minimum Time Interval', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true, time: 1 }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(0.5 / 0.00000001);
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(2);
  });

  test('Invalid Time Type', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true, time: 'invalid' as any }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(0.5 / 0.00000001);
    act(() => {
      jest.advanceTimersByTime(100000);
    });
    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(2);
  });

  test('Null Enabled Value', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: null as any }));

    expect(mockSetUsdToSatsExchangeRate).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(100000);
    });
    expect(mockSetUsdToSatsExchangeRate).not.toHaveBeenCalled();
  });

  test('High Frequency Updates', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true, time: 10 }));

    act(() => {
      for (let i = 0; i < 100; i++) {
        jest.advanceTimersByTime(10);
      }
    });

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(101);
  });

  test('Long Duration Execution', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true, time: 1000 }));

    act(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    });

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(86401);
  });

  test('Disabled State', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: false }));

    expect(mockSetUsdToSatsExchangeRate).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(100000);
    });
    expect(mockSetUsdToSatsExchangeRate).not.toHaveBeenCalled();
  });

  test('Boundary Random Value Zero', () => {
    mockMath.random = () => 0;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(1 / 0.00000001);
  });

  test('Boundary Random Value One', () => {
    mockMath.random = () => 1;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(1 / 0.00000001);
  });

  test('Negative Time Interval', () => {
    mockMath.random = () => 0.5;
    renderHook(() => useMockUsdToSatExchangeRate({ enabled: true, time: -1000 }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledWith(0.5 / 0.00000001);
    act(() => {
      jest.advanceTimersByTime(100000);
    });
    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(2);
  });

  test('Cleanup on Unmount', () => {
    mockMath.random = () => 0.5;
    const { unmount } = renderHook(() => useMockUsdToSatExchangeRate({ enabled: true }));

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(100000);
    });

    expect(mockSetUsdToSatsExchangeRate).toHaveBeenCalledTimes(1);
  });
});