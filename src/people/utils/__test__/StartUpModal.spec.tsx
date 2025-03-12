import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StartUpModal from '../StartUpModal';
import api from '../../../api';
import { useStores } from '../../../store';

jest.mock('../../../api');
jest.mock('../../../store');
jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component
}));

const mockOpen = jest.fn();
window.open = mockOpen;

describe('StartUpModal', () => {
  const mockCloseModal = jest.fn();
  const mockSetShowSignIn = jest.fn();
  const mockDataObject = 'test-data';

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({
      ui: {
        meInfo: null,
        setShowSignIn: mockSetShowSignIn
      }
    });
  });

  it('renders initial state (StepTwo view) correctly', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    waitFor(() => {
      expect(screen.getByTestId('step-two')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Download App')).toBeInTheDocument();
      expect(screen.getByText('Android')).toBeInTheDocument();
      expect(screen.getByText('IOS')).toBeInTheDocument();
    });
  });

  it('opens correct URL when Android button is clicked', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Android'));
    expect(mockOpen).toHaveBeenCalledWith(
      'https://play.google.com/store/apps/details?id=chat.sphinx.v2&hl=en_US',
      '_blank'
    );
  });

  it('opens correct URL when IOS button is clicked', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('IOS'));
    expect(mockOpen).toHaveBeenCalledWith('https://testflight.apple.com/join/p721ALD9', '_blank');
  });

  it('calls API and changes step when Reveal Connection Code is clicked', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));

    waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('connectioncodes');
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
    });
  });

  it('handles case when API returns no connection string', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));

    waitFor(() => {
      expect(
        screen.getByText('We are out of codes to sign up! Please check again later.')
      ).toBeInTheDocument();
    });
  });

  it('resets step when Back button is clicked in QR view', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));
    waitFor(() => {
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back'));
    waitFor(() => {
      expect(screen.getByTestId('step-two')).toBeInTheDocument();
    });
  });

  it('calls closeModal and setShowSignIn when Sign in button is clicked', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Sign in'));

    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockSetShowSignIn).toHaveBeenCalledWith(true);
  });

  it('does not call API when ui.meInfo exists', async () => {
    (useStores as jest.Mock).mockReturnValue({
      ui: {
        meInfo: { some: 'data' },
        setShowSignIn: mockSetShowSignIn
      }
    });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));
    waitFor(() => {
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  it('does not call API when connection_string already exists', async () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText('Back'));

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  it('updates step when clicking on Android button', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Android'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('updates step when clicking on IOS button', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('IOS'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('handles empty connection string response', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await screen.findByText('We are out of codes to sign up! Please check again later.');
  });

  it('maintains step state between renders', () => {
    const { rerender } = render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Android'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();

    rerender(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('should preserve connection string after multiple step changes', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-string' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    fireEvent.click(screen.getByText('Back'));

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  it('should maintain QR code visibility after component re-renders', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-string' });

    const { rerender } = render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    rerender(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    expect(screen.getByTestId('qrcode')).toBeInTheDocument();
  });

  describe('DisplayQRCode Component', () => {
    it('renders QR code when connection_string is valid', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

      render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('qrcode')).toBeInTheDocument();
        expect(
          screen.getByText('Install the Sphinx app on your phone and then scan this QRcode')
        ).toBeInTheDocument();
      });
    });

    it('renders out of codes message when connection_string is undefined', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: undefined });

      render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(
          screen.getByText('We are out of codes to sign up! Please check again later.')
        ).toBeInTheDocument();
      });
    });

    it('renders out of codes message when connection_string is null', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: null });

      render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(
          screen.getByText('We are out of codes to sign up! Please check again later.')
        ).toBeInTheDocument();
      });
    });

    it('renders out of codes message when connection_string is empty', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

      render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(
          screen.getByText('We are out of codes to sign up! Please check again later.')
        ).toBeInTheDocument();
      });
    });

    it('handles back button click and prevents event propagation', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });
      const mockStopPropagation = jest.fn();

      render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton, { stopPropagation: mockStopPropagation });

      waitFor(() => {
        expect(mockStopPropagation).toHaveBeenCalled();
        expect(screen.getByTestId('step-two')).toBeInTheDocument();
      });
    });

    it('verifies back button styling and props', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

      render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      const backButton = screen.getByText('Back');
      expect(backButton).toHaveStyle({ color: '#5F6368' });
      waitFor(() => {
        expect(backButton.parentElement).toHaveStyle({ marginTop: '0px' });
      });
    });

    it('maintains consistent rendered output with valid connection_string', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

      const { container } = render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="qrcode"]')).toMatchSnapshot();
      });
    });

    it('maintains consistent rendered output with falsy connection_string', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

      const { container } = render(
        <StartUpModal
          closeModal={mockCloseModal}
          buttonColor="primary"
          dataObject={mockDataObject}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="qrcode"]')).toMatchSnapshot();
      });
    });
  });

   describe('getConnectionCode functionality', () => {
    it('should not call API when user is logged in (ui.meInfo exists)', async () => {
      (useStores as jest.Mock).mockReturnValue({
        ui: {
          meInfo: { id: 'user123' },
          setShowSignIn: mockSetShowSignIn
        }
      });

      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      expect(api.get).not.toHaveBeenCalled();
    });

    it('should not call API when connection string already exists', async () => {
      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'existing-connection-code' });

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      fireEvent.click(screen.getByText('Back'));

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('should fetch and set connection string when conditions are met', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ 
        connection_string: 'new-code-123' 
      });

      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      expect(api.get).toHaveBeenCalledWith('connectioncodes');
      await waitFor(() => {
        expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      });
    });

    it('should handle API response without valid connection string', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(screen.getByText('We are out of codes to sign up! Please check again later.')).toBeInTheDocument();
      });
    });

    it('should handle API errors appropriately', async () => {
      // Track API call count
      let apiCallCount = 0;
      const expectedErr = new Error('Network failure');
      
      // Mock API to simulate failure
      (api.get as jest.Mock).mockImplementation(() => {
        apiCallCount++;
        return Promise.reject(expectedErr);
      });
      
      // Suppress the expected console error from the rejected promise
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      // Click the button that triggers the API call
      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      // Wait for the component to render the error state
      await waitFor(() => {
        // Verify error message is displayed (UI error handling)
        expect(screen.getByText('We are out of codes to sign up! Please check again later.')).toBeInTheDocument();
      });
      
      // Verify API was called exactly once
      expect(apiCallCount).toBe(1);
      
      // Verify QR code container exists but success message doesn't
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      expect(screen.queryByText('Install the Sphinx app on your phone and then scan this QRcode')).not.toBeInTheDocument();
      
      // Restore console.error
      console.error = originalConsoleError;
    });

    it('should handle asynchronous API responses', async () => {
      (api.get as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => 
            resolve({ connection_string: 'delayed-code-456' }), 
            50
          )
        )
      );

      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      });
    });

    it('should maintain connection string state and prevent subsequent API calls', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ 
        connection_string: 'first-code' 
      });

      render(
        <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Back'));

      await act(async () => {
        fireEvent.click(screen.getByText('Reveal Connection Code'));
      });

      expect(api.get).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      });
    });
  });
});
