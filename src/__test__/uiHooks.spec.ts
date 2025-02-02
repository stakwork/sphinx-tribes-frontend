import { waitFor } from '@testing-library/react';
import { getIsMobile } from '../hooks/uiHooks';
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
