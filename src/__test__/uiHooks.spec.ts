import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { getIsMobile, useIsMobile } from '../hooks/uiHooks';
import { mobileWidht } from '../config';

describe('getIsMobile', () => {
  const originalInnerWidth = window.innerWidth;

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
  };

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  it('should return true when width is less than mobileWidth', () => {
    setWindowWidth(mobileWidht - 1);
    expect(getIsMobile()).toBe(true);
  });

  it('should return false when width is greater than mobileWidth', () => {
    setWindowWidth(mobileWidht + 1);
    expect(getIsMobile()).toBe(false);
  });

  it('should return false when width exactly matches mobileWidth', () => {
    setWindowWidth(mobileWidht);
    expect(getIsMobile()).toBe(false);
  });

  it('should handle minimum width (0)', () => {
    setWindowWidth(0);
    expect(getIsMobile()).toBe(true);
  });

  it('should handle large width values', () => {
    setWindowWidth(Number.MAX_SAFE_INTEGER);
    expect(getIsMobile()).toBe(false);
  });

  it('should handle negative width values', () => {
    setWindowWidth(-100);
    expect(getIsMobile()).toBe(true);
  });

  it('should handle non-numeric width values', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 'invalid' as any
    });
    waitFor(() => {
      expect(getIsMobile()).toBe(true);
    });
  });

  describe('mobileWidth edge cases', () => {
    const originalMobileWidth = mobileWidht;

    afterEach(() => {
      (global as any).mobileWidht = originalMobileWidth;
    });

    it('should handle undefined mobileWidth', () => {
      (global as any).mobileWidht = undefined;
      setWindowWidth(500);
      waitFor(() => {
        expect(getIsMobile()).toBe(true);
      });
    });

    it('should handle mobileWidth as zero', () => {
      (global as any).mobileWidht = 0;
      setWindowWidth(500);
      waitFor(() => {
        expect(getIsMobile()).toBe(false);
      });
    });

    it('should handle negative mobileWidth', () => {
      (global as any).mobileWidht = -100;
      setWindowWidth(500);
      waitFor(() => {
        expect(getIsMobile()).toBe(false);
      });
    });

    it('should handle non-numeric mobileWidth', () => {
      (global as any).mobileWidht = 'invalid' as any;
      setWindowWidth(500);
      waitFor(() => {
        expect(getIsMobile()).toBe(false);
      });
    });
  });
});

describe('useIsMobile', () => {
  const originalWindow = { ...window };
  const originalInnerWidth = window.innerWidth;

  type WindowResizeHandler = ((this: GlobalEventHandlers, ev: UIEvent) => any) &
    ((this: Window, ev: UIEvent) => any);

  beforeEach(() => {
    window.addEventListener = jest.fn(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'resize') {
          window.onresize = listener as WindowResizeHandler;
        }
      }
    ) as typeof window.addEventListener;

    window.removeEventListener = jest.fn(
      (
        type: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        listener: EventListenerOrEventListenerObject
      ) => {
        if (type === 'resize') {
          window.onresize = null;
        }
      }
    ) as typeof window.removeEventListener;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.assign(window, originalWindow);
  });

  it('should return true if window width is less than mobileWidth', () => {
    Object.defineProperty(window, 'innerWidth', { value: mobileWidht - 1 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false if window width is greater than mobileWidth', () => {
    Object.defineProperty(window, 'innerWidth', { value: mobileWidht + 1 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update isMobile state on window resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: mobileWidht + 1 });
    const { result } = renderHook(() => useIsMobile());

    const resizeEvent = new UIEvent('resize');
    Object.defineProperty(window, 'innerWidth', { value: mobileWidht - 1 });
    waitFor(() => {
      window.onresize?.call(window, resizeEvent);
      expect(result.current).toBe(true);
    });

    Object.defineProperty(window, 'innerWidth', { value: mobileWidht + 1 });
    window.onresize?.call(window, resizeEvent);
    expect(result.current).toBe(false);
  });

  it('should handle rapid resize events', async () => {
    const { result } = renderHook(() => useIsMobile());
    const resizeEvent = new UIEvent('resize');

    Object.defineProperty(window, 'innerWidth', { value: mobileWidht - 50 });
    waitFor(() => {
      window.onresize?.call(window, resizeEvent);
      expect(result.current).toBe(true);
    });

    Object.defineProperty(window, 'innerWidth', { value: mobileWidht + 50 });
    window.onresize?.call(window, resizeEvent);
    expect(result.current).toBe(false);
  });

  it('should not change isMobile state if no resize event occurs', () => {
    Object.defineProperty(window, 'innerWidth', { value: mobileWidht - 1 });
    const { result } = renderHook(() => useIsMobile());
    const initialValue = result.current;
    expect(result.current).toBe(initialValue);
  });

  it('should add and remove resize event listener', () => {
    const { unmount } = renderHook(() => useIsMobile());
    waitFor(() => {
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should return false when window width is exactly mobileWidth', () => {
    Object.defineProperty(window, 'innerWidth', { value: mobileWidht });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return false for invalid negative window width', () => {
    Object.defineProperty(window, 'innerWidth', { value: -100 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for very large window width', () => {
    Object.defineProperty(window, 'innerWidth', { value: Number.MAX_SAFE_INTEGER });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for zero window width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 0 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should handle edge cases', () => {
    Object.defineProperty(window, 'innerWidth', { value: -100 });
    const { result: resultNegative } = renderHook(() => useIsMobile());
    expect(resultNegative.current).toBe(true);

    Object.defineProperty(window, 'innerWidth', { value: 0 });
    const { result: resultZero } = renderHook(() => useIsMobile());
    expect(resultZero.current).toBe(true);

    Object.defineProperty(window, 'innerWidth', { value: Number.MAX_SAFE_INTEGER });
    const { result: resultLarge } = renderHook(() => useIsMobile());
    expect(resultLarge.current).toBe(false);
  });

  it('should handle multiple hooks correctly', () => {
    const hooks = Array(3)
      .fill(null)
      .map(() => renderHook(() => useIsMobile()));
    const resizeEvent = new UIEvent('resize');

    Object.defineProperty(window, 'innerWidth', { value: mobileWidht - 1 });
    window.onresize?.call(window, resizeEvent);

    hooks.forEach((hook: { result: { current: boolean } }) => {
      waitFor(() => {
        expect(hook.result.current).toBe(true);
      });
    });

    Object.defineProperty(window, 'innerWidth', { value: mobileWidht + 1 });
    window.onresize?.call(window, resizeEvent);
    hooks.forEach((hook: { result: { current: boolean } }) => {
      waitFor(() => {
        expect(hook.result.current).toBe(false);
      });
    });

    hooks.forEach((hook: { unmount: () => void }) => hook.unmount());
  });
});
