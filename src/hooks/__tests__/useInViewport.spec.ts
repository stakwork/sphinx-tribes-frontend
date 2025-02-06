import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useInViewPort } from 'hooks/useInViewport';
import { IntersectionOptions } from 'react-intersection-observer';

const defaultOptions: IntersectionOptions = {};

describe('useInViewport hook', () => {
  interface Window {
    IntersectionObserver: unknown;
  }

  const prepareForTesting = (isIntersecting: boolean): void => {
    const mockedIntersectionObserver = jest.fn((callback: any) => {
      callback([{ isIntersecting }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn()
      };
    });

    (window as Window).IntersectionObserver = mockedIntersectionObserver;
  };

  it('should initialize the inView state to false', () => {
    prepareForTesting(false);

    const { result } = renderHook(() => useInViewPort(defaultOptions));
    expect(result.current[0]).toBe(false);
  });

  it('should not detect element when reference is not connected', () => {
    prepareForTesting(false);

    const { result } = renderHook(() => useInViewPort(defaultOptions));
    const [isVisible, ref] = result.current;

    expect(ref.current).toBe(null);
    expect(isVisible).toBe(false);
  });

  it('should detect element after scroll', () => {
    prepareForTesting(true);

    const element = document.createElement('div');

    const { result } = renderHook(() => useInViewPort(defaultOptions));

    const [isVisible, ref] = result.current;

    ref.current = element;

    renderHook(() => useInViewPort(defaultOptions));

    expect(isVisible).toBe(true);
  });

  describe('prepareForTesting function', () => {
    beforeEach(() => {
      delete (window as Window).IntersectionObserver;
    });

    test('Test with isIntersecting as true', () => {
      prepareForTesting(true);

      const mockedObserver = (window as Window).IntersectionObserver as jest.Mock;
      const mockCallback = jest.fn();

      mockedObserver(mockCallback);
      expect(mockCallback).toHaveBeenCalledWith([{ isIntersecting: true }]);
    });

    test('Test with isIntersecting as false', () => {
      prepareForTesting(false);

      const mockedObserver = (window as Window).IntersectionObserver as jest.Mock;
      const mockCallback = jest.fn();

      mockedObserver(mockCallback);
      expect(mockCallback).toHaveBeenCalledWith([{ isIntersecting: false }]);
    });

    test('Test with multiple calls to prepareForTesting', () => {
      prepareForTesting(true);
      const firstObserver = (window as Window).IntersectionObserver;

      prepareForTesting(false);
      const secondObserver = (window as Window).IntersectionObserver;

      expect(firstObserver).not.toBe(secondObserver);

      const mockCallback = jest.fn();
      (secondObserver as jest.Mock)(mockCallback);
      expect(mockCallback).toHaveBeenCalledWith([{ isIntersecting: false }]);
    });

    test('Test with invalid input type', () => {
      // @ts-expect-error - Testing with invalid input
      prepareForTesting('not-a-boolean');

      const mockedObserver = (window as Window).IntersectionObserver as jest.Mock;
      const mockCallback = jest.fn();

      mockedObserver(mockCallback);

      waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith([{ isIntersecting: true }]);
      });
    });

    test('Test with null input', () => {
      // @ts-expect-error - Testing with null input
      prepareForTesting(null);

      const mockedObserver = (window as Window).IntersectionObserver as jest.Mock;
      const mockCallback = jest.fn();

      mockedObserver(mockCallback);

      waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith([{ isIntersecting: false }]);
      });

      const instance = mockedObserver(mockCallback);
      waitFor(() => {
        expect(instance.observe).toBeDefined();
        expect(instance.unobserve).toBeDefined();
      });
    });
  });
});
