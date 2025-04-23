import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { setup, isSupported } from '@loomhq/record-sdk';
import LoomViewerRecorder from '../LoomViewerRecorder';

jest.mock('@loomhq/record-sdk', () => ({
  setup: jest.fn(),
  isSupported: jest.fn()
}));

describe('LoomViewerRecorder', () => {
  const defaultStyle = { width: '100%' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Test Case 1: Unsupported Environment', async () => {
    (isSupported as jest.Mock).mockResolvedValue({
      supported: false,
      error: 'Browser not supported'
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<LoomViewerRecorder style={defaultStyle} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error setting up Loom: Browser not supported');
    });

    consoleSpy.mockRestore();
  });

  it('Test Case 2: Missing Button Element', async () => {
    (isSupported as jest.Mock).mockResolvedValue({ supported: true });
    const configureMock = jest.fn();
    (setup as jest.Mock).mockResolvedValue({ configureButton: configureMock });

    render(<LoomViewerRecorder readOnly={true} style={defaultStyle} />);

    await waitFor(() => {
      expect(configureMock).not.toHaveBeenCalled();
    });
  });

  it('Test Case 3: Standard Flow with All Optional Callbacks Present', async () => {
    (isSupported as jest.Mock).mockResolvedValue({ supported: true });

    const sdkButtonMock = {
      on: jest.fn((event: string, callback: (video: { embedUrl: string }) => void) => {
        if (event === 'insert-click') {
          callback({ embedUrl: 'https://test.url' });
        }
      })
    };

    const configureButtonMock = jest.fn().mockReturnValue(sdkButtonMock);
    (setup as jest.Mock).mockResolvedValue({ configureButton: configureButtonMock });

    const onChangeMock = jest.fn();
    render(<LoomViewerRecorder onChange={onChangeMock} style={defaultStyle} />);

    await waitFor(() => {
      expect(configureButtonMock).toHaveBeenCalled();
      expect(sdkButtonMock.on).toHaveBeenCalledWith('insert-click', expect.any(Function));
      expect(onChangeMock).toHaveBeenCalledWith('https://test.url');
    });
  });

  it('Test Case 4: Standard Flow with Missing Optional Callbacks', async () => {
    (isSupported as jest.Mock).mockResolvedValue({ supported: true });

    const sdkButtonMock = {
      on: jest.fn((event: string, callback: (video: { embedUrl: string }) => void) => {
        if (event === 'insert-click') {
          callback({ embedUrl: 'https://test.url' });
        }
      })
    };

    const configureButtonMock = jest.fn().mockReturnValue(sdkButtonMock);
    (setup as jest.Mock).mockResolvedValue({ configureButton: configureButtonMock });

    render(<LoomViewerRecorder style={defaultStyle} />);

    await waitFor(() => {
      expect(configureButtonMock).toHaveBeenCalled();
      expect(sdkButtonMock.on).toHaveBeenCalled();
    });
  });

  it('Test Case 5: Verify Correct Asynchronous Chaining', async () => {
    (isSupported as jest.Mock).mockResolvedValue({ supported: true });

    const setupPromise = new Promise((resolve: (value: unknown) => void) =>
      setTimeout(
        () =>
          resolve({
            configureButton: jest.fn().mockReturnValue({
              on: jest.fn()
            })
          }),
        100
      )
    );

    (setup as jest.Mock).mockImplementation(() => setupPromise);

    render(<LoomViewerRecorder style={defaultStyle} />);

    await waitFor(() => {
      expect(setup).toHaveBeenCalledWith({
        publicAppId: expect.any(String)
      });
    });
  });

  it("Test Case 6: sdkButton's Event Handler Registration  Multiple Invocations", async () => {
    (isSupported as jest.Mock).mockResolvedValue({ supported: true });

    const sdkButtonMock = {
      on: jest.fn()
    };

    const configureButtonMock = jest.fn().mockReturnValue(sdkButtonMock);
    (setup as jest.Mock).mockResolvedValue({ configureButton: configureButtonMock });

    const { rerender } = render(<LoomViewerRecorder style={defaultStyle} />);

    await waitFor(() => {
      expect(sdkButtonMock.on).toHaveBeenCalledTimes(1);
    });

    rerender(<LoomViewerRecorder onChange={() = data-testid="loom-viewer-recorder-component"> void 0} style={defaultStyle} />);

    await waitFor(() => {
      expect(sdkButtonMock.on).toHaveBeenCalledTimes(2);
    });
  });
});
