import { renderHook, act } from '@testing-library/react-hooks';
import { useSidebarCollapse } from '../useSidebarCollapse';

declare global {
  interface Window {
    sidebarCollapse?: boolean;
  }
}

describe('useSidebarCollapse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sidebarCollapse = undefined;
  });

  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('should initialize with default collapsed state as false', () => {
    const { result } = renderHook(() => useSidebarCollapse());
    expect(result.current.collapsed).toBe(false);
  });

  test('should initialize with provided collapsed state', () => {
    const { result } = renderHook(() => useSidebarCollapse(true));
    expect(result.current.collapsed).toBe(true);
  });

  test('should add event listener on mount', () => {
    renderHook(() => useSidebarCollapse());
    expect(addEventListenerSpy).toHaveBeenCalledWith('sidebarCollapse', expect.any(Function));
  });

  test('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useSidebarCollapse());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('sidebarCollapse', expect.any(Function));
  });

  test('toggleCollapseSidebar should update collapsed state', () => {
    const { result } = renderHook(() => useSidebarCollapse(false));

    act(() => {
      result.current.toggleCollapseSidebar(true);
    });

    expect(result.current.collapsed).toBe(true);
  });

  test('toggleCollapseSidebar should dispatch custom event', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useSidebarCollapse(false));

    act(() => {
      result.current.toggleCollapseSidebar(true);
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sidebarCollapse',
        detail: { collapsed: true }
      })
    );

    dispatchEventSpy.mockRestore();
  });

  test('should update state when receiving sidebarCollapse event', () => {
    const { result } = renderHook(() => useSidebarCollapse(false));

    act(() => {
      const event = new CustomEvent('sidebarCollapse', {
        detail: { collapsed: true }
      });
      window.dispatchEvent(event);
    });

    expect(result.current.collapsed).toBe(true);
  });

  test('toggleCollapseSidebar should toggle the state correctly multiple times', () => {
    const { result } = renderHook(() => useSidebarCollapse(false));

    act(() => {
      result.current.toggleCollapseSidebar(true);
    });
    expect(result.current.collapsed).toBe(true);

    act(() => {
      result.current.toggleCollapseSidebar(false);
    });
    expect(result.current.collapsed).toBe(false);

    act(() => {
      result.current.toggleCollapseSidebar(true);
    });
    expect(result.current.collapsed).toBe(true);
  });
});
